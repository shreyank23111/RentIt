const express =require("express");
const app =express();
const session = require("express-session");
const flash = require("connect-flash")
const path =require("path")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(session({secret: "mysupersecrtstring", resave: false, saveUninitialized: true}))
app.use(flash());

app.get("/register", (req, res)=>{
  let {name="Laude"} =req.query;
  req.session.name = name;
  req.flash("success", "user registered successfully");
  res.redirect("/hello");
})

app.get("/hello", (req,res)=>{
  res.locals.messages = req.flash("success")
  res.render("page.ejs", {name: req.session.name});
})
// app.get("/reqcount", (req, res)=>{
//   if(req.session.count){
//     req.session.count++;
//   }
//   else{
//     req.session.count = 1;
//   }

//   res.send(`you sent a request ${req.session.count} times`)
// })

// app.get("/test", (req, res)=>{
//   res.send("test successful!")
// })


app.listen(3000,()=>{
  console.log("Server is listening on 3000");
})