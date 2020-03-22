http = require('http');
sstatic = require('node-static');

module.exports = (port, path) => {
  console.log(`serving from ${path} on port ${port}`);
  http.createServer(function(req, res) {
    return new sstatic.Server(path).serve(req, res);
  }).listen(port);
}
