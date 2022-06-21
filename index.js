const express = require('express')
const port = 3000
const mysql = require("mysql");
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('templates'));
const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: 'nodemysql'
});

db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log("MySql Connected");
}); 


app.get("/createdb", (req, res) => {
    let sql = "CREATE DATABASE nodemysql";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("Database created");
    });
});

app.get("/createusertable", (req, res) => {
    let sql = "CREATE TABLE user(id int AUTO_INCREMENT, email VARCHAR(255), password VARCHAR(255), phone VARCHAR(255), name VARCHAR(255), PRIMARY KEY(id))";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("user table created");
    });
});

app.get('/signup', (req, res) => {
  return res.sendFile( __dirname + '/templates/signup.html');
});

app.post('/create-user', (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});




// app.post('/user', (req, res) => {
//     // let post = { name: "Jake Smith", designation: "Chief Executive Officer" };
//     let email = req.body.email; 
//     let password = req.body.password;
//     let phone = req.body.phone;
//     let name = req.body.name;
//     let post = {email: email, password: password, phone: phone, name: name}
//     let sql = "INSERT INTO user SET ?";
//     let query = db.query(sql, post, (err) => {
//         if (err) {
//             throw err;
//         }
//         res.send("User 1 added");
//         res.redirect('/user');
//     });
// });