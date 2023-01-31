const path = require("path");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: "profile",
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

module.exports = storage;
