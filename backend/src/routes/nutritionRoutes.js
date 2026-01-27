import express from "express";
import { protect } from "../middleware/auth.js";
import {
    addNutrition,
    getNutrition,
    updateNutrition,
    deleteNutrition,
} from "../controllers/nutritionController.js";

const router = express.Router();

router.route("/")
    .post(protect, addNutrition)
    .get(protect, getNutrition);

router.route("/:id")
    .put(protect, updateNutrition)
    .delete(protect, deleteNutrition);

export default router;
