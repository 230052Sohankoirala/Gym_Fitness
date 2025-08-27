import React, { useState } from "react";
import { Reorder } from "framer-motion";
import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Columns info
const columns = [
  { key: "todo", label: "To Do", color: "bg-blue-100 dark:bg-blue-900" },
  { key: "inProgress", label: "In Progress", color: "bg-yellow-100 dark:bg-yellow-900" },
  { key: "completed", label: "Completed", color: "bg-green-100 dark:bg-green-900" },
];

// Initial tasks
const initialTasks = {
  todo: [{ id: 1, title: "Morning Yoga" }, { id: 2, title: "Track Breakfast" }],
  inProgress: [{ id: 3, title: "Upper Body Workout" }],
  completed: [{ id: 4, title: "Weight Check" }],
};

const UserTaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [errors, setErrors] = useState({});
  const [taskInputs, setTaskInputs] = useState({
    todo: { show: false, title: "" },
    inProgress: { show: false, title: "" },
    completed: { show: false, title: "" },

  });




  const { darkMode } = useTheme(); //dark mode

  // Add new task
  const addTask = (colKey) => {
    const newTasks = { id: new Date().getTime(), title: taskInputs[colKey].title };
    if (!newTasks.title.trim()) {
      setErrors((prev) =>
      ({
        ...prev,
        [colKey]: "Task title is required"
      }));
      return;
    }
    setTasks((prev) => ({
      ...prev,
      [colKey]: [...prev[colKey], newTasks],






    }))

    setTaskInputs((prev) => ({
      ...prev,
      [colKey]: { show: false, title: "" },
    }));

    setErrors((prev) => ({
      ...prev,
      [colKey]: "",
    }));

  }

  // Move task to another column
  const moveTask = (task, from, to) => {
    setTasks((prev)=>({
      ...prev,
      [from]:prev[from].filter((t) => t.id !== task.id),
      [to]:[...prev[to],task]



    }))
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:w-3/2 gap-4 mt-8">
      {columns.map((col) => (
        <div
          key={col.key}
          className={`rounded-xl shadow-sm p-4 border transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
        >
          <h3
            className={`font-bold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"
              }`}
          >
            {col.label}
          </h3>

          {/* Tasks List */}
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
                className={`p-3 rounded-lg shadow-sm cursor-grab ${col.color} ${darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                whileDrag={{ scale: 1.05 }}
              >
                <div className="flex justify-between items-center">
                  <span>{task.title}</span>

                  {/* Move buttons */}
                  <div className="flex space-x-1">
                    {columns
                      .filter((c) => c.key !== col.key)
                      .map((c) => (
                        <button
                          key={c.key}
                          onClick={() => moveTask(task, col.key, c.key)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${darkMode
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

          {/* Add Task Input */}
          {taskInputs[col.key].show ? (
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                placeholder={errors[col.key] ? errors[col.key] : "Enter task"}
                value={taskInputs[col.key].title}
                onChange={(e) =>
                  setTaskInputs((prev) => ({
                    ...prev,
                    [col.key]: { ...prev[col.key], title: e.target.value },
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && addTask(col.key)}
                className={`flex-1 p-2 rounded border transition-colors ${errors[col.key]
                  ? "border-red-500 placeholder-red-500 focus:ring-red-500"
                  : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-800"
                  }`}
              />

              <button
                onClick={() => addTask(col.key)}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              className="mt-2 flex items-center justify-center w-full py-1 text-sm text-blue-600 border border-blue-200 dark:border-blue-700 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-gray-700"
              onClick={() =>
                setTaskInputs((prev) => ({
                  ...prev,
                  [col.key]: { ...prev[col.key], show: true },
                }))
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
