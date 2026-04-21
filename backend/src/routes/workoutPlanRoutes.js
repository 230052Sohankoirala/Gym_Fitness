import express from "express";
import {
    getWorkoutPlanStatus,
    generateWorkoutPlan,
} from "../controllers/workoutPlanController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

/**
 * Only logged-in members can use this feature.
 */
router.get(
    "/status",
    protect,
    authorizeRoles("member"),
    getWorkoutPlanStatus
);

router.post(
    "/generate",
    protect,
    authorizeRoles("member"),
    generateWorkoutPlan
);

export default router;