const express =require("express")
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride =require("method-override");
const engine = require("ejs-mate");

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

//Index Route
app.get("/listings", async(req, res)=>{
  const allListings = await Listing.find({})
  res.render("listings/index.ejs", {allListings});
})

// New Route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs")
})

//Show Route
app.get("/listings/:id", async(req, res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", {listing})
})

//Create Route
app.post("/listings", async(req,res)=>{
  const newListings = new Listing(req.body.listing);
  await newListings.save();
  res.redirect("listings")
})

//Edit Route
app.get("/listings/:id/edit", async(req, res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
})

//Update Route
app.put("/listings/:id", async(req, res)=>{
  let {id} =req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id", async(req, res)=>{
  let {id} = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings")
})

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

app.listen(9211, ()=>{
  console.log("Server is listening on port 9211");
})