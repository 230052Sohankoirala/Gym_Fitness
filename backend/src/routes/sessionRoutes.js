// routes/sessionRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import {
  createSession,
  getAllSessions,
  getTrainerSessions,
  updateSession,
  deleteSession,
  getPublicSessions,
  joinSession,
  startSession,
  completeSession,
  cancelSession,
  getTrainerClients,
} from "../controllers/sessionController.js";

const router = express.Router();

/* Trainer-only create */
router.post("/", protect, authorizeRoles("trainer"), createSession);

/* Admin: view all */
router.get("/", protect, authorizeRoles("admin"), getAllSessions);

/* Trainer: view own */
router.get("/my", protect, authorizeRoles("trainer"), getTrainerSessions);

/* Trainer: unique booked clients */
router.get("/my/clients", protect, authorizeRoles("trainer"), getTrainerClients);

/* Admin + Trainer: update/delete */
router.put("/:id", protect, authorizeRoles("trainer", "admin"), updateSession);
router.delete("/:id", protect, authorizeRoles("trainer", "admin"), deleteSession);

/* Member routes */
router.get("/public", protect, authorizeRoles("member", "trainer", "admin"), getPublicSessions);
router.post("/:id/join", protect, authorizeRoles("member"), joinSession);

/* Trainer actions */
router.post("/:id/start", protect, authorizeRoles("trainer", "admin"), startSession);
router.post("/:id/complete", protect, authorizeRoles("trainer", "admin"), completeSession);
router.post("/:id/cancel", protect, authorizeRoles("trainer", "admin"), cancelSession);

export default router;
