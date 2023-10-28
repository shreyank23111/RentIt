const express =require("express")
const router = express.Router();
const User = require("../models/user.js")
const wrapAsync = require("../utils/wrapAsync.js")
const passport =require("passport");
const { saveRedirectUrl } = require("../middleware.js");

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
  req.login(registerUser, (err)=>{
    if(err){
      return next(err);
    }
    req.flash("success", "Welcome to RentIt")
    res.redirect("/listings")
  })
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
  saveRedirectUrl,
  passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
  req.flash("success", "Welcome back to RentIt")
  let redirectUrl = res.locals.redirectUrl || "/listings"
  res.redirect(redirectUrl);
})

//Logout Route
router.get("/logout", (req, res, next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success", "you are logged out!")
    res.redirect("/listings");
  })
})

module.exports = router;