const { pool } = require("../config/database");
const cloudinary = require("cloudinary").v2;

const fileUpload = require("express-fileupload");
const express = require("express");
const app = express();

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

cloudinary.config({
  cloud_name: "dlupmflme",
  api_key: "186219974884619",
  api_secret: "QJV2KfkDNa_QHEY9HIuncXxxiBA",
});

const AddPost = async (req, resp) => {
  try {
    const data = req.body.user_img;
    // console.log(data);
    cloudinary.uploader
      .upload(data, {
        public_id: "Post_Image",
      })
      .then((res) => {
        console.log(res);
        console.log(req.body);
        pool
          .query("insert into posts set ?", [req.body])
          .then((err, result) => {
            if (err) throw err;
            console.log(result);
          });
      });
  } catch (err) {
    console.log(err);
  }
};

const GetPostData = async (req, resp) => {
  try {
    pool.query("select * from posts", (err, result) => {
      if (err) throw err;
      resp.send({ result: result });
    });
  } catch (err) {
    console.log(err);
  }
};

const LikeData = async (req, resp) => {
  try {
    const Data = {
      dataId: [1, 2, 3, 4],
    };

    const jsonData = JSON.stringify(Data);

    // pool.query(
    //   "update posts set likes = ? where id='1'",
    //   [jsonData],
    //   (err, result) => {
    //     if (err) throw err;
    //     else {
    //       resp.send(result);
    //       console.log(result);
    //     }
    //   }
    // );

    pool.query("select likes from posts where id='1'", (err, result) => {
      if (err) throw err;
      const objData = JSON.parse(result[0].likes);
      const checkAvaiblity = objData.dataId;
      // objData.dataId.push(6);
      console.log(checkAvaiblity.includes(3));
      resp.send(checkAvaiblity);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  AddPost,
  GetPostData,
  LikeData,
};
