// load our app server using express somehow....
const express = require('express')
const app = express()
const morgan = require('morgan')

// Initialise Body Parser
const bodyParser = require('body-parser')
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}))

// Public Folder
app.use(express.static('./public'))

app.use(morgan('short'))

// Image Uploading and Database Logic
const router = require('./routes/user.js')
app.use(router)

const PORT = process.env.PORT || 3003
// localhost:PORT
app.listen(PORT, () => {
  console.log("Server is up and listening on: " + PORT)
})
