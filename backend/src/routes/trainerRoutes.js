// routes/trainerRoutes.js
import express from "express";
import {
  createTrainer,
  trainerLogin,
  getTrainerProfile,
  getAllTrainers,
  getPublicTrainers,
  deleteTrainer,
  updateTrainer,
  getTrainerDashboard,
  upload,
  uploadAvatar,
  getTrainerTasks,
  createTrainerTask,
  updateTrainerTask,
  deleteTrainerTask,
} from "../controllers/trainerController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

/* auth/profile */
router.post("/login", trainerLogin);
router.get("/me", protect, authorizeRoles("trainer"), getTrainerProfile);

/* admin trainer mgmt */
router.post("/", protect, authorizeRoles("admin"), createTrainer);
router.get("/", protect, authorizeRoles("admin"), getAllTrainers);
router.put("/:id", protect, authorizeRoles("admin", "trainer"), updateTrainer);
router.delete("/:id", protect, authorizeRoles("admin"), deleteTrainer);

/* public */
router.get("/public", protect, authorizeRoles("member", "trainer", "admin"), getPublicTrainers);

/* dashboard */
router.get("/dashboard", protect, authorizeRoles("trainer"), getTrainerDashboard);

/* avatar */
router.post("/:id/avatar", protect, authorizeRoles("admin", "trainer"), upload.single("avatar"), uploadAvatar);

/* tasks */
router.get("/tasks/my", protect, authorizeRoles("trainer"), getTrainerTasks);
// alias so your frontend /api/trainers/tasks also works
router.get("/tasks", protect, authorizeRoles("trainer"), getTrainerTasks);
router.post("/tasks", protect, authorizeRoles("trainer"), createTrainerTask);
router.put("/tasks/:id", protect, authorizeRoles("trainer"), updateTrainerTask);
router.delete("/tasks/:id", protect, authorizeRoles("trainer"), deleteTrainerTask);

export default router;
