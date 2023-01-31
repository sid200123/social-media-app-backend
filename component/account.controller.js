const { pool } = require("../config/database");
const multer = require("multer");
const { storage } = require("../ImageStore/image.store");
const jwt = require("jsonwebtoken");
const jwtKey = "social-app";

let upload = multer({
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

const RegisterAccount = async (req, resp, next) => {
  try {
    const data = req.body;
    pool.query(
      "insert into users (name,email,password) select ?, ?, ? where not exists (select 1 from users where email = ?)",
      [req.body.name, req.body.email, req.body.password, req.body.email],
      (err, result) => {
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
  } catch (err) {
    throw err;
  }
};

const LoginAccount = async (req, resp, next) => {
  try {
    const data = req.body;
    pool.query(
      "select * from users where email = ? and password = ?",
      [data.email, data.password],
      (err, res) => {
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
  } catch (err) {
    throw err;
  }
};

const UpdateAccountDetail = async (req, resp, next) => {
  try {
    upload(req, resp, async (err) => {
      if (err instanceof multer.MulterError) {
        resp.send(err);
      } else if (err) {
        resp.send(err);
      }
      console.log(req.file);
    });

    const data = req.body;
    pool.query(
      "update users set name = ?, address = ?, profile = ? where id = ?",
      [data.name, data.address, data.profile, data.id],
      (err, res) => {
        if (err) {
          throw err;
        } else {
          resp.send({ res });
        }
      }
    );
  } catch (err) {
    throw err;
  }
};

const ViewAccountDetail = async (req, resp, next) => {
  try {
    const id = req.params.id;
    pool.query(`select * from users where id = ?`, id, (err, res) => {
      if (err) throw err;
      else {
        resp.send(res);
      }
    });
  } catch (err) {
    throw err;
  }
};

const SearchAccountDetail = async (req, resp, next) => {
  try {
    const data = req.params.data;
    pool.query(
      "select * from users where name like ?",
      [data + "%"],
      (err, res) => {
        if (err) throw err;
        else {
          resp.send(res);
        }
      }
    );
  } catch (err) {
    throw err;
  }
};

module.exports = {
  RegisterAccount,
  LoginAccount,
  UpdateAccountDetail,
  ViewAccountDetail,
  SearchAccountDetail,
};
