const async = require('async');
const AWS = require('aws-sdk');
const jimp = require('jimp');
const S3 = new AWS.S3();

function downloadS3Object(S3Params, callback){
  console.time('S3GetObject');
  S3.getObject(S3Params, callback);
  console.timeEnd('S3GetObject');
}

function loadImageFromFile(S3Object, callback){
  console.time('loadImageFromFile');
  jimp.read(S3Object.Body, callback);
  console.timeEnd('loadImageFromFile');
}


function imageToBuffer(image, callback){
  console.time('imageToBuffer');
  image.getBuffer(jimp.AUTO, callback);
  console.timeEnd('imageToBuffer');
}

function uploadS3Object(params, image, next){
  console.time('uploadS3Object');
  // augment params for request
  params.Key = 'transformed/' + params.Key.split('/')[1];
  params.Body = image;
  params.ContentType = 'image/jpeg';  // specify the mime type for easy access
  params.ACL = 'public-read';         // set public access for browser viewing
  S3.putObject(params, next);
  console.timeEnd('uploadS3Object');
}

function handleError(err, next){
  if (err){
      console.log('Error:', err);
      throw(err);
  } else
    console.log('All OK');
}

/* Miscellaneous transformation functions, see Python examples at https://t04glovern.github.io/2016/01/python-image-manipulation
 * Image is represented as RGB+A, A=opacity/translucency
 * Need to round the RGB values to integers, must be < 256
 * Invert   : (R,G,B,A) -> 255-R,255-G,255-B,A)
 * Grayscale: (R,G,B,A) -> g = sum(R,G,B)/3; (g,g,g,A)
 * Sepia    : (R,G,B,A) -> v = 0.3 * R + 0.59 * G + 0.11 * B;  (2*v, 1.5*v, v, A)
 * 
 *
 */
function invertImage(image, callback){
  console.time('invertImage');
  image.scan(0,0,image.bitmap.width, image.bitmap.height, (x,y,idx) => {
      image.bitmap.data[ idx + 0 ] = 255 - image.bitmap.data[ idx + 0 ]; // Red
      image.bitmap.data[ idx + 1 ] = 255 - image.bitmap.data[ idx + 1 ]; // Green
      image.bitmap.data[ idx + 1 ] = 255 - image.bitmap.data[ idx + 2 ]; // Blue
  }, callback);
  console.timeEnd('invertImage');
}

function grayImage(image, callback){
  console.time('grayImage');
  var val = 0;
  image.scan(0,0,image.bitmap.width, image.bitmap.height, (x,y,idx) => {
      val =  Math.round((image.bitmap.data[ idx + 0 ] + image.bitmap.data[ idx + 1 ] + image.bitmap.data[ idx + 2 ]) / 3);
      image.bitmap.data[ idx + 0 ] = val; // Red
      image.bitmap.data[ idx + 1 ] = val; // Green
      image.bitmap.data[ idx + 2 ] = val; // Blue
  }, callback);
  console.timeEnd('grayImage');
}

function sepia(image, callback){
  console.time('sepia');
  var val = 0;
  image.scan(0,0,image.bitmap.width, image.bitmap.height, (x,y,idx) => {
      val =  0.3 * image.bitmap.data[ idx + 0 ] + 0.59 * image.bitmap.data[ idx + 1 ] + 0.11 * image.bitmap.data[ idx + 2 ];
      image.bitmap.data[ idx + 0 ] = Math.min(Math.round(2*val),255);     // Red
      image.bitmap.data[ idx + 1 ] = Math.min(Math.round(1.5*val),255);;  // Green
      image.bitmap.data[ idx + 2 ] = Math.min(Math.round(val),255);;      // Blue
  }, callback);
  console.timeEnd('sepia');
}

exports.handler = (event, context, callback) => {
    const srcImage = { Bucket: event.Records[0].s3.bucket.name, 
                       Key: event.Records[0].s3.object.key
    };
    /*  using async constant to initialize download
     *  and apply to provide this argument to the upload as well
     */
    async.waterfall(
       [ async.constant(srcImage)
       , downloadS3Object
       , loadImageFromFile
       , sepia
       , imageToBuffer
       , async.apply(uploadS3Object, srcImage)
       ]
       , handleError
    );
};
