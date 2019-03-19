const express = require('express')
const mysql = require('mysql')
const router = express.Router()

router.get("/users", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT * FROM users"
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Failed to query for users: " + err)
            return res.sendStatus(500)
        }
        return res.json(rows)
    })
})

router.get('/login', (req, res) => {
    console.log("Logging in with user credientials....")
    const queryString = "SELECT * FROM user WHERE (User_Username = ?) and (User_Password = ?)"
    getConnection().query(queryString, ['10gdavies', 'password'], (err, rows, fields) => {
        if(err) {
            console.log("Query Failed: " + err)
            return res.sendStatus(500);
        }
        console.log("Query Successfull");
        return res.json(rows)
    })
    res.end()
})

router.get("/user/:id", (req, res) => {
    console.log("Fetching user with id: " + req.params.id)

    const connection = getConnection()

    const userId = req.params.id
    const queryString = "SELECT * FROM users WHERE id = ?"
    connection.query(queryString, [userId], (err, rows, fields) => {
        if(err){
            console.log("Failed to query for users: " + err)
            return res.sendStatus(500)
        }

        console.log("I Think we fetched user succesffuly!")
 
        const users = rows.map((row) => {
            return {firstName: row.first_name, lastName: row.last_name}
        })

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