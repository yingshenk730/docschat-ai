from fastapi import FastAPI, WebSocket, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from src.rag import get_answer_and_docs, get_answer_and_docs_async
from src.qdrant import upload_website_to_collection, upload_pdf_to_collection,delete_qdrant_collection
from src.aws_service import upload_pdf_to_s3, save_rag_history, check_record_exsit_from_db,get_user_rag_history,delete_db_record, delete_pdf_from_s3
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from decouple import config
from starlette.middleware.sessions import SessionMiddleware
from src.auth_router import router as auth_router
import json
import uuid
from modal import Image,App, asgi_app, Secret
app = App('docschat-backend')
app.image = Image.debian_slim().poetry_install_from_file('./pyproject.toml')
@app.function(secrets=[Secret.from_dotenv()])
@asgi_app()
def endpoint():
    app = FastAPI(
    title='DocsChatAI API',
    description='DocsChat.AI API is a RESTful API that allows you to interact with the RAG model and Qdrant database. You can chat with the RAG model, index a website or a pdf file to the Qdrant database, and get user RAG history. The API is secured with JWT authentication.',
    version='0.1',
    )
    origins = [
        "http://localhost:5173",
        config('FRONTEND_URL')
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.add_middleware(SessionMiddleware, secret_key="!secret")

    class Message(BaseModel):
        message: str

    class URL(BaseModel):
        url: str

    class FileInfo(BaseModel):
        file_name: str
        type: str

    class RagRecord(BaseModel):
        userId: str
        source: str
        collection_name: str
        type: str
        timestamp: int

    @app.websocket('/async_chat/{collection_name}')
    async def async_chat(collection_name:str,websocket: WebSocket):
        await websocket.accept()
        while True:
            question = await websocket.receive_text()
            async for event in get_answer_and_docs_async(collection_name,question):
                if event["event_type"] == "done":
                    await websocket.close()
                    return
                else:
                    await websocket.send_text(json.dumps(event))
            

    @app.post('/chat', description="Chat with the RAG API through this endpoint")
    def chat(req: Message):
        response = get_answer_and_docs(req.message)
        response_content = {
            "question": req.message,
            'answer': response['answer'],
            'documents': [doc.dict() for doc in response['context']]
        } 
        return JSONResponse(content=response_content, status_code=200)

    @app.post('/{userId}/url-indexing', description="Index a website to the Qdrant collection")
    def url_indexing(userId:str,req: URL):
        try:
            record_number= check_record_exsit_from_db(userId, req.url)
            if record_number == 0:
                collection_name = str(uuid.uuid4())
                response = save_rag_history(userId, req.url, collection_name, "website")
                if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                    res_qdrant = upload_website_to_collection(req.url, collection_name)
                    if res_qdrant['success']:
                        return JSONResponse(content={"message": res_qdrant['message']}, status_code=200)
                    else:
                        raise HTTPException(status_code=400, detail="Error uploading pdf to Qdrant")
                else:
                    raise HTTPException(status_code=400, detail="Error saving item to table")
            return JSONResponse(content={"message": "Url already exsits, please check your record"}, status_code=200)
        except Exception as e:
            return JSONResponse(content={"message": f"Failed to index {req.url}: {e}"}, status_code=400)


    @app.post('/{userId}/pdf-indexing', description="Index a pdf file to the Qdrant collection")
    async def pdf_indexing(userId: str, pdf_file: UploadFile = File(...)):
        try:
            record_number = check_record_exsit_from_db(userId, pdf_file.filename)
            if record_number == 0:
                s3_key = f'{userId}/{pdf_file.filename}'
                res_s3 = await upload_pdf_to_s3(pdf_file, s3_key)
                if res_s3['success']:
                    collection_name = str(uuid.uuid4())
                    res_qdrant = upload_pdf_to_collection(collection_name, pdf_file.filename, s3_key)
                    if res_qdrant['success']:
                        response = save_rag_history(userId, pdf_file.filename, collection_name, "pdf")
                        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                            return JSONResponse(content={"message": res_qdrant['message']}, status_code=200)
                        else:
                            raise HTTPException(status_code=400, detail="Error saving item to table")
                    else:
                        raise HTTPException(status_code=400, detail="Error uploading pdf to Qdrant")
                else:
                    raise HTTPException(status_code=400, detail="Error uploading pdf to S3")
            else:
                return JSONResponse(content={"message": "PDF already exists, please check your record"}, status_code=409)
        except Exception as e:
            return JSONResponse(content={"message": f"Failed to index {pdf_file.filename}: {str(e)}"}, status_code=400)
        

    @app.get('/{userId}/rag-history', description="Get user RAG history", response_model=list[RagRecord])
    def user_rag_history(userId:str):   
        return get_user_rag_history(userId)

    @app.delete('/{userId}/collection/{collection_name}', description="Delete user RAG history")
    def delete_user_rag_record(userId:str,collection_name:str, req:FileInfo):
        try:
            print("req:", req)
            response = delete_qdrant_collection( collection_name)
            if not response['success']:
                raise HTTPException(status_code=400, detail="Error deleting record from Qdrant")  
            res_db = delete_db_record(userId,collection_name)
            if not res_db['success']:
                raise HTTPException(status_code=400, detail="Error deleting record from DB")
            if req.type == "pdf":
                s3_key = f'{userId}/{req.file_name}'
                res_s3 = delete_pdf_from_s3(s3_key)
                if not res_s3['success']:
                    raise HTTPException(status_code=400, detail="Error deleting file from S3")    
            return JSONResponse(content={"message": 'Record is deleted!'}, status_code=200)
                
        except Exception as e:
            return JSONResponse(content={"message": f"Failed to delete record {collection_name}: {e}"}, status_code=400)

    return app            




