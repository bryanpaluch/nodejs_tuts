var http = require('http');
var fs = require('fs');

http.createServer(function (req, res){
  console.log('Server hit!, responding!');
  res.writeHead(200, {'Content-Type':'text/plain'});
  fs.readFile('/etc/hosts',{encoding: 'utf8'}, function(err, data){
    res.end(data);
  });
}).listen(3000);

console.log('server listening on 3000');
