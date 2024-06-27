from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader, S3FileLoader
from fastapi import UploadFile
from qdrant_client import QdrantClient, models
from langchain_qdrant import Qdrant
from decouple import config
import os
os.environ['USER_AGENT'] = 'my-crawler/1.0'
qdrant_api_key = config('QDRANT_API_KEY')
qdrant_url = config('QDRANT_URL')

client = QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key
)

# vector_store = Qdrant(
#     client=client, 
#     collection_name=collection_name,
#     embeddings=OpenAIEmbeddings(api_key=config('OPENAI_API_KEY'))
#     )

def create_vector_store(collection_name:str):
    vector_store = Qdrant(
        client=client, 
        collection_name=collection_name,
        embeddings=OpenAIEmbeddings(api_key=config('OPENAI_API_KEY'))
        )
    return vector_store

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, 
    chunk_overlap=100, 
    length_function=len
    )

def create_collection(collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=1536,
            distance=models.Distance.COSINE,
            # datatype=models.DataType.UINT8
        )
    )

def delete_qdrant_collection(collection_name:str):
    try:
        client.delete_collection(collection_name=collection_name)
        return {"success":True,"message":f"Collection {collection_name} deleted successfully"}
    except Exception as e:
        return {"success":False,"message":f"Failed to delete collection {collection_name}: {e}"}
 

def upload_website_to_collection(url: str, collection_name: str):
    try:
        loader = WebBaseLoader(url)
        docs = loader.load_and_split(text_splitter)
        for doc in docs:
            doc.metadata = {'source_url': url}
        create_collection(collection_name)
        vector_store = create_vector_store(collection_name)
        vector_store.add_documents(docs)
        return {"success":True,"message":f"Successfully uploaded {url} to collection"}
    except Exception as e:
        return {"success":False,"message":f"Failed to upload documents from {url}: {e}"}


def upload_pdf_to_collection( collection_name:str, filename:str,key:str):
    try:  
        loader = S3FileLoader(
            bucket=config('S3_BUCKET'),
            key=key,
            # verify=False,
            mode='paged',
            aws_access_key_id=config('AWS_ACCESS_KEY_ID'), aws_secret_access_key=config('AWS_SECRET_ACCESS_KEY'),
            region_name=config('AWS_REGION')
        )
        docs = loader.load_and_split(text_splitter)     
        for doc in docs:
            doc.metadata = {'source_url': filename}
        create_collection(collection_name)
        vector_store = create_vector_store(collection_name)
        vector_store.add_documents(docs)
        return {"success":True,"message":f"Successfully uploaded {filename} to collection"}
    except Exception as e:
        return {"success":False,"message":f"Failed to upload {filename} to collection: {e}"}

# create_collection(collection_name)
# upload_website_to_collection('https://hamel.dev/blog/posts/evals/')