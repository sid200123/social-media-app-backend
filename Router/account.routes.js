const router = require("express").Router();
const accountController = require("../component/account.controller");

router.route("/register").post(accountController.RegisterAccount);
router.route("/login").post(accountController.LoginAccount);
router.route("/updateProfile").put(accountController.UpdateAccountDetail);
router.route("/profileDetail/:id").get(accountController.ViewAccountDetail);
router.route("/searchData/:data").get(accountController.SearchAccountDetail);

module.exports = router;
