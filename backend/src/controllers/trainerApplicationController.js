import TrainerApplication from "../models/TrainerApplication.js";

/**
 * Public or logged-in user submits a trainer application.
 * 
 * This controller supports:
 * 1. Public trainer application from Trainer Login page
 * 2. Logged-in member application from profile page
 * 3. Certificate image upload using multer
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
                success: false,
                message: "Please fill in all required fields.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Certificate proof image is required.",
            });
        }

        const trimmedEmail = String(email).trim().toLowerCase();

        const emailRegex = /^\S+@\S+\.\S+$/;

        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        /**
         * Since this page is now available from Trainer Login,
         * the applicant may not have req.user.
         * So duplicate checking should be done by email.
         */
        const existingPending = await TrainerApplication.findOne({
            email: trimmedEmail,
            status: "pending",
        });

        if (existingPending) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending trainer application with this email.",
            });
        }

        const existingApproved = await TrainerApplication.findOne({
            email: trimmedEmail,
            status: "approved",
        });

        if (existingApproved) {
            return res.status(400).json({
                success: false,
                message: "This email already has an approved trainer application.",
            });
        }

        const certificateImagePath = `/uploads/trainer-certificates/${req.file.filename}`;

        const application = await TrainerApplication.create({
            user: req.user?._id || null,

            fullName: String(fullName).trim(),
            email: trimmedEmail,
            phone: String(phone).trim(),
            location: String(location).trim(),
            experience: String(experience).trim(),
            specialization: String(specialization).trim(),
            workedPlace: String(workedPlace).trim(),
            workedPlacePhone: String(workedPlacePhone).trim(),
            certificationsText: String(certificationsText).trim(),
            certificateImage: certificateImagePath,
            bio: String(bio).trim(),
            motivation: String(motivation).trim(),

            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Trainer application submitted successfully. Admin will review your application.",
            application,
        });
    } catch (error) {
        console.error("createTrainerApplication error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while submitting trainer application.",
        });
    }
};

/**
 * Logged-in user sees their own trainer applications.
 */
export const getMyTrainerApplications = async (req, res) => {
    try {
        const applications = await TrainerApplication.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications,
        });
    } catch (error) {
        console.error("getMyTrainerApplications error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching your applications.",
        });
    }
};

/**
 * Admin fetches all trainer applications.
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
            .populate("user", "fullname fullName name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications,
        });
    } catch (error) {
        console.error("getAllTrainerApplicationsForAdmin error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching trainer applications.",
        });
    }
};

/**
 * Admin fetches single trainer application detail.
 */
export const getSingleTrainerApplicationForAdmin = async (req, res) => {
    try {
        const application = await TrainerApplication.findById(req.params.id)
            .populate("user", "fullname fullName name email role");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Trainer application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            application,
        });
    } catch (error) {
        console.error("getSingleTrainerApplicationForAdmin error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching application details.",
        });
    }
};

/**
 * Admin updates trainer application status.
 */
export const updateTrainerApplicationStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;

        const allowedStatuses = ["pending", "reviewed", "approved", "rejected"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status.",
            });
        }

        const application = await TrainerApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Trainer application not found.",
            });
        }

        application.status = status;
        application.adminNote = adminNote || "";

        await application.save();

        return res.status(200).json({
            success: true,
            message: "Trainer application updated successfully.",
            application,
        });
    } catch (error) {
        console.error("updateTrainerApplicationStatus error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating application.",
        });
    }
};