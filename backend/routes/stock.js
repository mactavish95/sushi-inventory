const express = require("express");
const Stock = require("./models/stock"); // Import your Mongoose model
const router = express.Router();

// Get the stock in/out list
router.get("/list", async (req, res) => {
  try {
    const stockList = await Stock.find().sort({ time: -1 });
    res.json(stockList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock list" });
  }
});

module.exports = router;
