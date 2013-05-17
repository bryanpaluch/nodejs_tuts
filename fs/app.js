var fs = require('fs');

fs.readFile('/etc/hosts',{encoding: 'utf8'}, function(err, data){
  console.log(data);
});

console.log('this outputs first');
