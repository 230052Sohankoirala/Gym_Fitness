import Task from "../models/Task.js";

/**
 * @desc   Get all tasks for logged-in user
 * @route  GET /api/tasks
 * @access Private
 */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Add new task
 * @route  POST /api/tasks
 * @access Private
 */
export const addTask = async (req, res) => {
  try {
    const { title, column } = req.body;

    if (!title) return res.status(400).json({ message: "Task title required" });

    const task = await Task.create({
      user: req.user.id,
      title,
      column: column || "todo",
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Update task (move between columns or edit title)
 * @route  PUT /api/tasks/:id
 * @access Private
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = req.body.title || task.title;
    task.column = req.body.column || task.column;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Delete task
 * @route  DELETE /api/tasks/:id
 * @access Private
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
