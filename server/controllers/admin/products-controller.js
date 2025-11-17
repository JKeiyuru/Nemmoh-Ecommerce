// server/controllers/admin/products-controller.js
const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Upload image to Cloudinary
const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.json({
      success: false,
      message: "Error occurred during image upload",
    });
  }
};

//Add a new product
const addProduct = async (req, res) => {
  try {
    console.log("=== ADD PRODUCT REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      image,
      images, // NEW: Multiple images
      title,
      description,
      category,
      price,
      salePrice,
      totalStock,
      averageReview,
      variations
    } = req.body;

    // Validate required fields
    if (!title || !category || price === undefined || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, category, price, and totalStock are required",
      });
    }

    // Parse images array
    let parsedImages = [];
    if (images) {
      try {
        if (typeof images === 'string') {
          parsedImages = JSON.parse(images);
        } else if (Array.isArray(images)) {
          parsedImages = images;
        }
        
        // Filter out empty or invalid URLs
        parsedImages = parsedImages.filter(img => 
          img && typeof img === 'string' && img.trim().length > 0
        );
      } catch (err) {
        console.error("Failed to parse images:", err);
        parsedImages = [];
      }
    }

    // If no images array but has single image, use it
    if (parsedImages.length === 0 && image) {
      parsedImages = [image];
    }

    // Parse variations
    let parsedVariations = [];
    if (variations) {
      try {
        if (typeof variations === 'string') {
          parsedVariations = JSON.parse(variations);
        } else if (Array.isArray(variations)) {
          parsedVariations = variations;
        }
        
        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
          for (let i = 0; i < parsedVariations.length; i++) {
            const variation = parsedVariations[i];
            if (!variation.image || !variation.label) {
              return res.status(400).json({
                success: false,
                message: `Variation ${i + 1} is missing image or label`,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse variations:", err);
        parsedVariations = [];
      }
    }

    // Validate that product has at least one image
    const hasImages = parsedImages.length > 0;
    const hasVariations = parsedVariations.length > 0;
    
    if (!hasImages && !hasVariations) {
      return res.status(400).json({
        success: false,
        message: "Product must have at least one image (either main images or variations)",
      });
    }

    const productData = {
      image: parsedImages[0] || null, // First image as main (backward compatibility)
      images: parsedImages, // NEW: All images
      title: title.trim(),
      description: description ? description.trim() : "",
      category: category.trim(),
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock),
      averageReview: averageReview ? Number(averageReview) : 0,
      variations: parsedVariations
    };

    console.log("Creating product with data:", {
      ...productData,
      imagesCount: productData.images.length,
      variationsCount: productData.variations.length
    });

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    console.log("Product saved successfully:", {
      id: savedProduct._id,
      imagesCount: savedProduct.images.length,
      variationsCount: savedProduct.variations.length
    });

    res.status(201).json({
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product",
      error: error.message,
    });
  }
};

// Fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

// Edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=== EDIT PRODUCT REQUEST ===");
    console.log("Product ID:", id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      image,
      images, // NEW: Multiple images
      title,
      description,
      category,
      price,
      salePrice,
      totalStock,
      averageReview,
      variations
    } = req.body;

    // Validate required fields
    if (!title || !category || price === undefined || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, category, price, and totalStock are required",
      });
    }

    // Parse images array
    let parsedImages = [];
    if (images) {
      try {
        if (typeof images === 'string') {
          parsedImages = JSON.parse(images);
        } else if (Array.isArray(images)) {
          parsedImages = images;
        }
        
        parsedImages = parsedImages.filter(img => 
          img && typeof img === 'string' && img.trim().length > 0
        );
      } catch (err) {
        console.error("Failed to parse images:", err);
        parsedImages = [];
      }
    }

    // If no images array but has single image, use it
    if (parsedImages.length === 0 && image) {
      parsedImages = [image];
    }

    // Parse variations
    let parsedVariations = [];
    if (variations) {
      try {
        if (typeof variations === "string") {
          parsedVariations = JSON.parse(variations);
        } else if (Array.isArray(variations)) {
          parsedVariations = variations;
        }
        
        if (parsedVariations && parsedVariations.length > 0) {
          for (let i = 0; i < parsedVariations.length; i++) {
            const variation = parsedVariations[i];
            if (!variation.image || !variation.label) {
              return res.status(400).json({
                success: false,
                message: `Variation ${i + 1} is missing image or label`,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse variations:", err);
        parsedVariations = [];
      }
    }

    // Validate that product has at least one image
    const hasImages = parsedImages.length > 0;
    const hasVariations = parsedVariations.length > 0;
    
    if (!hasImages && !hasVariations) {
      return res.status(400).json({
        success: false,
        message: "Product must have at least one image (either main images or variations)",
      });
    }

    const updateData = {
      image: parsedImages[0] || null, // First image as main (backward compatibility)
      images: parsedImages, // NEW: All images
      title: title.trim(),
      description: description ? description.trim() : "",
      category: category.trim(),
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock),
      averageReview: averageReview ? Number(averageReview) : 0,
      variations: parsedVariations
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product updated successfully:", {
      id: updatedProduct._id,
      imagesCount: updatedProduct.images.length,
      variationsCount: updatedProduct.variations.length
    });

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Edit Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while editing product",
      error: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};