const express = require('express')
const mysql = require('mysql')
const router = express.Router()
router.get('/messages', (req, res) => {
    console.log("Show some messages or whatever...")
    res.end()
})

router.get("/users", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT * FROM users"
    connection.query(queryString, (err, rows, fields) => {
        if(err){
            console.log("Failed to query for users: " + err)
            res.sendStatus(500)
            return
        }
        res.json(rows)
    })
})

router.post('/user_create', (req, res) => {
    console.log("Trying to create a new user....")
    const firstName = req.body.create_first_name
    const lastName = req.body.create_last_name

    const queryString = "INSERT INTO users (first_name, last_name) VALUES (?, ?)"
    getConnection().query(queryString, [firstName, lastName], (err, results, fields) => {
        if(err) {
            console.log("Failed to insert new user: " + err)
            res.sendStatus(500);
            return
        }

        console.log("Inserted a new user with id: ", results.insertId);
        res.end()
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
            res.sendStatus(500)
            return
        }

        console.log("I Think we fetched user succesffuly!")
 
        const users = rows.map((row) => {
            return {firstName: row.first_name, lastName: row.last_name}
        })

        res.json(rows)
    })

})

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-03.cleardb.net',
    user: 'b8b0d42b181867',
    password: '5e715100',
    database: 'heroku_86cd1dc8c99fff0'
})

function getConnection(){
    return pool
}

module.exports = router