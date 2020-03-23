const fs = require("fs")
const jpeg = require('jpeg-js');

var jpegData = fs.readFileSync('./src/blogEntries/8/roboWarrior.jpg', null);
var rawImageData = jpeg.decode(jpegData);
// console.log(rawImageData);

// var jpegImageData = jpeg.encode(rawImageData, 50);
// console.log(jpegImageData);

//
// var width = 320, height = 180;
// var frameData = new Buffer(width * height * 4);
// var i = 0;
// while (i < frameData.length) {
//   frameData[i++] = 0xFF; // red
//   frameData[i++] = 0x00; // green
//   frameData[i++] = 0x00; // blue
//   frameData[i++] = 0xFF; // alpha - ignored in JPEGs
// }
// var rawImageData = {
//   data: frameData,
//   width: width,
//   height: height
// };


var jpegImageData = jpeg.encode(rawImageData, 50).data

fs.writeFileSync("./image.jpg", jpegImageData);
