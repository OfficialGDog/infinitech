const express = require('express')
const mysql = require('mysql')
const router = express.Router()

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

router.post('/addexpense', (req, res) => {
    console.log("Trying to add a new expense...")
    const User_ID = req.body.userId
    const Date_Of_Submission = req.body.subdate
    const Reciept = req.body.reciept
    const Expense_Desc = req.body.desc
    const Category = req.body.category
    const Client_Name = req.body.clientname
    const Client_Project = req.body.clientproject
    const Billable = req.body.bill
    const Payment_Method = req.body.paymeth
    const Amount = req.body.amount
    const Evidence = req.body.evidence

    const queryString = "INSERT INTO report (User_ID, Date_of_Submission, Reciept, Expense_Desc, Category, Client_Name, Client_Project, Billable, Payment_Method, Amount, Evidence) VALUES (?,?,?,?,?,?,?,?,?,?,?)"

    getConnection().query(queryString, [User_ID, Date_Of_Submission, Reciept, Expense_Desc, Category, Client_Name, Client_Project, Billable, Payment_Method, Amount, Evidence], (err, results, fields) => {
        if(err) {
            console.log("Failed to insert new expense:" + err)
            return res.sendStatus(500)
        }
        console.log("Inserted a new expense with id: ", results.insertId)
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