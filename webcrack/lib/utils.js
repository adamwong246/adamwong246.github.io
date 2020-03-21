fs = require('fs')

const logReadFile = (f) => console.log("<- " + f);

module.exports = {
  logReadFile: logReadFile,
  logWriteFile:logWriteFile = (f) => console.log("-> " + f),
  logSkipFile: logSkipFile = (f) => false,
  readfile: (file) => {
    logReadFile(file)
    return fs.readFileSync('./' + file, 'utf8');
  }, options: {
    outFolder: 'dist',
    inFolder: 'src'
  }
}
