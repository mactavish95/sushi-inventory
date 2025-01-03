const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const ExcelJS = require('exceljs');


// import { findAllDatesAtLeastTenDaysAgo } from "./sr.js";


const router = express.Router();

// App setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Schema and Models
// const StockSchema = new mongoose.Schema({
//   itemName: { type: String, required: true },
//   type: { type: String, required: true, enum: ["in", "out"] },
//   time: { type: Date, default: Date.now },
//   quantity: { type: Number, required: true },
//   imageUrl: String,
// });

// const Stock = mongoose.model("Stock", StockSchema);

// const Item = mongoose.model("Item", new mongoose.Schema({
//   itemName: { type: String, required: true },
//   category: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now },
//   imageUrl: String,
// }));

const StockSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  time: { type: Date, default: Date.now },
  type: { type: String, required: true, enum: ["in", "out"] },

  createdAt: { type: Date, default: Date.now },
  imageUrl: String,
});

const Stock = mongoose.model("Stock", StockSchema);

const ItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  imageUrl: String,
});

const Item = mongoose.model("Item", ItemSchema);


const Activity = mongoose.model("Activity", new mongoose.Schema({
  message: String,
  time: { type: Date, default: Date.now },
}));


mongoose
  .connect("mongodb://localhost:27017/sushi_inventory", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));



app.post("/stock", async (req, res) => {
  try {
    const { itemName, category, type, time, quantity, imageUrl  } = req.body;

  
      // Validate required fields
      if (!itemName || !category || !type || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

    // Validate required fields
    if (!itemName || !type || !quantity) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

  

    // Validate type enum
    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be "in" or "out"' 
      });
    }

    // Convert quantity to number safely
    const number = parseInt(quantity);
    if (isNaN(number)) {
      return res.status(400).json({ 
        error: 'Quantity must be a valid number' 
      });
    }

    // Find existing item
    const existingItem = await Stock.findOne({ itemName, type });

    if (existingItem) {
      // Update existing item
      existingItem.quantity += number;
      existingItem.time = new Date();
      await existingItem.save();
      
      return res.status(200).json({
        message: 'Item updated successfully',
        item: existingItem
      });
    }

    // Create new item
    const stock = new Stock({
      itemName,
      category,
      type,
      time: time || new Date(),
      quantity,
      imageUrl,
    });
    
    await stock.save();
    
    // return res.status(201).json({
    //   message: 'Item added successfully',
    //   item: newItem
    // });

  } catch (error) {
    console.error('Stock operation error:', error);
    return res.status(500).json({
      error: 'Failed to process stock operation',
      details: error.message
    });
  }
});

// fetch data from the database

app.get("/stock", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ 
      error: "Failed to fetch stock entries",
      details: error.message 
    });
  }
});

app.get('/export/monthly', async (req, res) => {
  // Fetch data from the database (replace with your DB query)
  const stockData = await Stock.find();

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Record');

  // Add header row
  worksheet.columns = [
      { header: 'Item Name', key: 'itemName', width: 25 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Date Added', key: 'time', width: 20 },
  ];

  // Add data rows
  stockData.forEach((stock) => {
      worksheet.addRow({
          itemName: stock.itemName,
          type: stock.type,
          quantity: stock.quantity,
          time: new Date(stock.time).toLocaleString(),
      });
  });

  // Set response headers and send file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=MonthlyRecord.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// find all items have the time in storage more than or equal to 10 days ago
app.get('/stock/10days', async (req, res) => {
  try {
    // Calculate the date 10 days ago from today
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    tenDaysAgo.setHours(0, 0, 0, 0); // Set time to the start of the day for consistency

    console.log("Fetching items stored on or before:", tenDaysAgo);

    // Find all stock items with a 'time' field greater than or equal to 10 days ago
    const oldItems = await Stock.find({ time: { $lte: tenDaysAgo } });

    // Respond with the found items in JSON format
    res.json(oldItems);
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Failed to fetch stock items", details: error.message });
  }
});

// Stock summary endpoint
router.get("/summary", async (req, res) => {
  try {
    const totalInStock = await Stock.aggregate([
      { $match: { type: "in" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const outOfStockCount = await Stock.find({ quantity: { $lte: 0 } }).countDocuments();
    res.json({
      totalInStock: totalInStock[0]?.total || 0,
      outOfStock: outOfStockCount,
    });
  } catch (err) {
    console.error("Error fetching stock summary:", err);
    res.status(500).json({ error: "Failed to fetch stock summary", details: err.message });
  }
});


app.get("/stock/dashboard-stats", async (req, res) => {
  try {
    const totalItems = await Stock.countDocuments();
    const lowStock = await Stock.countDocuments({ quantity: { $lt: 10 } });
    const totalCategories = await Stock.distinct("category").then((categories) => categories.length);
    const expiredItems = await Stock.countDocuments({
      createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // Items older than 10 days
    });

    res.json({
      stats: {
        totalItems,
        lowStock,
        totalCategories,
        expiredItems,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

app.get("/stock/stock-trends", async (req, res) => {
  try {
    // Aggregating data for trends (e.g., stock counts over time)
    const trends = await Item.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalStock: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ trends });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock trends." });
  }
});

app.get("/stock/categories", async (req, res) => {
  try {
    // Aggregating categories and their item counts
    const categories = await Item.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

app.get("/stock/recent-activities", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ time: -1 }).limit(10); // Fetch the last 10 activities
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent activities." });
  }
});


// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});