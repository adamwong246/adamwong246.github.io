const mkdirp = require('mkdirp')
const fse = require('fs-extra');

module.exports = {
  readfile: (file) => {
    const relativeFilePath = './' + file;
    console.log("\u001b[31m <-- \u001b[0m" + file)
    return fse.readFileSync(file, 'utf8');

  }, options: {
    outFolder: 'dist',
    inFolder: 'src'
  },

  writefile: (file, contents) => {
    const relativeFilePath = './' + file;

    if (typeof contents === "function") {
      console.log("\u001b[33m ... \u001b[0m" + relativeFilePath)
      contents((err, res) => {
        fse.outputFile(relativeFilePath, res);
        console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
      })
    } else {
        fse.outputFile(relativeFilePath, contents);
        console.log("\u001b[32m --> \u001b[0m" + relativeFilePath)
    }

  }, options: {
    outFolder: 'dist',
    inFolder: 'src'
  }
}
