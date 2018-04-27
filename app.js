var express = require('express');
var path = require('path');
var mysql = require('mysql');
var app = express();
var time = require('express-timestamp');
var multer  = require('multer');



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/files/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage });
var sizeOf = require('image-size');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'um6N8lLn5tJVbl8s',
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
	multipleStatements: true	
});

connection.query('USE fieldnotes_tool');

app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(time.init);

app.get('/', function(req, res){
  var moment = req.timestamp;	
  //console.log(moment.tz("America/Boise").format());
  connection.query('SELECT * FROM _projects;SELECT * FROM _fieldnotes', function(err, rows){
	 // console.log(rows);
    res.render('timeline',{projects:rows[0],fieldnotes:rows[1], timestmp:moment.tz("America/Boise").format()});
  });
});


app.post('/submit', upload.array('upload'), function(req, res, next){
	console.log("submitted");
	var fname="";
	var fpath="";
	var ftype="";
	var _imgW="";
	var _imgH="";
	if(req.files.length!=0){
		console.log(req.files);
		fname=req.files[0].originalname;
		fpath=req.files[0].path;
		ftype=req.files[0].mimetype;
		var dims = sizeOf(req.files[0].path);
		var _imgW=dims.width;
		var _imgH=dims.height;
	}
	
	var note = 
	{timestmp:req.body.timestmp,
		fieldnote:req.body.fieldnote,
		upload:fname,
		upload_path:fpath.replace("public/",""),
		upload_type:ftype,
		imgW:_imgW,
		imgH:_imgH,
		keywords:req.body.keywords,
		projectID:req.body.projID,
		tag:req.body.tag
	}
	
	console.log(req.body);
	connection.query('INSERT INTO _fieldnotes SET ?', note, function(err,res){
		if(err)throw err;
	});
	res.redirect('/');
});

app.post('/newproj', upload.single(), function(req, res){
	//console.log("new project");
	var newP = {id:req.body.pid, name:req.body.name};
	//console.log(pname);
	connection.query('INSERT INTO _projects SET ?', newP, function(err,res){
		if(err)throw err;
		console.log("new project created");
	});
	res.redirect('/');
});


app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));