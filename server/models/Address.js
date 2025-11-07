// server/models/Address.js
const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    // New Kenya location fields
    county: { 
      type: String, 
      required: true 
    },
    subCounty: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String, 
      required: true 
    },
    specificAddress: { 
      type: String,
      default: ""
    },
    phone: { 
      type: String, 
      required: true 
    },
    notes: { 
      type: String,
      default: ""
    },
    deliveryFee: { 
      type: Number, 
      required: true,
      default: 0
    },
    isDefault: { 
      type: Boolean, 
      default: false 
    },
    
    // Legacy fields for backward compatibility (optional)
    address: String,
    city: String,
    pincode: String,
    deliveryCharge: Number,
    district: String,
  },
  { 
    timestamps: true 
  }
);

// Indexes for faster queries
AddressSchema.index({ userId: 1 });
AddressSchema.index({ county: 1, subCounty: 1, location: 1 });

// Virtual for full address string
AddressSchema.virtual('fullAddress').get(function() {
  if (this.specificAddress) {
    return `${this.specificAddress}, ${this.location}, ${this.subCounty}, ${this.county}`;
  }
  return `${this.location}, ${this.subCounty}, ${this.county}`;
});

// Method to get full address string
AddressSchema.methods.getFullAddress = function() {
  if (this.specificAddress) {
    return `${this.specificAddress}, ${this.location}, ${this.subCounty}, ${this.county}`;
  }
  return `${this.location}, ${this.subCounty}, ${this.county}`;
};

// Static method to find addresses by location for delivery charge calculation
AddressSchema.statics.findByLocation = function(county, subCounty, location) {
  return this.find({ 
    county, 
    subCounty, 
    location 
  });
};

// Static method to get delivery fee for a location
AddressSchema.statics.getDeliveryFee = function(county, subCounty, location) {
  return this.findOne({ 
    county, 
    subCounty, 
    location 
  }).select('deliveryFee');
};

// Pre-save middleware to ensure deliveryFee is set
AddressSchema.pre('save', function(next) {
  // Ensure deliveryFee is a number
  if (this.deliveryFee === undefined || this.deliveryFee === null) {
    this.deliveryFee = 0;
  }
  
  // Sync legacy deliveryCharge field if it exists
  if (this.deliveryCharge !== undefined) {
    this.deliveryFee = this.deliveryCharge;
  }
  
  next();
});

// Ensure virtuals are included in JSON output
AddressSchema.set('toJSON', { virtuals: true });
AddressSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Address", AddressSchema);