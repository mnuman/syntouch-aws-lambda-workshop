const AWS = require('aws-sdk');
const util = require('util');

exports.handler = (event, context, callback) => {
    console.log(util.inspect(event, { showHidden: true, depth: null }));
    const S3 = new AWS.S3();
    const bucket = event.Records[0].s3.bucket.name;
    const filekey = event.Records[0].s3.object.key;

    var params = {
      Bucket: bucket,
      Key: filekey
     };    

    S3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log("File size: " + data.ContentLength);
        };
    });
    callback();
};
