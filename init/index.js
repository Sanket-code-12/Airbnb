// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// main().then(()=>{
//     console.log("Connected to DB");
// }).catch((err)=>{
//     console.log(err);
// })
// async function main() {
//     await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust");
// }

// const initDB = async () => {
//     await Listing.deleteMany({});
//     await Listing.insertMany(initData.data);
//     console.log("Data initialized");
// }

// initDB();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const ATLAS_URL = "mongodb+srv://sanketmore2630_db_user:zdwNCDvOjwQNNRFl@cluster0.qgbydgy.mongodb.net/wanderLust?retryWrites=true&w=majority";

main()
  .then(() => {
    console.log("Connected to Cloud DB");
    initDB(); 
  })
  .catch((err) => {
    console.log("Connection Error:", err);
  });

async function main() {
    await mongoose.connect(ATLAS_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Data initialized successfully in the cloud!");
};
