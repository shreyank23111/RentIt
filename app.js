const express =require("express")
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride =require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { log } = require("console");
const session =require("express-session")
const flash =require("connect-flash");
const passport =require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");
const userRouter = require("./routes/user.js")
const listingsRouter = require("./routes/listing.js") ;
const reviewsRouter = require("./routes/review.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "/public")));

//Connection with database(mongo)
main()
.then(()=>{
  console.log("Connected to Database");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/RentIt');
}

//Using Sessions
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}


//main route
app.get("/", (req, res)=>{
  res.send("I am Groot");
})

//Session and Flash middlewares
app.use(session(sessionOptions));
app.use(flash());

//Using Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

app.get("/demouser", async(req, res)=>{
  let fakeUser = new User({
    email: "randirani@gmail.com",
    username: "randio-ki-rani"
  });

  let registerUser = await User.register(fakeUser, "helloFuckers")
  res.send(registerUser)
})

//Accessing routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


//Page not found Route
app.all("*",(req, res, next)=>{
  next(new ExpressError(404, "Page Not Found!"));
})

//Error handler middleware
app.use((err, req, res, next)=>{
  let {statusCode = 500 , message = "Something Went Wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{message})
})

//Port number
app.listen(9211, ()=>{
  console.log("Server is listening on port 9211");
})