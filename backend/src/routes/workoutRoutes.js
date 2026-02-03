// routes/workoutRoutes.js
import express from "express";
import { completeWorkout, getWorkoutLogs, getGoalProgress } from "../controllers/workoutController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/complete", protect, completeWorkout);
router.get("/logs", protect, getWorkoutLogs);
router.get("/progress", protect, getGoalProgress);

export default router;
