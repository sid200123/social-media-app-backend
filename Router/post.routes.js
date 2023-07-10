const router = require("express").Router();
const postController = require("../component/post.controller");

router.route("/addPost").post(postController.AddPost);
router.route("/getPost").get(postController.GetPostData);
router.route("/addLike").post(postController.LikeData);

module.exports = router;
