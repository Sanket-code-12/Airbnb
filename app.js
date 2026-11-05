const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wanderLust";    

main()
  .then(() => {
    console.log("Connected to DB successfully!");
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database Connection Error:", err);
  });

async function main() {
    await mongoose.connect(dbUrl);    
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// NEW INLINE SEED ROUTE
app.get("/seed-my-database", wrapAsync(async (req, res) => {
    await Listing.deleteMany({});
    
    const inlineSampleData = [
        {
            title: "Secluded Treehouse Getaway",
            description: "Live among the trees in this luxury modern treehouse cabin oasis.",
            price: 800,
            location: "Mumbai",
            country: "India",
            image: { url: "https://unsplash.com" }
        },
        {
            title: "Beachfront Paradise",
            description: "Step right outside your door onto white sandy beaches and turquoise shores.",
            price: 2000,
            location: "Goa",
            country: "India",
            image: { url: "https://unsplash.com" }
        },
        {
            title: "Rustic Cabin by the Lake",
            description: "Spend your evenings sitting next to a peaceful lake and warm campfire pit.",
            price: 900,
            location: "Manali",
            country: "India",
            image: { url: "https://unsplash.com" }
        }
    ];
    
    await Listing.insertMany(inlineSampleData);
    console.log("Database initialized successfully with inline items!");
    res.send("<h1>Database successfully populated with listings! You can close this tab now.</h1>");
}));

// New Route (Note: Kept before /listings/:id so 'new' isn't captured as an ID parameter)
app.get("/listings/new", wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post("/listings", wrapAsync(async (req, res) => {
    if (!req.body || !req.body.listing) {
        throw new ExpressError(400, "Enter Valid Data for Listing");
    }

    const listingData = req.body.listing;

    if (listingData.image && typeof listingData.image.url === 'string' && !listingData.image.url.trim()) {
        delete listingData.image.url;
    }

    // Fixed 'newlisting' ReferenceErrors by validating fields inside 'listingData' object maps
    if (!listingData.title) throw new ExpressError(400, "Title is required");
    if (!listingData.description) throw new ExpressError(400, "Description is required");
    if (!listingData.price) throw new ExpressError(400, "Price is required");
    if (!listingData.location) throw new ExpressError(400, "Location is required");
    if (!listingData.country) throw new ExpressError(400, "Country is required");

    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Page Not Found Catch-All Route
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});
