import express from "express";

import {
    createTrainerApplication,
    getMyTrainerApplications,
    getAllTrainerApplicationsForAdmin,
    getSingleTrainerApplicationForAdmin,
    updateTrainerApplicationStatus,
} from "../controllers/trainerApplicationController.js";

import uploadTrainerCertificate from "../middleware/uploadTrainerCertificate.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * PUBLIC ROUTE
 * Anyone can submit trainer application from trainer login page.
 * Do NOT add protect here.
 */
router.post(
    "/",
    uploadTrainerCertificate.single("certificateImage"),
    createTrainerApplication
);

/**
 * PROTECTED ROUTE
 * Only logged-in users can see their own applications.
 */
router.get(
    "/my-applications",
    protect,
    getMyTrainerApplications
);

/**
 * ADMIN ROUTES
 */
router.get(
    "/admin/all",
    protect,
    requireRole("admin"),
    getAllTrainerApplicationsForAdmin
);

router.get(
    "/admin/:id",
    protect,
    requireRole("admin"),
    getSingleTrainerApplicationForAdmin
);

router.put(
    "/admin/:id/status",
    protect,
    requireRole("admin"),
    updateTrainerApplicationStatus
);

export default router;