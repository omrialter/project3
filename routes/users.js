const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel, validateUser, validateLogin, createToken } = require("../models/userModel")
const { auth } = require("../auth/auth.js");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Users work" });
})

router.get("/userInfo", auth, async (req, res) => {
  let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
  res.json(user);
})



router.post("/", async (req, res) => {
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "******";
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(400).json({ err: "email already exist" })
    res.status(502).json({ err })
  }
})

router.post("/login", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  let user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).json({ msg: "email not found" });
  }
  let passValid = await bcrypt.compare(req.body.password, user.password);
  if (!passValid) {
    return res.status(401).json({ msg: `problem with the password` });
  }
  let newToken = createToken(user._id, user.role)
  res.json({ token: newToken });


})





module.exports = router;