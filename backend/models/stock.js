const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },

  type: { type: String, enum: ["in", "out"], required: true },
  time: { type: Date, required: true },
  quantity: { type: Number, required: true },
  imageUrl: String,

});

module.exports = mongoose.model("Stock", stockSchema);
