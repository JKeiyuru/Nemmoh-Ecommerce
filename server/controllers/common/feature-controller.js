// server/controllers/common/feature-controller.js
const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log('📸 Adding feature image:', image?.substring(0, 50) + '...');

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.error('❌ Error adding feature image:', e);
    res.status(500).json({
      success: false,
      message: "Error occurred!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.error('❌ Error getting feature images:', e);
    res.status(500).json({
      success: false,
      message: "Error occurred!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting feature image:', id);

    const image = await Feature.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    console.log('✅ Feature image deleted successfully');

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (e) {
    console.error('❌ Error deleting feature image:', e);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting image",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };