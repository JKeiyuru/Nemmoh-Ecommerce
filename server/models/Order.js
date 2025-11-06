// server/models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartId: { type: String, required: true },
  cartItems: [
    {
      productId: { type: String, required: true },
      title: { type: String, required: true },
      image: String,
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  addressInfo: {
    addressId: String,
    county: String,
    district: String,
    location: String,
    phone: String,
    notes: String,
    deliveryCharge: Number,
    fullAddress: String,
    // Legacy fields for backward compatibility
    address: String,
    city: String,
    pincode: String,
    subCounty: String,
    specificAddress: String,
    deliveryFee: Number,
  },
  orderStatus: { 
    type: String, 
    default: "pending",
    enum: [
      "pending", 
      "pending_verification", 
      "confirmed", 
      "processing", 
      "inProcess",
      "shipped", 
      "inShipping",
      "delivered", 
      "cancelled",
      "rejected"
    ]
  },
  paymentMethod: { type: String, required: true }, // e.g. 'paypal', 'mpesa', 'manual_mpesa'
  paymentStatus: { 
    type: String, 
    default: "pending",
    enum: ["pending", "awaiting_verification", "paid", "completed", "failed", "refunded"]
  },
  totalAmount: { type: Number, required: true },
  subtotalAmount: Number,
  deliveryAmount: Number,
  orderDate: { type: Date, default: Date.now },
  orderUpdateDate: { type: Date, default: Date.now },
  paymentId: String,
  payerId: String,
  
  // Manual payment verification fields
  paymentVerificationNote: String,
  paymentVerifiedAt: Date,
  verifiedBy: String,
  
  // Additional fields for better order management
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  trackingNumber: String,
  deliveryNotes: String,
});

// Indexes for better query performance
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ "addressInfo.county": 1, "addressInfo.district": 1, "addressInfo.location": 1 });

// Pre-save middleware to update orderUpdateDate
OrderSchema.pre('save', function(next) {
  this.orderUpdateDate = new Date();
  
  // Set full address for display purposes if not already set
  if (this.addressInfo) {
    // Handle both new and legacy field formats
    const location = this.addressInfo.location || this.addressInfo.address;
    const district = this.addressInfo.district || this.addressInfo.subCounty;
    const county = this.addressInfo.county;
    
    if (location && district && county && !this.addressInfo.fullAddress) {
      this.addressInfo.fullAddress = `${location}, ${district}, ${county}`;
    }
  }
  
  next();
});

// Method to calculate total with delivery
OrderSchema.methods.calculateTotal = function() {
  const subtotal = this.cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.subtotalAmount = subtotal;
  this.deliveryAmount = this.addressInfo.deliveryCharge || this.addressInfo.deliveryFee || 0;
  this.totalAmount = subtotal + this.deliveryAmount;
  
  return this.totalAmount;
};

// Method to update order status with timestamp
OrderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.orderStatus = newStatus;
  this.orderUpdateDate = new Date();
  
  if (notes) {
    this.deliveryNotes = notes;
  }
  
  // Set actual delivery date when order is delivered
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }
  
  return this.save();
};

// Static method to find orders by location (useful for delivery management)
OrderSchema.statics.findByLocation = function(county, district, location) {
  return this.find({
    $or: [
      {
        "addressInfo.county": county,
        "addressInfo.district": district,
        "addressInfo.location": location
      },
      {
        "addressInfo.county": county,
        "addressInfo.subCounty": district,
        "addressInfo.address": location
      }
    ]
  });
};

module.exports = mongoose.model("Order", OrderSchema);