const express =require("express")
const router = express.Router();
const User = require("../models/user.js")
const wrapAsync = require("../utils/wrapAsync.js")
const passport =require("passport")

//Signup Route
router.get("/signup", (req, res)=>{
  res.render("users/signup.ejs")
});

router.post("/signup", wrapAsync (async (req, res)=>{
 try{
  let {username, email, password} = req.body;
  const newUser = new User ({email, username});
  const registerUser = await User.register(newUser, password);
  console.log(registerUser);
  req.flash("success", "Welcome to RentIt")
  res.redirect("/listings")
 }
 catch(err){
  req.flash("error", err.message);
  res.redirect("/signup")
 }
}))



//Login Route

router.get("/login", (req, res)=>{
  res.render("users/login.ejs");
})
router.post(
  "/login",
  passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
  req.flash("success", "Welcome back to RentIt")
  res.redirect("/listings");
})

module.exports = router;