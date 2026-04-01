import TrainerApplication from "../models/TrainerApplication.js";

/**
 * User submits a trainer application
 */
export const createTrainerApplication = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            location,
            experience,
            specialization,
            workedPlace,
            workedPlacePhone,
            certificationsText,
            bio,
            motivation,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !location ||
            !experience ||
            !specialization ||
            !workedPlace ||
            !workedPlacePhone ||
            !certificationsText ||
            !bio ||
            !motivation
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Certificate proof image is required.",
            });
        }

        const existingPending = await TrainerApplication.findOne({
            user: req.user?._id || null,
            status: "pending",
        });

        if (existingPending) {
            return res.status(400).json({
                message: "You already have a pending trainer application.",
            });
        }

        const certificateImagePath = `/uploads/trainer-certificates/${req.file.filename}`;

        const application = await TrainerApplication.create({
            user: req.user?._id || null,
            fullName,
            email,
            phone,
            location,
            experience,
            specialization,
            workedPlace,
            workedPlacePhone,
            certificationsText,
            certificateImage: certificateImagePath,
            bio,
            motivation,
            status: "pending",
        });

        return res.status(201).json({
            message: "Trainer application submitted successfully.",
            application,
        });
    } catch (error) {
        console.error("createTrainerApplication error:", error);
        return res.status(500).json({
            message: "Server error while submitting trainer application.",
        });
    }
};

/**
 * Logged-in user sees their own applications
 */
export const getMyTrainerApplications = async (req, res) => {
    try {
        const applications = await TrainerApplication.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json(applications);
    } catch (error) {
        console.error("getMyTrainerApplications error:", error);
        return res.status(500).json({
            message: "Server error while fetching your applications.",
        });
    }
};

/**
 * Admin fetch all trainer applications
 */
export const getAllTrainerApplicationsForAdmin = async (req, res) => {
    try {
        const { status, search } = req.query;

        const filter = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { specialization: { $regex: search, $options: "i" } },
                { workedPlace: { $regex: search, $options: "i" } },
            ];
        }

        const applications = await TrainerApplication.find(filter)
            .populate("user", "fullname email role")
            .sort({ createdAt: -1 });

        return res.status(200).json(applications);
    } catch (error) {
        console.error("getAllTrainerApplicationsForAdmin error:", error);
        return res.status(500).json({
            message: "Server error while fetching trainer applications.",
        });
    }
};

/**
 * Admin fetch single application detail
 */
export const getSingleTrainerApplicationForAdmin = async (req, res) => {
    try {
        const application = await TrainerApplication.findById(req.params.id).populate(
            "user",
            "fullname email role"
        );

        if (!application) {
            return res.status(404).json({
                message: "Trainer application not found.",
            });
        }

        return res.status(200).json(application);
    } catch (error) {
        console.error("getSingleTrainerApplicationForAdmin error:", error);
        return res.status(500).json({
            message: "Server error while fetching application details.",
        });
    }
};

/**
 * Admin updates application status
 */
export const updateTrainerApplicationStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;

        if (!["pending", "reviewed", "approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid application status.",
            });
        }

        const application = await TrainerApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                message: "Trainer application not found.",
            });
        }

        application.status = status;
        application.adminNote = adminNote || "";

        await application.save();

        return res.status(200).json({
            message: "Trainer application updated successfully.",
            application,
        });
    } catch (error) {
        console.error("updateTrainerApplicationStatus error:", error);
        return res.status(500).json({
            message: "Server error while updating application.",
        });
    }
};