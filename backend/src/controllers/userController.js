import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const needPwd = Boolean(req.body.passwordCurrent && req.body.passwordNew);
    const user = await User.findById(req.user.id).select(needPwd ? "+password" : undefined);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullname = req.body.fullname ?? user.fullname;
    user.username = req.body.username ?? user.username;
    user.email = req.body.email ?? user.email;
    user.age = req.body.age ?? user.age;
    user.weight = req.body.weight ?? user.weight;
    user.height = req.body.height ?? user.height;
    user.gender = req.body.gender ?? user.gender;
    user.phone = req.body.phone ?? user.phone;
    user.dob = req.body.dob ?? user.dob;
    user.bio = req.body.bio ?? user.bio;

    if (Array.isArray(req.body.goals)) user.goals = req.body.goals;

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      user.avatar = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    }

    if (needPwd) {
      const ok = await bcrypt.compare(req.body.passwordCurrent, user.password);
      if (!ok) return res.status(400).json({ message: "Current password incorrect" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.passwordNew, salt);
    }

    const updated = await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: updated._id,
        fullname: updated.fullname,
        username: updated.username,
        email: updated.email,
        age: updated.age,
        weight: updated.weight,
        height: updated.height,
        gender: updated.gender,
        goals: updated.goals,
        avatar: updated.avatar ?? null,
        role: updated.role,
        assignedTrainer: updated.assignedTrainer
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsersAndTrainers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrainerUsers = async (req, res) => {
  try {
    const members = await User.find({
      role: "member",
      assignedTrainer: req.user.id
    }).select("-password");
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTrainers = async (_req, res) => {
  try {
    const trainers = await User.find({ role: "trainer" }).select("-password");
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== "trainer") {
      return res.status(404).json({ message: "Trainer not found" });
    }
    const member = await User.findById(req.user.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.assignedTrainer = trainerId;
    await member.save();
    res.json({ message: "Trainer booked successfully", trainer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
