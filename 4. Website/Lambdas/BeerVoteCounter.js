'use strict';

console.log('Loading function');
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

const AWS = require('aws-sdk');
const s3 = new AWS.S3(); 

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    var writeResultsToS3 = (err, results) => {
        if ( err ) {
            console.log(err, err.stack);
            callback(err, 'There was an error');
        } else {
            console.log(results);
            var params = {Bucket: 'milco-beer-website', Key: 'data.json', Body: JSON.stringify(results.Items)};
            s3.upload(params, callback);
        }
    };
    
    dynamo.scan({ TableName: 'BeerStyleVotes', ConsistentRead: true }, writeResultsToS3);
    
};