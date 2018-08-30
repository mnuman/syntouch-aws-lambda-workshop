import json
import requests
def lambda_handler(event, context):
    print(json.dumps(event))
    body = json.loads(event['body'])

    myMessage = f"Hi, {body['head_commit']['author']['name']} has just committed code at {body['head_commit']['url']} with message {body['head_commit']['message']}"
    
    return {
        "isBase64Encoded" : "false",
        "statusCode" : 200,
        "headers" : {},
        "body" : json.dumps(myMessage)
    }