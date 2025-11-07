// server/controllers/shop/address-controller.js
const Address = require("../../models/Address");

const addAddress = async (req, res) => {
  try {
    const { 
      userId, 
      county, 
      subCounty, 
      location, 
      specificAddress,
      phone, 
      notes,
      deliveryFee,
      // Legacy fields for backward compatibility
      address,
      city,
      pincode
    } = req.body;

    console.log('📍 Adding address:', { userId, county, subCounty, location, deliveryFee });

    // Validate required fields (new format)
    if (userId && county && subCounty && location && phone) {
      const newlyCreatedAddress = new Address({
        userId,
        county,
        subCounty,
        location,
        specificAddress: specificAddress || "",
        phone,
        notes: notes || "",
        deliveryFee: deliveryFee || 0,
      });

      await newlyCreatedAddress.save();

      console.log('✅ Address saved:', newlyCreatedAddress._id);

      return res.status(201).json({
        success: true,
        data: newlyCreatedAddress,
      });
    }
    
    // Fallback to legacy format for backward compatibility
    if (userId && address && city && pincode && phone) {
      const newlyCreatedAddress = new Address({
        userId,
        county: city, // Map old fields to new
        subCounty: address,
        location: address,
        specificAddress: address,
        phone,
        notes: notes || "",
        deliveryFee: 0,
      });

      await newlyCreatedAddress.save();

      return res.status(201).json({
        success: true,
        data: newlyCreatedAddress,
      });
    }

    // If neither format is complete, return error
    return res.status(400).json({
      success: false,
      message: "Missing required fields. Please provide: userId, county, subCounty, location, and phone",
    });

  } catch (e) {
    console.error('❌ Error adding address:', e);
    res.status(500).json({
      success: false,
      message: "Error adding address",
      error: e.message,
    });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required!",
      });
    }

    const addressList = await Address.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addressList,
    });
  } catch (e) {
    console.error('❌ Error fetching addresses:', e);
    res.status(500).json({
      success: false,
      message: "Error fetching addresses",
    });
  }
};

const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;

    console.log('✏️ Editing address:', addressId, formData);

    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User and address id is required!",
      });
    }

    const address = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
      },
      formData,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    console.log('✅ Address updated:', address._id);

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (e) {
    console.error('❌ Error editing address:', e);
    res.status(500).json({
      success: false,
      message: "Error updating address",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    
    console.log('🗑️ Deleting address:', addressId);
    
    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User and address id is required!",
      });
    }

    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    console.log('✅ Address deleted:', addressId);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (e) {
    console.error('❌ Error deleting address:', e);
    res.status(500).json({
      success: false,
      message: "Error deleting address",
    });
  }
};

module.exports = { addAddress, editAddress, fetchAllAddress, deleteAddress };