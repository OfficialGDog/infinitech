const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended: false});

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
            console.log("Failed to query for users: " + err)
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

router.post('/addexpense', urlencodedParser, function(req, res) {
    console.log("Trying to add a new expense...")
    console.log(req.body);
	var params = [req.body.userId,req.body.reportId,req.body.subdate,req.body.reciept,req.body.desc,req.body.category,req.body.clientname,req.body.clientproject,req.body.bill,req.body.paymeth,req.body.amount];
  
    const queryString = "INSERT INTO report (User_ID, Report_ID, Date_of_Submission, Reciept, Expense_Desc, Category, Client_Name, Client_Project, Billable, Payment_Method, Amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  
    getConnection().query(queryString, params, function (err, results, fields) {
        if(err) {
            console.log("Failed to insert new expense:" + err)
            return res.sendStatus(500)
        }
        console.log("Inserted a new expense")
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