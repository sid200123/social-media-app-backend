const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
const jwtKey = "social-app";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Social_Media_App",
  connectionLimit: 10,
});

app.post("/register", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`connected as ${conn.threadId}`);
      const data = req.body;
      conn.query("insert into users set ?", data, (err, result) => {
        conn.release();
        if (err) console.log(err);
        else
          jwt.sign({ data }, jwtKey, { expiresIn: "1h" }, (err, token) => {
            if (err) {
              resp.send("Something Went Wrong Please Try Again");
            } else {
              resp.send({ data, auth: token });
            }
          });
      });
    }
  });
});

app.post("/login", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) throw err;
    console.log(`connected as ${conn.threadId}`);

    const data = req.body;
    conn.query(
      "select * from users where email =? and password =?",
      [data.email, data.password],
      (err, res) => {
        conn.release();
        if (err) throw err;
        else {
          jwt.sign({ data }, jwtKey, { expiresIn: "1h" }, (err, token) => {
            if (err) {
              resp.send("Something Went Wrong Please Try Again");
              resp.send(err);
            } else {
              resp.send({ data, auth: token });
            }
          });
        }
      }
    );
  });
});

app.listen(port, () => console.log(`Server Running On Port ${port}`));
