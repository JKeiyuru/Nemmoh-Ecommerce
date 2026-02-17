// server/models/DeliveryLocation.js

const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  deliveryFee: { type: Number, required: true, min: 0 },
});

const SubCountySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  locations: [LocationSchema],
});

const DeliveryLocationSchema = new mongoose.Schema(
  {
    county: { type: String, required: true, trim: true, unique: true },
    subCounties: [SubCountySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DeliveryLocationSchema.index({ county: 1 });
DeliveryLocationSchema.index({ isActive: 1 });

module.exports = mongoose.model("DeliveryLocation", DeliveryLocationSchema);
