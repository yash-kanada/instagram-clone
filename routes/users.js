const mongoose = require(`mongoose`);
const passport = require("passport");
const plm = require("passport-local-mongoose");

// connecting mondo db
mongoose.connect("mongodb://127.0.0.1:27017/instaclone");

// making user scema
const userScema = mongoose.Schema({
  username: String,
  email: String,
  name: String,
  password: String,
  profileImg: String,
  bio: String,
  // for type: id
  // why id => for facting posts, we use post id
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});

// serializeUser & deserializeUser
userScema.plugin(plm);

// making model & export it
module.exports = mongoose.model("user", userScema);
