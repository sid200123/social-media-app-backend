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
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));

var storage = multer.diskStorage({
  destination: "profile",
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, callBack) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callBack(null, true);
    } else {
      callBack(null, false);
      return callBack(new Error("Only Jpeg and Png format allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

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

app.put("/updateProfile", async (req, resp) => {
  connection.getConnection((err, conn) => {
    if (err) throw err;
    console.log(`connected as ${conn.threadId}`);

    upload(req, resp, async (err) => {
      if (err instanceof multer.MulterError) {
        resp.send(err);
      } else if (err) {
        resp.send(err);
      }
      console.log(req.file);
    });

    const data = req.body;
    conn.query(
      "update users set name = ?, address = ?, profile = ? where id = ?",
      [data.name, data.address, data.profile, data.id],
      (err, res) => {
        conn.release();
        if (err) {
          throw err;
        } else {
          resp.send({ res });
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
