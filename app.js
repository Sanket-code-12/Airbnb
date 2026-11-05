const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// 🟢 PASTE THE NEW CODE RIGHT HERE (REPLACING YOUR OLD CALL):
const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wanderLust";    

main()
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// 🔴 DELETE or REPLACE your old lines that looked like this:
// main().then(()=>{
//     console.log("Connected to DB");
// }).catch((err)=>{
//     console.log(err);
// })


// CHANGE THIS:
// async function main() {
//     await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust");    
// }
// TO THIS:
async function main() {
    await mongoose.connect(dbUrl);    
}


app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/",(req,res)=>{
    res.redirect("/listings");
})

// index Rout
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    console.log(allListings);
    res.render("listings/index.ejs", { allListings });
}));

// TEMPORARY SEED ROUTE (Delete after database is populated)
const initData = require("./init/data.js");
app.get("/seed-my-database", wrapAsync(async (req, res) => {
    // Delete any old empty collections
    await Listing.deleteMany({});
    
    // Insert your listings array from data.js
    await Listing.insertMany(initData.data);
    
    console.log("Database initialized successfully from the cloud route!");
    res.send("<h1>Database successfully populated with listings! You can close this tab now.</h1>");
}));


// New Rout
app.get("/listings/new", wrapAsync(async (req,res)=>{
    res.render("listings/new.ejs");
}));

// Show Rout
app.get("/listings/:id", wrapAsync(async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs" , {listing});
}));

// Creat Rout
app.post("/listings" , wrapAsync(async (req,res) =>{
    // let{title,description,image,price,country,location,} = req.body;
    console.log("Headers:", req.headers);
    console.log("Content-Type:", req.get("Content-Type"));
    console.log("Body:", req.body);

    if(!req.body || !req.body.listing){
        throw new ExpressError(400, "Enter Valid Data for Listing");
    }
    if (!req.body.listing.image.url.trim()) {
        delete req.body.listing.image.url;
    }
    if(!newlisting.title){
        throw new ExpressError(400, "Title is required");
    }
    if(!newlisting.description){
        throw new ExpressError(400, "Description is required");
    }
    if(!newlisting.price){
        throw new ExpressError(400, "Price is required");
    }
    if(!newlisting.location){
        throw new ExpressError(400, "Location is required");
    }
    if(!newlisting.country){
        throw new ExpressError(400, "Country is required");
    }

    const newListing = new Listing(req.body.listing)
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Rout
app.get("/listings/:id/edit", wrapAsync(async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

// Update Rout
app.put("/listings/:id", wrapAsync(async (req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete listng
app.delete("/listings/:id", wrapAsync(async (req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// app.get("/testListing", async(req,res) => {
//     let sampleListing = new Listing({
//         title: "My House",
//         description: "On top",
//         price: 1200,
//         location: "India",
//         country:"India"
//     });

//     await sampleListing.save();
//     console.log("Sample was save");
//     res.send("successful testing");
// })

app.all("/{*any}",(req,res,next) => {
    next(new ExpressError(404 , "Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
});

// app.listen(8080,()=>{
//     console.log("server is listenig port 8080");
// })
