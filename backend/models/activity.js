const activitySchema = new mongoose.Schema({
    message: String,
    time: { type: Date, default: Date.now },
  });
  
  const Activity = mongoose.model("Activity", activitySchema);
  