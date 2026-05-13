const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3030;

app.use(cors());
app.use(require("body-parser").urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
const dealerships_data = JSON.parse(
  fs.readFileSync("dealerships.json", "utf8")
);

mongoose.connect("mongodb://mongo_db:27017/", { dbName: "dealershipsDB" });

const Reviews = require("./review");
const Dealerships = require("./dealership");

// seed DB safely (no try/catch misuse)
Reviews.deleteMany({}).then(() => {
  Reviews.insertMany(reviews_data.reviews);
});

Dealerships.deleteMany({}).then(() => {
  Dealerships.insertMany(dealerships_data.dealerships);
});

// Home route
app.get("/", async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get("/fetchReviews", async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});

// Fetch reviews by dealer
app.get("/fetchReviews/dealer/:id", async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});

// Fetch all dealers
app.get("/fetchDealers", async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});

// Fetch dealers by state
app.get("/fetchDealers/:state", async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});

// Fetch dealer by id
app.get("/fetchDealer/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const document = await Dealerships.findOne({ id: id });

    if (!document) {
      return res.status(404).json({ error: "Dealer not found" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});

// Insert review
app.post("/insert_review", express.raw({ type: "*/*" }), async (req, res) => {
  const data = JSON.parse(req.body);

  const documents = await Reviews.find().sort({ id: -1 });
  const new_id = documents[0].id + 1;

  const review = new Reviews({
    id: new_id,
    name: data.name,
    dealership: data.dealership,
    review: data.review,
    purchase: data.purchase,
    purchase_date: data.purchase_date,
    car_make: data.car_make,
    car_model: data.car_model,
    car_year: data.car_year,
  });

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error inserting review" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});