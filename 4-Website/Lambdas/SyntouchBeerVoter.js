'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

const beervote = (payload, callback) => {
    
    var params = {
        Key: { 
            style: payload.style
        },
        TableName: 'BeerStyleVotes',
            AttributeUpdates: {
                counter: {
                    Action: 'ADD',
                    Value: 1
                }
            }
    };
    
    console.log('Casting Vote:', JSON.stringify(params, null, 2));
    
    dynamo.updateItem(params, (err, data) => {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
        
        callback(err, data);
    });
}

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '204',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    
    switch (event.httpMethod) {
        case 'POST':
            // body is sending "style=Weizen" objects, so just need to parse out the value after the equal sign!
            beervote({
                    "style" : event.body.split('=')[1]
                }, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};


