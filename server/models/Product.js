// server/models/Product.js
const mongoose = require("mongoose");

const VariationSchema = new mongoose.Schema({
  image: { 
    type: String, 
    required: [true, "Variation image is required"],
    trim: true
  },
  label: { 
    type: String, 
    required: [true, "Variation label is required"],
    trim: true,
    maxlength: [100, "Variation label cannot exceed 100 characters"]
  }
}, { 
  _id: true
});

const ProductSchema = new mongoose.Schema(
  {
    image: {
      type: String, 
      trim: true,
      default: null
    },
    // NEW: Array of additional product images
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 10; // Limit to 10 images max
        },
        message: "Cannot have more than 10 product images"
      }
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function(value) {
          return !value || value <= this.price;
        },
        message: "Sale price should be less than or equal to regular price"
      }
    },
    totalStock: {
      type: Number,
      required: [true, "Total stock is required"],
      min: [0, "Stock cannot be negative"]
    },
    averageReview: {
      type: Number,
      default: 0,
      min: [0, "Average review cannot be negative"],
      max: [5, "Average review cannot exceed 5"]
    },
    variations: {
      type: [VariationSchema],
      default: []
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Custom validation: Product must have either main image, images array, or variations
ProductSchema.pre('validate', function(next) {
  const hasMainImage = this.image && this.image.trim().length > 0;
  const hasMultipleImages = this.images && Array.isArray(this.images) && this.images.length > 0;
  const hasVariations = this.variations && Array.isArray(this.variations) && this.variations.length > 0;
  
  if (!hasMainImage && !hasMultipleImages && !hasVariations) {
    return next(new Error('Product must have at least one image (main image, additional images, or variations)'));
  }
  next();
});

// Virtual for getting all product images
ProductSchema.virtual('allImages').get(function() {
  const imageArray = [];
  
  // Add main image first if exists
  if (this.image && this.image.trim().length > 0) {
    imageArray.push(this.image);
  }
  
  // Add additional images
  if (this.images && Array.isArray(this.images)) {
    imageArray.push(...this.images.filter(img => img && img.trim().length > 0));
  }
  
  return imageArray;
});

// Virtual for display image (backwards compatibility)
ProductSchema.virtual('displayImage').get(function() {
  if (this.image && this.image.trim().length > 0) return this.image;
  if (this.images && this.images.length > 0 && this.images[0]) {
    return this.images[0];
  }
  if (this.variations && this.variations.length > 0 && this.variations[0].image) {
    return this.variations[0].image;
  }
  return null;
});

// Indexes
ProductSchema.index({ category: 1, title: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", ProductSchema);