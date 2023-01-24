const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
const jwtKey = "social-app";

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "images"); // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
});

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Social_Media_App",
  connectionLimit: 30,
});

app.post("/register", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`connected as ${conn.threadId}`);
      const data = req.body;
      conn.query(
        "insert into users (name,email,password) select ?, ?, ? where not exists (select 1 from users where email = ?)",
        [req.body.name, req.body.email, req.body.password, req.body.email],
        (err, result) => {
          conn.release();
          if (err) console.log(err);
          else {
            if (result.insertId === 0) {
              resp.send({ err: "Email Exist" });
            } else
              jwt.sign({ data }, jwtKey, { expiresIn: "1h" }, (err, token) => {
                if (err) {
                  resp.send("Something Went Wrong Please Try Again");
                } else {
                  resp.send({ result, auth: token });
                }
              });
          }
        }
      );
    }
  });
});

app.post("/login", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) throw err;
    console.log(`connected as ${conn.threadId}`);

    const data = req.body;
    conn.query(
      "select * from users where email = ? and password = ?",
      [data.email, data.password],
      (err, res) => {
        conn.release();
        if (err) throw err;
        else {
          jwt.sign({ data }, jwtKey, { expiresIn: "1h" }, (err, token) => {
            if (err) {
              resp.send("Something Went Wrong Please Try Again");
            } else {
              resp.send({ data: res, auth: token });
            }
          });
        }
      }
    );
  });
});

app.put("/updateProfile", upload.single("profile"), async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) throw err;
    console.log(`connected as ${conn.threadId}`);

    const data = req.body;
    conn.query(
      "update users set name = ?, address = ?, profile = ? where id = ?",
      [data.name, data.address, data.profile, data.id],
      (err, res) => {
        conn.release();
        if (err) throw err;
        else {
          if (err) {
            resp.send("Something Went Wrong Please Try Again");
          } else {
            resp.send({ data: res });
          }
        }
      }
    );
  });
});

app.get("/profileDetail/:id", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) throw err;
    console.log(`connected as ${conn.threadId}`);

    const id = req.params.id;
    conn.query("select * from users where id = ?", id, (err, res) => {
      conn.release();
      if (err) throw err;
      else {
        resp.send(res);
      }
    });
  });
});

app.get("/searchData/:data", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) throw err;
    console.log(`connected as ${conn.threadId}`);

    const data = req.params.data;
    conn.query(
      "select * from users where name like ?",
      [data + "%"],
      (err, res) => {
        conn.release();
        if (err) throw err;
        else {
          resp.send(res);
        }
      }
    );
  });
});

app.listen(port, () => console.log(`Server Running On Port ${port}`));
