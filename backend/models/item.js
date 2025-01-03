const itemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    imageUrl: String,
  });
  
  const Item = mongoose.model("Item", itemSchema);
