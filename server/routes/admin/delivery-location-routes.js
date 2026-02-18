// server/routes/admin/delivery-location-routes.js

const express = require("express");
const {
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
} = require("../../controllers/admin/delivery-location-controller");

const router = express.Router();

// Public — used by the storefront address picker
router.get("/public", getAllLocations);

// Admin — full CRUD
router.get("/", getAllLocationsAdmin);
router.post("/seed", seedLocationsFromConfig); // one-time seed from hardcoded config

// County-level
router.post("/county", addCounty);
router.put("/county/:id", updateCounty);
router.delete("/county/:id", deleteCounty);

// Sub-county-level
router.post("/county/:id/subcounty", addSubCounty);
router.put("/county/:id/subcounty/:subCountyId", updateSubCounty);
router.delete("/county/:id/subcounty/:subCountyId", deleteSubCounty);

// Location-level
router.post("/county/:id/subcounty/:subCountyId/location", addLocation);
router.put("/county/:id/subcounty/:subCountyId/location/:locationId", updateLocation);
router.delete("/county/:id/subcounty/:subCountyId/location/:locationId", deleteLocation);

module.exports = router;