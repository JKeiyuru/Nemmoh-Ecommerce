// server/controllers/admin/delivery-location-controller.js

const DeliveryLocation = require("../../models/DeliveryLocation");

// Get all delivery locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await DeliveryLocation.find({ isActive: true }).sort({ county: 1 });
    res.status(200).json({ success: true, data: locations });
  } catch (e) {
    console.error("Error fetching delivery locations:", e);
    res.status(500).json({ success: false, message: "Failed to fetch delivery locations" });
  }
};

// Get all locations (including inactive) for admin
const getAllLocationsAdmin = async (req, res) => {
  try {
    const locations = await DeliveryLocation.find({}).sort({ county: 1 });
    res.status(200).json({ success: true, data: locations });
  } catch (e) {
    console.error("Error fetching all delivery locations:", e);
    res.status(500).json({ success: false, message: "Failed to fetch delivery locations" });
  }
};

// Add a new county
const addCounty = async (req, res) => {
  try {
    const { county } = req.body;
    if (!county || !county.trim()) {
      return res.status(400).json({ success: false, message: "County name is required" });
    }

    const existing = await DeliveryLocation.findOne({ county: county.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "County already exists" });
    }

    const newCounty = new DeliveryLocation({
      county: county.trim(),
      subCounties: [],
    });

    await newCounty.save();
    res.status(201).json({ success: true, data: newCounty, message: "County added successfully" });
  } catch (e) {
    console.error("Error adding county:", e);
    res.status(500).json({ success: false, message: "Failed to add county" });
  }
};

// Update county name / active status
const updateCounty = async (req, res) => {
  try {
    const { id } = req.params;
    const { county, isActive } = req.body;

    const update = {};
    if (county !== undefined) update.county = county.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const updated = await DeliveryLocation.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "County not found" });

    res.status(200).json({ success: true, data: updated, message: "County updated successfully" });
  } catch (e) {
    console.error("Error updating county:", e);
    res.status(500).json({ success: false, message: "Failed to update county" });
  }
};

// Delete a county
const deleteCounty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DeliveryLocation.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "County not found" });

    res.status(200).json({ success: true, message: "County deleted successfully" });
  } catch (e) {
    console.error("Error deleting county:", e);
    res.status(500).json({ success: false, message: "Failed to delete county" });
  }
};

// Add a sub-county to an existing county
const addSubCounty = async (req, res) => {
  try {
    const { id } = req.params; // county document id
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Sub-county name is required" });
    }

    const county = await DeliveryLocation.findById(id);
    if (!county) return res.status(404).json({ success: false, message: "County not found" });

    const exists = county.subCounties.some(sc => sc.name === name.trim());
    if (exists) {
      return res.status(409).json({ success: false, message: "Sub-county already exists in this county" });
    }

    county.subCounties.push({ name: name.trim(), locations: [] });
    await county.save();

    res.status(201).json({ success: true, data: county, message: "Sub-county added successfully" });
  } catch (e) {
    console.error("Error adding sub-county:", e);
    res.status(500).json({ success: false, message: "Failed to add sub-county" });
  }
};

// Update a sub-county name
const updateSubCounty = async (req, res) => {
  try {
    const { id, subCountyId } = req.params;
    const { name } = req.body;

    const county = await DeliveryLocation.findById(id);
    if (!county) return res.status(404).json({ success: false, message: "County not found" });

    const subCounty = county.subCounties.id(subCountyId);
    if (!subCounty) return res.status(404).json({ success: false, message: "Sub-county not found" });

    if (name) subCounty.name = name.trim();
    await county.save();

    res.status(200).json({ success: true, data: county, message: "Sub-county updated successfully" });
  } catch (e) {
    console.error("Error updating sub-county:", e);
    res.status(500).json({ success: false, message: "Failed to update sub-county" });
  }
};

// Delete a sub-county
const deleteSubCounty = async (req, res) => {
  try {
    const { id, subCountyId } = req.params;

    const county = await DeliveryLocation.findById(id);
    if (!county) return res.status(404).json({ success: false, message: "County not found" });

    county.subCounties = county.subCounties.filter(sc => sc._id.toString() !== subCountyId);
    await county.save();

    res.status(200).json({ success: true, data: county, message: "Sub-county deleted successfully" });
  } catch (e) {
    console.error("Error deleting sub-county:", e);
    res.status(500).json({ success: false, message: "Failed to delete sub-county" });
  }
};

