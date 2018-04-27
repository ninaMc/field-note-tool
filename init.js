var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
  multipleStatements: true	
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
  connection.query("CREATE DATABASE IF NOT EXISTS fieldnotes_tool", function (err, result) {
      if (err) throw err;
      console.log("Database created");
    });
	
	connection.query('USE fieldnotes_tool');
	
	//create _projects and _fieldnotes 
	var sql_projects = "CREATE TABLE IF NOT EXISTS _projects (id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))";
	  connection.query(sql_projects, function (err, result) {
	    if (err) throw err;
	    console.log("projects table created");
	  });
	  var sql_fieldnotes = "CREATE TABLE IF NOT EXISTS _fieldnotes (timestmp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fieldnote TEXT, upload VARCHAR(256) NOT NULL, upload_path VARCHAR(500) NOT NULL, upload_type VARCHAR(500) NOT NULL, imgW INT(100) NOT NULL, imgH INT(100) NOT NULL, keywords TEXT NOT NULL, projectID INT(11) NOT NULL, tag INT(11) NOT NULL)";
  	  connection.query(sql_fieldnotes, function (err, result) {
  	    if (err) throw err;
  	    console.log("fieldnotes table created");
  	  });
	  
	  connection.query("ALTER TABLE _fieldnotes ADD PRIMARY KEY (timestmp)", function(err,result){
		   if (err) throw err;
		   console.log("set primary key");
	  });
	  
	  //insert sample project, fieldnotes
	  connection.query("INSERT INTO `_projects` (`id`, `name`) VALUES (1, 'sample project')",function(err,result){
	  	if (err) throw err;
		console.log("added sample project");
	  });
	  
	  connection.query("INSERT INTO `_fieldnotes` (`timestmp`, `fieldnote`, `upload`, `upload_path`, `upload_type`, `imgW`, `imgH`, `keywords`, `projectID`, `tag`) VALUES ('2017-04-27 18:19:29', 'Beginning the project!', '', '', '', 0, 0, 'start date!', 1, 0),('2017-10-27 18:20:06', 'something super interesting that we realized as a result of a workshop that we conducted...', '', '', '', 0, 0, 'major insight!', 1, 0),('2017-11-20 18:41:43', 'dog!', 'dog.jpg', 'files/dog.jpg', '', 5760, 3840, 'dog', 1, 0),('2018-04-27 18:19:29', 'Ending the project!', '', '', '', 0, 0, 'end date!', 1, 0)",function(err,result){
	  	if (err) throw err;
		console.log("added sample fieldnotes");
	  });
	  
});

