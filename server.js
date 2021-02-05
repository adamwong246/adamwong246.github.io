http = require('http');
sstatic = require('node-static');


console.log(`serving from dist on port 8000`);
http.createServer(function(req, res) {
  return new sstatic.Server('./dist').serve(req, res);
}).listen(8000);
