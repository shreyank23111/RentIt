const express =require("express")
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride =require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")
const Review = require("./models/review.js");
const { log } = require("console");

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

const validateListing = (req, res, next) =>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  else{
    next();
  }
}

const validateReview = (req, res, next) =>{
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  else{
    next();
  }
}


//Index Route
app.get(
  "/listings",
 wrapAsync( async(req, res)=>{
  const allListings = await Listing.find({})
  res.render("listings/index.ejs", {allListings});
}));

// New Route
app.get(
  "/listings/new",
  (req,res)=>{
  res.render("listings/new.ejs")
})

//Show Route
app.get(
  "/listings/:id",
 wrapAsync( async(req, res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", {listing})
}));

//Create Route
app.post(
  "/listings",
validateListing,
 wrapAsync( async(req,res, next)=>{
  const newListings = new Listing(req.body.listing);
  await newListings.save();
  res.redirect("listings")
}))

//Edit Route
app.get(
  "/listings/:id/edit",
 wrapAsync( async(req, res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put(
  "/listings/:id",
validateListing,
 wrapAsync( async(req, res)=>{
  let {id} =req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete(
  "/listings/:id",
 wrapAsync( async(req, res)=>{
  let {id} = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings")
}));

//Reviews Route
//Post Route
app.post(
  "/listings/:id/reviews", 
validateReview ,
wrapAsync( async(req, res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review)

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);

}))

//Delete Review Route
app.delete(
  "/listings/:id/reviews/:reviewId",
wrapAsync( async (req, res)=>{
  let {id, reviewId} = req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}))


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