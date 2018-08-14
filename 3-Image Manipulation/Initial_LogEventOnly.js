const AWS = require('aws-sdk');
const util = require('util');

exports.handler = (event, context, callback) => {
    console.log(util.inspect(event, {showHidden: true, depth: null }));
    callback();
};
