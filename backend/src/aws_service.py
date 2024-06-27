import boto3
from decouple import config 
import time

aws_config = {
    "aws_access_key_id": config('AWS_ACCESS_KEY_ID'),
    "aws_secret_access_key": config('AWS_SECRET_ACCESS_KEY'),
    "region_name": config('AWS_REGION')
}
s3_client = boto3.client('s3', **aws_config)

dynamodb = boto3.resource('dynamodb', **aws_config)
table = dynamodb.Table('rag_history') 


async def upload_pdf_to_s3(pdf_file,s3_key:str):
    file_content= await pdf_file.read()
    s3_client.put_object(Bucket=config('S3_BUCKET'), Key=s3_key, Body=file_content)
    return {"success": True, "message": f'File uploaded to S3: {s3_key}'}

def delete_pdf_from_s3(s3_key:str):
    try:
        response = s3_client.delete_object(Bucket=config('S3_BUCKET'), Key=s3_key)
        print("response:", response)
        if response['ResponseMetadata']['HTTPStatusCode'] == 204:
            return {"success": True, "message": f'File deleted from S3: {s3_key}'}
        else:
            return {"success": False, "message": f"Failed to delete file from S3: {s3_key}"}
    except Exception as e:
        print("Error deleting from S3:", str(e))
        return {"success": False, "message": f"Exception deleting file from S3: {str(e)}"}
  
def save_rag_history(userId:str, source:str,collection_name:str,type:str):
    table = dynamodb.Table('rag_history')  
    response = table.put_item(
        Item={
            'userId': userId,
            'source': source,
            'collection_name': collection_name,
            'type': type,
            'timestamp': int(time.time())
        }
    )
    return response

def check_record_exsit_from_db(userId:str, source:str):
    query_response = table.query(
            IndexName='userId-source-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('source').eq(source) & boto3.dynamodb.conditions.Key('userId').eq(userId)
        )
    print("query_response:", query_response)
  
    record_number = query_response['Count']
    return record_number


def get_user_rag_history(userId:str):
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(userId)
    )
    items = response['Items']
    return items

def delete_db_record(userId:str, collection_name:str):
    try:
        response = table.delete_item(
            Key={
                'userId': userId,  
                'collection_name': collection_name 
            }
        )
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return {"success": True, "message": f"Record {collection_name} deleted successfully"}
        else:
            return {"success": False, "message": f"Failed to delete record {collection_name}"}
    except Exception as e:
        print("Error deleting from DynamoDB:", str(e))
        return {"success": False, "message": f"Exception deleting record: {str(e)}"}

    