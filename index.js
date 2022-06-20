const express = require('express')
const app = express()
const port = "3000"
const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pwd123",
    database: "database",
});
  
db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log("MySql Connected");
}); 

app.get("/createdb", (req, res) => {
    let sql = "CREATE DATABASE database";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("Database created");
    });
});

app.get("/createuser", (req, res) => {
    let sql = "CREATE TABLE user(id int AUTO_INCREMENT, email VARCHAR(255), password VARCHAR(255), phone VARCHAR(255), name VARCHAR(255), PRIMARY KEY(id))";
    db.query(sql, (err) => {
      if (err) {
        throw err;
      }
      res.send("user table created");
    });
});

app.post('/user', (req, res) => {
    // let post = { name: "Jake Smith", designation: "Chief Executive Officer" };
    let email = req.body.email;
    let password = req.body.password;
    let phone = req.body.phone;
    let name = req.body.name;
    let post = {email: email, password: password, phone: phone, name: name}
    let sql = "INSERT INTO user SET ?";
    let query = db.query(sql, post, (err) => {
        if (err) {
            throw err;
        }
        res.send("User 1 added");
    });
});

////
app.listen(port, () => {
    console.log("Server started on port" + port);
});