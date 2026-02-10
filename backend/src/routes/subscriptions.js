// backend/routes/subscriptions.js
import express from "express";
import Subscription from "../models/Subscription.js";
import   { protect } from "../middleware/auth.js";


const router = express.Router();

router.get("/active",protect , async (req, res) => {
    try {
        const sub = await Subscription.findOne({
            member: req.user._id,
            active: true,
        }).sort({ createdAt: -1 });

        return res.json(sub || null);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Cannot fetch subscription" });
    }
});

export default router;