// Add a location (with delivery fee) to a sub-county
const addLocation = async (req, res) => {
  try {
    const { id, subCountyId } = req.params;
    const { name, deliveryFee } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Location name is required" });
    }
    if (deliveryFee === undefined || deliveryFee === null || isNaN(Number(deliveryFee))) {
      return res.status(400).json({ success: false, message: "A valid delivery fee is required" });
    }

    const county = await DeliveryLocation.findById(id);
    if (!county) return res.status(404).json({ success: false, message: "County not found" });

    const subCounty = county.subCounties.id(subCountyId);
    if (!subCounty) return res.status(404).json({ success: false, message: "Sub-county not found" });

    const exists = subCounty.locations.some(loc => loc.name === name.trim());
    if (exists) {
      return res.status(409).json({ success: false, message: "Location already exists in this sub-county" });
    }

    subCounty.locations.push({ name: name.trim(), deliveryFee: Number(deliveryFee) });
    await county.save();

    res.status(201).json({ success: true, data: county, message: "Location added successfully" });
  } catch (e) {
    console.error("Error adding location:", e);
    res.status(500).json({ success: false, message: "Failed to add location" });
  }
};

// Update a location (name and/or fee)
const updateLocation = async (req, res) => {
  try {
    const { id, subCountyId, locationId } = req.params;
    const { name, deliveryFee } = req.body;

    const county = await DeliveryLocation.findById(id);
    if (!county) return res.status(404).json({ success: false, message: "County not found" });

    const subCounty = county.subCounties.id(subCountyId);
    if (!subCounty) return res.status(404).json({ success: false, message: "Sub-county not found" });

    const location = subCounty.locations.id(locationId);
    if (!location) return res.status(404).json({ success: false, message: "Location not found" });

    if (name !== undefined) location.name = name.trim();
    if (deliveryFee !== undefined) location.deliveryFee = Number(deliveryFee);

    await county.save();

    res.status(200).json({ success: true, data: county, message: "Location updated successfully" });
  } catch (e) {
    console.error("Error updating location:", e);
    res.status(500).json({ success: false, message: "Failed to update location" });
  }
};

// Delete a location
const deleteLocation = async (req, res) => {
  try {
    const { id, subCountyId, locationId } = req.params;

    const county = await DeliveryLocation.findById(id);
    if (!county) return res.status(404).json({ success: false, message: "County not found" });

    const subCounty = county.subCounties.id(subCountyId);
    if (!subCounty) return res.status(404).json({ success: false, message: "Sub-county not found" });

    subCounty.locations = subCounty.locations.filter(loc => loc._id.toString() !== locationId);
    await county.save();

    res.status(200).json({ success: true, data: county, message: "Location deleted successfully" });
  } catch (e) {
    console.error("Error deleting location:", e);
    res.status(500).json({ success: false, message: "Failed to delete location" });
  }
};

// Seed initial data from the hardcoded config (one-time import)
const seedLocationsFromConfig = async (req, res) => {
  try {
    const { kenyaLocationData } = require("../../config/kenya-location-data");

    let created = 0;
    let skipped = 0;

    for (const [countyKey, countyData] of Object.entries(kenyaLocationData)) {
      const exists = await DeliveryLocation.findOne({ county: countyData.name });
      if (exists) { skipped++; continue; }

      const subCounties = Object.entries(countyData.subCounties).map(([, scData]) => ({
        name: scData.name,
        locations: scData.locations.map(loc => ({
          name: loc.name,
          deliveryFee: loc.deliveryFee,
        })),
      }));

      await DeliveryLocation.create({ county: countyData.name, subCounties });
      created++;
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${created} counties. ${skipped} already existed.`,
    });
  } catch (e) {
    console.error("Seed error:", e);
    res.status(500).json({ success: false, message: "Failed to seed locations" });
  }
};

module.exports = {
  getAllLocations,
  getAllLocationsAdmin,
  addCounty,
  updateCounty,
  deleteCounty,
  addSubCounty,
  updateSubCounty,
  deleteSubCounty,
  addLocation,
  updateLocation,
  deleteLocation,
  seedLocationsFromConfig,
};