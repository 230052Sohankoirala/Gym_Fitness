// controllers/workoutController.js
import WorkoutLog from "../models/WorkoutLog.js";

/**
 * @desc Log workout completion
 * @route POST /api/workouts/complete
 * @access Private
 */
// controllers/workoutController.js
export const completeWorkout = async (req, res) => {
  try {
    const {
      workoutId,
      workoutName,
      category,
      duration,
      calories,
      intensity,
      countsTowardGoal = true,
    } = req.body;

    const log = await WorkoutLog.create({
      user: req.user.id,  // ✅ requires protect middleware
      workoutId,
      workoutName,
      category,
      duration,
      calories,
      intensity,
      countsTowardGoal,
    });

    res.status(201).json(log);
  } catch (err) {
    console.error("❌ Error in completeWorkout:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * @desc Get user activity logs (day or week)
 * @route GET /api/workouts/logs?period=week|day
 * @access Private
 */
export const getWorkoutLogs = async (req, res) => {
  try {
    const { period } = req.query;
    const now = new Date();
    let start;

    if (period === "week") {
      start = new Date();
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else {
      // default: today
      start = new Date();
      start.setHours(0, 0, 0, 0);
    }

    const logs = await WorkoutLog.find({
      user: req.user.id,
      completedAt: { $gte: start },
    }).sort({ completedAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error("❌ Error in getWorkoutLogs:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get goal completion %
 * @route GET /api/workouts/progress
 * @access Private
 */
export const getGoalProgress = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // count only today's workouts that count toward goals
    const todayCompleted = await WorkoutLog.countDocuments({
      user: req.user.id,
      countsTowardGoal: true,
      completedAt: { $gte: startOfDay },
    });

    // assume daily target = 5 workouts → 100%
    const percentage = Math.min(100, Math.round((todayCompleted / 5) * 100));

    res.json({ completed: todayCompleted, percentage });
  } catch (err) {
    console.error("❌ Error in getGoalProgress:", err);
    res.status(500).json({ message: err.message });
  }
};


