// routes/settingsRoutes.js
import express from "express";
import {
  getSettings,
  getPublicSettings,
  updateSettings,
  updateSettingsSection,
  resetSettings,
  getSettingsMeta,
} from "../controllers/settingsController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// optional public endpoint
router.get("/public", getPublicSettings);

// admin endpoints
router.get("/", protect, authorizeRoles("admin"), getSettings);
router.get("/meta", protect, authorizeRoles("admin"), getSettingsMeta);
router.put("/", protect, authorizeRoles("admin"), updateSettings);
router.patch("/:section", protect, authorizeRoles("admin"), updateSettingsSection);
router.post("/reset", protect, authorizeRoles("admin"), resetSettings);

export default router;
