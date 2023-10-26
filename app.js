const express =require("express")
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride =require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { log } = require("console");

const listings = require("./routes/listing.js") 
const reviews = require("./routes/review.js")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "/public")));



main()
.then(()=>{
  console.log("Connected to Database");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/RentIt');
}

app.get("/", (req, res)=>{
  res.send("I am Groot");
})




app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);





// app.get("/testListing", async(req, res)=>{
//   let sampleListing = new Listing({
//     title: "My new Villa",
//     description: "By the Beach",
//     price: 1200,
//     location: "Goa",
//     country:"India"
//   })

//   await sampleListing.save();
//   console.log("Sample was Saved");
//   res.send("Successful")
// })

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