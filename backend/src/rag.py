from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_openai import ChatOpenAI
from operator import itemgetter
from decouple import config
from src.qdrant import create_vector_store
from langchain_groq import ChatGroq


model = ChatOpenAI(
  model_name='gpt-4-turbo-preview',
  openai_api_key=config('OPENAI_API_KEY'),
  temperature=0.2
)

groq_chat = ChatGroq(temperature=0.2, groq_api_key=config('GROQ_API_KEY'), model_name="mixtral-8x7b-32768")

prompt_template = """
Answer the question based on the context, in a concise manner, in markdown and using bullet points where applicable.

Context: {context}
Question: {question}
Answer:
"""

prompt = ChatPromptTemplate.from_template(prompt_template)


def create_chain(collection_name:str):
  vector_store = create_vector_store(collection_name)
  retriever = vector_store.as_retriever()
  chain=(
    {
      "context":retriever.with_config(top_k=4),
      "question":RunnablePassthrough()
    }
    |RunnableParallel({
      "response": prompt|groq_chat,
      "context":itemgetter("context")
    }))
  return chain

def get_answer_and_docs( collection_name:str,question:str):
  chain = create_chain(collection_name)
  response = chain.invoke(question)
  answer = response["response"].content
  context = response["context"]
  return {
    "answer":answer,
    "context":context
  }

async def get_answer_and_docs_async(collection_name:str,question:str):
  chain = create_chain(collection_name)
  async for event in chain.astream_events(question, version="v1"):
    event_type = event["event"]
    if event_type == "on_retriever_end":
      yield {
        "event_type":event_type,
        "content": [doc.dict() for doc in event["data"]["output"]["documents"]]
      }
    elif event_type == "on_chat_model_stream":
      yield {
        "event_type":event_type,
        "content":event["data"]["chunk"].content
      }
  yield {
    "event_type":"done",
  }

# response = get_answer_and_docs("What is the author of this article?")

# print(response)
  