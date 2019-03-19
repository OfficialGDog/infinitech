const app = require('express');
const morgan = require('morgan');
const mysql = require('mysql');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('./public'));

app.use(morgan('short'));

const router = require('./routes/user.js');

app.use(router);

app.get("/", (req,res) => {
	res.sendFile(path.join('./public' + '/index.html'));
});

const PORT = process.env.PORT || 3003

app.listen(PORT, () => {
    console.log("Server is up and running on" + PORT)
});