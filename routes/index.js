var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post")
const passport = require("passport");
const upload = require ("./multer");

// allow user to make acc basis on username & passworld
const localStratergy = require("passport-local");
const { is } = require("express/lib/request");
const { route } = require("express/lib/application");
passport.use(new localStratergy(userModel.authenticate()));

// GET routes
router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  // we activate flash messge only on failure so we pass that flash('error')
  res.render("login", { footer: false, error: req.flash('error') });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  
  // through populate we can get user(value) from user id, because postSchema have user id
  const posts = await postModel.find().populate("user");
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render("feed", { footer: true, posts,user });
});

router.get("/profile", isLoggedIn, async function (req, res) {

  // finding logged in user & populate posts from user schema 
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");
  res.render("profile", { footer: true, user });
  
});

router.get("/search", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render("search", { footer: true,user });
});

//for search request(dynamic) 
router.get("/username/:username", isLoggedIn, async function (req, res) {

  // RegExp(`^`,i)
  const regex = new RegExp(`^${req.params.username}`,'i');
  const users = await userModel.find({username: regex});

  // sent response in json form
  res.json(users);

});

// for delete post 
// router.get("/delete/post/:id", isLoggedIn, async function(req, res){
//   const user = await userModel.findOne({username: req.session.passport.user});
//   const post = await postModel.findOne({_id: req.params.id});
  
//   res.redirect("/feed");
 
// });

router.get("/like/post/:id", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.findOne({_id: req.params.id});

  // for stoping multiple like by one user
  // if user not liked, liked it
  // when user id not found in likes array of post schema it will return -1
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  //else user already liked, remove user id from likes array of post schema 
  //simply remove liked
  else{
    //splice(index, how many element remove from index)
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.redirect("/feed");
});

router.get("/edit", isLoggedIn, async function (req, res) {

  // finding logged in user
  const user = await userModel.findOne({username: req.session.passport.user});
  
  // send this user to edit page with footer
  res.render("edit", { footer: true,user});

});

router.get("/upload", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render("upload", { footer: true,user });
});

router.get("/logout",function (req, res, next) {
  req.logout(function(err){
    if(err){return next(err)}
    res.redirect("/login");
  });
});

// POST routes 
router.post("/register", function (req, res, next) {
  const userData = new userModel({
    //facting data from "index.ejs"
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
  });

  // making account, register user(returning promiss, so use ".then")
  userModel.register(userData, req.body.password)
  .then(function(){

    // for user stay logged in, after authenticate user redirect to profile page
    passport.authenticate("local")(req, res, function(){
      res.redirect("/feed");
    })

  });
});


// this route authicate user basis on username & password, if match successRedirect else failureRedirect 
router.post("/login", passport.authenticate("local",{
  successRedirect: "/feed",
  failureRedirect: "/login",
  //on the login failure flash message will activate
  failureFlash: true 
}),function (req, res) {
  res.render("login", { footer: false });
});


// "edtImgInput" name of edit > hidden file 
// through "upload.single" we can upload our file
router.post("/update", upload.single('edtImgInput'), async function(req, res){

  //find user from userModel on the basis of username 
  // "req.session.passport.user" gives user, who logged in 
  // const user = await userModel.findOneAndUpdate({findOne}, {update data}, {new: true});
  const user = await userModel.findOneAndUpdate( 
    {username: req.session.passport.user}, 
    {username: req.body.username, name: req.body.name, bio: req.body.bio}, 
    {new: true}
  );
// console.log(bio);
  //check if file (profile pic) was upload then only do this 
  if(req.file){
    // upload.single('edtImgInput') gives req.file.filename & set that file to profileImage of userModel
    user.profileImg = req.file.filename;
  }

  //when you save manually, use this
  await user.save();
  res.redirect("/profile");
});

router.post("/upload", isLoggedIn, upload.single("uploadImage"), async function(req, res){
  const user = await userModel.findOne({username: req.session.passport.user});
//  if file upload in "upload.ejs"
  if(req.file){
    const post = await postModel.create({
      picture: req.file.filename,
      caption: req.body.caption,
      //"._id" gives id from schema 
      user: user._id,
   })
   
  //  pushing post's id into user's post array
   user.posts.push(post._id);
   await user.save();
  res.redirect("/feed");
  }
  // if file not upload 
  else{ res.redirect("/upload")}
})

//This func is check if user logged in return next else redirecting login page
// for making protected routes 
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}
module.exports = router;