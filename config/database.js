const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Social_Media_App",
  connectionLimit: 30,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`connected as ${connection.threadId}`);
  }
});

module.exports = { pool };
