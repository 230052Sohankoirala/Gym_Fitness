import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";// eslint-disable-line no-unused-vars
import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext"; // ✅ integrate dark mode

const initialTasks = {
  todo: [
    { id: 1, title: "Morning Yoga" },
    { id: 2, title: "Track Breakfast" },
  ],
  inProgress: [{ id: 3, title: "Upper Body Workout" }],
  completed: [{ id: 4, title: "Weight Check" }],
};

const UserTaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState({});
  const [showInput, setShowInput] = useState({});
  const { darkMode } = useTheme(); // ✅ use dark mode

  const moveTask = (task, fromColumn, toColumn) => {
    setTasks((prev) => {
      const newFrom = prev[fromColumn].filter((t) => t.id !== task.id);
      const newTo = [...prev[toColumn], task];
      return { ...prev, [fromColumn]: newFrom, [toColumn]: newTo };
    });
  };

  const addTask = (colKey) => {
    if (!newTaskTitle[colKey] || newTaskTitle[colKey].trim() === "") return;
    const task = { id: Date.now(), title: newTaskTitle[colKey] };
    setTasks((prev) => ({ ...prev, [colKey]: [...prev[colKey], task] }));
    setNewTaskTitle((prev) => ({ ...prev, [colKey]: "" }));
    setShowInput((prev) => ({ ...prev, [colKey]: false }));
  };

  const columns = [
    { key: "todo", label: "To Do", color: "bg-blue-100 dark:bg-blue-900" },
    { key: "inProgress", label: "In Progress", color: "bg-yellow-100 dark:bg-yellow-900" },
    { key: "completed", label: "Completed", color: "bg-green-100 dark:bg-green-900" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {columns.map((col) => (
        <div
          key={col.key}
          className={`rounded-xl shadow-sm p-4 border transition-colors ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className={`font-bold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            {col.label}
          </h3>

          <Reorder.Group
            axis="y"
            values={tasks[col.key]}
            onReorder={(newOrder) =>
              setTasks((prev) => ({ ...prev, [col.key]: newOrder }))
            }
            className="space-y-3"
          >
            {tasks[col.key].map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                className={`p-3 rounded-lg shadow-sm cursor-grab ${col.color} ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
                whileDrag={{ scale: 1.05 }}
              >
                <div className="flex justify-between items-center">
                  <span>{task.title}</span>
                  <div className="flex space-x-1">
                    {columns
                      .filter((c) => c.key !== col.key)
                      .map((c) => (
                        <button
                          key={c.key}
                          onClick={() => moveTask(task, col.key, c.key)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Input for adding new task */}
          {showInput[col.key] ? (
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                placeholder="Enter task name"
                value={newTaskTitle[col.key] || ""}
                onChange={(e) =>
                  setNewTaskTitle((prev) => ({
                    ...prev,
                    [col.key]: e.target.value,
                  }))
                }
                className={`flex-1 p-2 rounded border transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                onKeyDown={(e) => e.key === "Enter" && addTask(col.key)}
              />
              <button
                onClick={() => addTask(col.key)}
                className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              className="mt-2 flex items-center justify-center w-full py-1 text-sm text-blue-600 border border-blue-200 dark:border-blue-700 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-gray-700"
              onClick={() =>
                setShowInput((prev) => ({ ...prev, [col.key]: true }))
              }
            >
              <Plus size={16} className="mr-1" /> Add Task
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserTaskBoard;
