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

router.post(
    "/",
    protect,
    uploadTrainerCertificate.single("certificateImage"),
    createTrainerApplication
);

router.get("/my-applications", protect, getMyTrainerApplications);

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