const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended: false});
const multer = require('multer');
const path = require('path');
var names = "";

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + Math.floor((Math.random() * 10) + 1) + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 12000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).array('myImage',4); // 4 is the maximum number of photos to be uploaded.

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
    console.log(req.files)
      if(err){
        res.end();
      } else {
        for(var i = 0; i < req.files.length; i++){
            if(req.files[i] != null) {names += req.files[i].filename + ","}
          }
        return res.json(req.files);
      }
    });
  });

router.get("/user_login", (req, res) => {
    console.log("Logging in with user credientials....");
    const {username, password} = req.query;
    const connection = getConnection()
    const queryString = `SELECT * FROM user WHERE User_Username = '${username}' and User_Password = '${password}'`
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Failed to query for users: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get("/admin_login", (req, res) => {
    console.log("Logging in with admin credientials....");
    const {username, password} = req.query;
    const connection = getConnection()
    const queryString = `SELECT * FROM admin WHERE Admin_Username = '${username}' and Admin_Password = '${password}'`
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Failed to query for admins: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get("/manager_login", (req, res) => {
    console.log("Logging in with manager credientials....");
    const {username, password} = req.query;
    const connection = getConnection()
    const queryString = `SELECT * FROM manager WHERE Manager_Username = '${username}' and Manager_Password = '${password}'`
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Failed to query for managers: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get("/user_social_login", (req, res) => {
    console.log("Searching user table with provided credentials...");
    const {googleid, facebookid} = req.query;
    const connection = getConnection()
    const queryString = `SELECT User_ID, User_Username, User_Email FROM user WHERE User_Google_ID = '${googleid}' or User_Facebook_ID = '${facebookid}'`
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Social media login credentials not valid for users: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get("/admin_social_login", (req, res) => {
    console.log("Searching admin table with provided credentials...");
    const {googleid, facebookid} = req.query;
    const connection = getConnection()
    const queryString = `SELECT Admin_ID, Admin_Username, Admin_Email FROM admin WHERE Admin_Google_ID = '${googleid}' or Admin_Facebook_ID = '${facebookid}'`
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Social media login credentials not valid for admins: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get("/manager_social_login", (req, res) => {
    console.log("Searching manager table with provided credentials...");
    const {googleid, facebookid} = req.query;
    const connection = getConnection()
    const queryString = `SELECT Manager_ID, Manager_Username, Manager_Email FROM manager WHERE Manager_Google_ID = '${googleid}' or Manager_Facebook_ID = '${facebookid}'`
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Social media login credentials not valid for managers: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get("/expenses/:id", (req, res) => {
    console.log("Fetching expenses with id: " + req.params.id)

    const connection = getConnection()

    const userId = req.params.id
    const queryString = "SELECT * FROM report WHERE User_ID = ?"
    connection.query(queryString, [userId], (err, rows, fields) => {
        if(err){
            console.log("Query failed:" + err)
            return res.sendStatus(500)
        }

        console.log("Fetched expenses successfully!")
        return res.json(rows)
    })
})

router.post('/deleteexpense', urlencodedParser, function(req, res) {
    console.log("Attempting to delete an expense...")
	  
    const queryString = "DELETE FROM report WHERE Report_ID = ?"
  
    getConnection().query(queryString, [req.body.id], function (err, results, fields) {
        if(err) {
            console.log("Failed to delete expense" + err)
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record(s) was deleted!");
        res.end()
    })
    res.end()
  })

router.get("/adminexpenses/:id", (req, res) => {
    console.log("Fetching admin expenses with id: " + req.params.id)
    const connection = getConnection()
    const userId = req.params.id
    const queryString = "SELECT Admin_ID, report.User_ID, report_ID, Date_of_Submission, Reciept, Expense_Desc, Category, Client_Name, Client_Project, Billable, Payment_Method, Amount, Evidence FROM user, report WHERE user.User_ID = report.User_ID AND Admin_Id = ?"
    connection.query(queryString, [userId], (err, rows, fields) => {
        if(err){
            console.log("Query failed:" + err)
            return res.sendStatus(500)
        }
        console.log("Fetched admin expenses successfully!")
        return res.json(rows)
    })
})

router.post('/addexpense', urlencodedParser, function(req, res) {
    console.log("Trying to add a new expense...")
    let evidence = null;
    if(names != "") {evidence = names.substring(0, (names.length - 1))}
	var params = [req.body.userId,req.body.reportId,req.body.subdate,req.body.reciept,req.body.desc,req.body.category,req.body.clientname,req.body.clientproject,req.body.bill,req.body.paymeth,req.body.amount, evidence];
  
    const queryString = "INSERT INTO report (User_ID, Report_ID, Date_of_Submission, Reciept, Expense_Desc, Category, Client_Name, Client_Project, Billable, Payment_Method, Amount, Evidence) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
  
    getConnection().query(queryString, params, function (err, results, fields) {
        if(err) {
            console.log("Failed to insert new expense:" + err)
            names = "";
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record(s) was added!");
        names = "";
        res.end()
    })
    res.end()
  })

  router.post('/addcategory', urlencodedParser, function(req, res) {
    console.log("Trying to add a new category...")
    const queryString = "INSERT INTO category VALUES (?)"
  
    getConnection().query(queryString, [req.body.category], function (err, results, fields) {
        if(err) {
            console.log("Failed to insert a new category:" + err)
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record(s) was added!");
        res.end()
    })
    res.end()
  })

  router.post('/addproject', urlencodedParser, function(req, res) {
    console.log("Trying to add a new project...")
    var params = [req.body.projectid, req.body.projectname, req.body.clientname];
    const queryString = "INSERT INTO project (Project_ID, Project_Name, Client_Name) VALUES (?,?,?)"
  
    getConnection().query(queryString, params, function (err, results, fields) {
        if(err) {
            console.log("Failed to insert a new project:" + err)
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record(s) was added!");
        res.end()
    })
    res.end()
  })

  router.post('/archiveexpense', urlencodedParser, function(req, res) {
    console.log("Copying expense into archive table...")
	var params = [req.body.userId,req.body.reportId,req.body.subdate,req.body.reciept,req.body.desc,req.body.category,req.body.clientname,req.body.clientproject,req.body.bill,req.body.paymeth,req.body.amount];
  
    const queryString = "INSERT INTO archive (User_ID, Report_ID, Date_of_Submission, Reciept, Expense_Desc, Category, Client_Name, Client_Project, Billable, Payment_Method, Amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  
    getConnection().query(queryString, params, function (err, results, fields) {
        if(err) {
            console.log("Failed to move expense into archive table:" + err)
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record moved into archive table.");
        res.end()
    })
    res.end()
  })

  router.get("/maxprojectid/", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT MAX(Report_ID) AS Report_ID FROM report"
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Query failed:" + err)
            return res.sendStatus(500)
        }
        console.log("Retrived project information successfully!")
        return res.json(rows)
    })
})

router.get("/users/", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT user_username, user_id, user_email FROM user"
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Query failed:" + err)
            return res.sendStatus(500)
        }
        console.log("Retrived users successfully!")
        return res.json(rows)
    })
})

router.get("/projects/", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT Project_Name, Client_Name FROM project"
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Query failed:" + err)
            return res.sendStatus(500)
        }
        console.log("Retrived project information successfully!")
        return res.json(rows)
    })
})

router.get("/categories/", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT * FROM category"
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Query failed:" + err)
            return res.sendStatus(500)
        }
        console.log("Retrieved category information successfully!")
        return res.json(rows)
    })
})

router.post('/updateexpense', urlencodedParser, function(req, res) {
    console.log("Trying to update expense report...")
    params = [req.body.date,req.body.reciept,req.body.description,req.body.category,req.body.client,req.body.project,req.body.payment,req.body.amount,req.body.report_id];
    const queryString = "UPDATE report SET Date_of_Submission = ?, Reciept = ?, Expense_Desc = ?, Category = ?, Client_Name = ?, Client_Project = ?, Payment_Method = ?, Amount = ? WHERE Report_ID = ?"
  
    getConnection().query(queryString, params, function (err, results, fields) {
        if(err) {
            console.log("Failed to update existing report:" + err)
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record was updated!");
        res.end()
    })
    res.end()
  })

  router.post('/profile', urlencodedParser, function(req, res) {
    console.log("Trying to update existing profile");
    const table = req.body.table;
    const user_column = req.body.username_col;
    const pass_column = req.body.password_col;
    const google_column = req.body.google_col;
    const facebook_column = req.body.facebook_col;
    const email_column = req.body.email_col;
    const id_column = req.body.id_col;
    params = [req.body.username,req.body.password,req.body.google,req.body.facebook,req.body.email,req.body.id];
    const queryString = "UPDATE " + table + " SET " + user_column + "= ?, " + pass_column + "= ?, " + google_column + "= ?, " + facebook_column + " = ?, " + email_column + " = ? WHERE " + id_column + " = ?"
  
    getConnection().query(queryString, params, function (err, results, fields) {
        if(err) {
            console.log(queryString);
            console.log("Failed to update existing account:" + err)
            return res.sendStatus(500)
        }
        console.log(results.affectedRows + " record was updated!");
        res.end()
    })
    res.end()
  })


const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-03.cleardb.net',
    user: 'b64fbcbeb81ae0',
    password: '903dcf50',
    database: 'heroku_ebed775274bf25d'
})

function getConnection(){
    return pool
}

module.exports = router