var express = require('express');
var path = require('path');
var mysql = require('mysql');
var app = express();
var time = require('express-timestamp');
var multer  = require('multer');
var fs = require('fs');

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
var pID = 1;

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
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
	//console.log(rows);
    res.render('timeline',{projects:rows[0],fieldnotes:rows[1], timestmp:moment.tz("America/Boise").format(), projectID:pID});
  });
});


app.post('/submit', upload.array('upload'), function(req, res, next){
	console.log("submitted");
	console.log(req.files);
	var fname=[];
	var fpath=[];
	var ftype=[];
	var _imgW=[];
	var _imgH=[];
	/*if(req.files.length!=0){
		console.log(req.files);
		fname=req.files[0].originalname;
		fpath=req.files[0].path;
		ftype=req.files[0].mimetype;
		var dims = sizeOf(req.files[0].path);
		var _imgW=dims.width;
		var _imgH=dims.height;
	}*/
		var uploads = [];
		for(i in req.files){
			console.log(req.files[i]);
			fname.push(req.files[i].originalname);
			fpath.push(req.files[i].path.replace("public/",""));
			ftype.push(req.files[i].mimetype);
			var dims = sizeOf(req.files[i].path);
			uploads.push("{\"name\":\""+req.files[i].originalname+"\",\"path\":\""+req.files[i].path.replace("public/","")+"\",\"type\":\""+req.files[i].mimetype+"\",\"imgW\":\""+dims.width+"\",\"imgH\":\""+dims.height+"\"}");
		}	
		
		console.log("objects");
		console.log(uploads);
		console.log("end objects");
		console.log(fpath);
	
	var note =
	{timestmp:req.body.timestmp,
		fieldnote:req.body.fieldnote,
		upload:"["+uploads+"]",
		upload_path:"",
		upload_type:"",
		imgW:"",
		imgH:"",
		keywords:req.body.keywords,
		projectID:req.body.projID,
		tag:""
	}
	
	pID = req.body.projID;
	
	console.log(note);
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
	
	pID = req.body.projID;
	
	res.redirect('/');
});

app.post('/backup', function(req, res){
	console.log("new backup");
	
    var moment = req.timestamp;	
    //console.log(moment.tz("America/Boise").format());
    connection.query('SELECT * FROM _projects;SELECT * FROM _fieldnotes', function(err, rows){
	var bk = JSON.stringify(rows)
	//write backup to backupfolder
	fs.writeFile('public/backups/'+moment.tz("America/Boise").format()+'.txt', bk, function (err) {
	  if (err) return console.log(err);
	  console.log('backup successfully created!');
	});
});
	
	res.redirect('/');
});


app.post('/updatenote', upload.array('upload'), function(req, res, next){
	console.log("updated record");
	console.log(req.files);
	var fname=[];
	var fpath=[];
	var ftype=[];
	var _imgW=[];
	var _imgH=[];
		
		var new_uploads = [];
		for(i in req.files){
			console.log(req.files[i]);
			fname.push(req.files[i].originalname);
			fpath.push(req.files[i].path.replace("public/",""));
			ftype.push(req.files[i].mimetype);
			var dims = sizeOf(req.files[i].path);
			new_uploads.push("{\"name\":\""+req.files[i].originalname+"\",\"path\":\""+req.files[i].path.replace("public/","")+"\",\"type\":\""+req.files[i].mimetype+"\",\"imgW\":\""+dims.width+"\",\"imgH\":\""+dims.height+"\"}");
		}	
		
		var uploads;
		if(new_uploads.length > 0){
			uploads = new_uploads;
			
		}else{
			uploads = req.body.curr_uploads.replace("[","").replace("]","");
		}
		
		console.log("objects");
		console.log(uploads);
		console.log("end objects");
		console.log(fpath);
		
		console.log("now:"+req.body.curr_uploads);
		
		console.log(req.body.timestmp);
	
	var note =
	{timestmp:req.body.timestmp,
		fieldnote:req.body.fieldnote,
		upload:"["+uploads+"]",
		upload_path:"",
		upload_type:"",
		imgW:"",
		imgH:"",
		keywords:req.body.keywords,
		projectID:req.body.projID,
		tag:""
	}
	
	pID = req.body.projID;
	
	console.log(note);
	console.log(req.body);
	var sql = 'UPDATE _fieldnotes SET ? WHERE timestmp= ?';
	connection.query(sql, [note,req.body.timestmp], function(err,res){
		if(err)throw err;
	});
	res.redirect('/');
});



app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));