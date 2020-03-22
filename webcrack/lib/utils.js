const mkdirp = require('mkdirp')
const fse = require('fs-extra');

module.exports = {
  readfile: (file) => {
    const relativeFilePath = './' + file;
    console.log("\u001b[31m <- \u001b[0m" + file)
    return fse.readFileSync(file, 'utf8');
  }, options: {
    outFolder: 'dist',
    inFolder: 'src'
  },

  writefile: (file, contents) => {
    const relativeFilePath = './' + file;
    console.log("\u001b[32m -> \u001b[0m" + relativeFilePath)

    fse.outputFile(relativeFilePath, contents);
  }, options: {
    outFolder: 'dist',
    inFolder: 'src'
  }
}
