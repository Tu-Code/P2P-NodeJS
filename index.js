const express = require('express')
const port = 3000
const mysql = require("mysql");
const app = express();
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
 
app.use(flash());
app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'ejs');

const db = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: 'nodemysql'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

db.getConnection((err) => {
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
      res.send("User table created");
    });
});

app.get("/createtransactiontable", (req, res) => {
  let sql = "CREATE TABLE transactions(id int AUTO_INCREMENT, email VARCHAR(255), amount VARCHAR(255), PRIMARY KEY(id))";
  db.query(sql, (err) => {
    if (err) {
      throw err;
    }
    res.send("Transactions table created");
  });
});

//deleting tables
// db.getConnection(function(err) {
//   if (err) throw err;
//   //Delete the "customers" table:
//   var sql = "DROP TABLE transactions";
//   db.query(sql, function (err, result) {
//      if (err) throw err;
//      console.log("Table deleted");
//      console.log(result);
//   });
// });

app.get('/signup', (req, res) => {
    return res.render('signup');
});

app.get('/login', (req, res) => {
  return res.render('login');
});

app.get('/fund_account', (req, res) => {
  let message = req.flash('balance');
  if (message.length > 0) {
      message = message;
  } else {
      message = null;
  }
  res.render("fund_account", {balance: message});
});

app.get('/transfer', (req, res) => {
  let message = req.flash('balance');
  if (message.length > 0) {
      message = message;
  } else {
      message = null;
  }
});

app.post("/create-user", async (req,res) => {

  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password,10);
  db.getConnection( async (err, connection) => {
    if (err) throw (err)
    const sqlSearch = "SELECT * FROM user WHERE email = ?"
    const search_query = mysql.format(sqlSearch,[email])
    const sqlInsert = "INSERT INTO user (email, password) VALUES (?, ?)"
    const insert_query = mysql.format(sqlInsert,[email, hashedPassword])
    await connection.query (search_query, async (err, result) => {
      if (err) throw (err)
      console.log("------> Search Results")
      console.log(result.length)
      if (result.length != 0) {
        connection.release()
        console.log("------> User already exists")
        res.redirect('/login');
        console.log(req.body)
      } 
      else {
        await connection.query (insert_query, (err, result)=> {
          connection.release()
          if (err) throw (err)
          console.log ("--------> Created new User")
          res.redirect('/login');
          console.log(req.body)
        })
      }
    }) //end of connection.query()
  }) //end of db.getConnection()

}) //end of app.post()

app.post("/login-user", async (req,res) => {

  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password,10);
  db.getConnection( async (err, connection) => {
    if (err) throw (err)
    const sqlSearch = "SELECT * FROM user WHERE email = ?"
    const search_query = mysql.format(sqlSearch,[email])
    const sqlInsert = "INSERT INTO user (email, password) VALUES (?, ?)"
    const insert_query = mysql.format(sqlInsert,[email, hashedPassword])
    await connection.query (search_query, async (err, result) => {
      if (err) throw (err)
      console.log("------> Search Results")
      console.log(result.length)
      if (result.length != 0) {
        connection.release()
        console.log("------> Logged In")
        res.redirect('/fund_account');
        console.log(req.body)
      } 
      else {
        await connection.query (insert_query, (err, result)=> {
          connection.release()
          if (err) throw (err)
          console.log ("--------> User doesn't exist")
          res.redirect('/signup');
          console.log(req.body)
        })
      }
    }) //end of connection.query()
  }) //end of db.getConnection()

}) //end of app.post()

app.post("/fundAccount", async (req,res) => {
  const email = req.body.email;
  let amount = req.body.amount;
  db.getConnection( async (err, connection) => {
    if (err) throw (err)
    const sqlSearch = "SELECT amount FROM transactions WHERE email = ?"
    const search_query = mysql.format(sqlSearch,[email])
    const sqlInsert = "INSERT INTO transactions (email, amount) VALUES (?, ?)"
    const sqlUpdate ="UPDATE transactions SET amount = ? WHERE email = ?"
    const insert_query = mysql.format(sqlInsert,[email, amount])
    await connection.query (search_query, async (err, result) => {
      if (err) throw (err)

      if (result.length != 0) {
        connection.release()
        new_bal = parseInt(result[0].amount) + parseInt(amount)
        const update_query = mysql.format(sqlUpdate,[new_bal, email])
        console.log(update_query)
        connection.query (update_query, (err, result)=> {
          if (err) throw (err)
          console.log ("--------> Funded non-empty account")
          console.log(new_bal)
        })
        res.render('fund_account', {balance: new_bal});

      } 

      else {
        await connection.query (insert_query, (err, result)=> {
          connection.release()
          if (err) throw (err)
          console.log ("--------> Funded empty account")
          res.render('fund_account', {balance: amount});
          console.log(req.body)
        })
      }
    }) //end of connection.query()
  })
})

app.post("/transferPost", async (req,res) => {
  const email = req.body.email;
  const amount = req.body.amount;

  // db.getConnection( async (err, connection) => {
  //   if (err) throw (err)
  //   const sqlSearch = "SELECT amount FROM transactions WHERE email = ?"
  //   const search_query = mysql.format(sqlSearch,[email])
  //   const sqlInsert = "INSERT INTO transactions (email, amount) VALUES (?, ?)"
  //   const insert_query = mysql.format(sqlInsert,[email, amount])
  //   await connection.query (search_query, async (err, result, fields)  => {

  //     if (err) throw (err)
  //     console.log("------> Search Results")

  //     if (result.length != 0) {
  //       connection.release()
  //       res.render('fund_account', {balance: parseFloat(result[0].amount) + parseFloat(amount)});
  //       console.log("Not empty")
  //       console.log(req.body)
  //     } 
      
  //     else {
  //       balance = 0
  //       await connection.query (insert_query, (err, result)=> {
  //         connection.release()
  //         if (err) throw (err)
  //         console.log ("--------> Emtpy account funded")
  //         res.render('fund_account', {balance: parseFloat(amount)});
  //         console.log(req.body)
  //       })
  //     }
  //   })
  // }) 
})

app.listen(port, () => {
  console.log("Server started on https://127.0.0.1:" + port);
});


// app.post('/authLogin', (req, res) =>{
//   const email = req.body.email;
//   const password = req.body.password;
//   if (email && password) {
//     db.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
//       if (error) throw error;
//       if (results.length > 0) {
//         request.session.loggedin = true;
//         request.session.email = email;
//         // Redirect to home page
//         res.send('Please enter email and Password!');
//         res.redirect('/login');
//       } 
//       else {
//         res.send('Incorrect email and/or Password!');
//         console.log(req.body)
//       }			
//       res.end();
//     });
//   }
//   else {
//     res.send('Please enter email and Password!');
//     res.end();
//   }
// });
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