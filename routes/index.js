var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
	//res.sendFile(path.join(__dirname+'/index.html'));

  //res.render('index', { title: 'Express' });
/*
  fs.readFile('index.html', function(error, data){ // load index.html file
	  if(error){
		  console.log(error);
	  } else {
		  res.writeHead(200,{'Content-Type':'text/html'});
		  res.end(data);  //load html response
  });
*/

});

module.exports = router;

