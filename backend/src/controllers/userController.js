import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * GET LOGGED-IN MEMBER PROFILE
 * Route: GET /api/users/me
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch profile",
    });
  }
};

/**
 * UPDATE LOGGED-IN MEMBER PROFILE
 * Route: PUT /api/users/me
 *
 * Important:
 * Frontend must send FormData.
 * Avatar field name must be: avatar
 */
export const updateProfile = async (req, res) => {
  try {
    const wantsPasswordChange = Boolean(
      req.body.passwordCurrent && req.body.passwordNew
    );

    const user = await User.findById(req.user.id).select(
      wantsPasswordChange ? "+password" : ""
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /**
     * Normal profile fields
     */
    user.fullname = req.body.fullname ?? user.fullname;
    user.username = req.body.username ?? user.username;
    user.email = req.body.email ?? user.email;
    user.age = req.body.age !== undefined ? Number(req.body.age) : user.age;
    user.weight =
      req.body.weight !== undefined ? Number(req.body.weight) : user.weight;
    user.height =
      req.body.height !== undefined ? Number(req.body.height) : user.height;
    user.gender = req.body.gender ?? user.gender;
    user.phone = req.body.phone ?? user.phone;
    user.dob = req.body.dob ?? user.dob;
    user.bio = req.body.bio ?? user.bio;

    /**
     * Goals can arrive as:
     * 1. Array: ["Lose Weight", "Build Muscle"]
     * 2. JSON string: '["Lose Weight","Build Muscle"]'
     * 3. Comma text: "Lose Weight, Build Muscle"
     */
    if (req.body.goals !== undefined) {
      if (Array.isArray(req.body.goals)) {
        user.goals = req.body.goals;
      } else if (typeof req.body.goals === "string") {
        try {
          const parsedGoals = JSON.parse(req.body.goals);

          if (Array.isArray(parsedGoals)) {
            user.goals = parsedGoals;
          } else {
            user.goals = req.body.goals
              .split(",")
              .map((goal) => goal.trim())
              .filter(Boolean);
          }
        } catch {
          user.goals = req.body.goals
            .split(",")
            .map((goal) => goal.trim())
            .filter(Boolean);
        }
      }
    }

    /**
     * Avatar saving
     *
     * Save relative path only.
     * Do NOT save http://localhost:4000 in MongoDB.
     * This avoids broken images when changing localhost/deployment.
     */
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    /**
     * Password update
     *
     * Important:
     * Do NOT manually hash password here because your User model already
     * hashes password in pre("save").
     */
    if (wantsPasswordChange) {
      const currentPasswordIsCorrect = await bcrypt.compare(
        req.body.passwordCurrent,
        user.password
      );

      if (!currentPasswordIsCorrect) {
        return res.status(400).json({
          message: "Current password incorrect",
        });
      }

      if (String(req.body.passwordNew).length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters long",
        });
      }

      user.password = req.body.passwordNew;
    }

    const updated = await user.save();

    return res.status(200).json({
      message: "Profile updated",
      user: {
        id: updated._id,
        _id: updated._id,
        fullname: updated.fullname,
        username: updated.username,
        email: updated.email,
        age: updated.age,
        weight: updated.weight,
        height: updated.height,
        gender: updated.gender,
        phone: updated.phone,
        dob: updated.dob,
        bio: updated.bio,
        goals: updated.goals,
        avatar: updated.avatar || "",
        role: updated.role,
        assignedTrainer: updated.assignedTrainer,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);

    return res.status(500).json({
      message: err.message || "Failed to update profile",
    });
  }
};

/**
 * GET ALL USERS AND TRAINERS
 * Admin only
 */
export const getAllUsersAndTrainers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * GET TRAINER'S ASSIGNED MEMBERS
 * Trainer only
 */
export const getTrainerUsers = async (req, res) => {
  try {
    const members = await User.find({
      role: "member",
      assignedTrainer: req.user.id,
    }).select("-password");

    return res.status(200).json(members);
  } catch (error) {
    console.error("Get trainer users error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * DELETE USER
 * Admin only
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * GET ALL TRAINERS
 * Member only
 */
export const getAllTrainers = async (_req, res) => {
  try {
    const trainers = await User.find({
      role: "trainer",
    }).select("-password");

    return res.status(200).json(trainers);
  } catch (error) {
    console.error("Get all trainers error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * BOOK TRAINER
 * Member only
 */
export const bookTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;

    const trainer = await User.findById(trainerId);

    if (!trainer || trainer.role !== "trainer") {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    const member = await User.findById(req.user.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    member.assignedTrainer = trainerId;

    await member.save();

    return res.status(200).json({
      message: "Trainer booked successfully",
      trainer,
    });
  } catch (error) {
    console.error("Book trainer error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};