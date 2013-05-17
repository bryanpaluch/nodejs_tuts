var http = require('http');

http.createServer(function (req, res){
  console.log('Server hit!, responding!');
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('Hello World\n');
}).listen(3000);

console.log('server listening on 3000');
