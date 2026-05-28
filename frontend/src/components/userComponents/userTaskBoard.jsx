import React, { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

/* ================== API Base URL ================== */
/**
 * Local:
 * VITE_API_BASE_URL=http://localhost:4000
 *
 * Render:
 * VITE_API_BASE_URL=https://your-backend-name.onrender.com
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Columns
const columns = [
  {
    key: "todo",
    label: "To Do",
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    key: "inProgress",
    label: "In Progress",
    color: "bg-yellow-100 dark:bg-yellow-900",
  },
  {
    key: "completed",
    label: "Completed",
    color: "bg-green-100 dark:bg-green-900",
  },
];

const UserTaskBoard = () => {
  const { darkMode } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [errMsg, setErrMsg] = useState("");

  const [taskInputs, setTaskInputs] = useState({
    todo: {
      show: false,
      title: "",
    },
    inProgress: {
      show: false,
      title: "",
    },
    completed: {
      show: false,
      title: "",
    },
  });

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch tasks on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!token) {
          setErrMsg("No token found. Please login again.");
          return;
        }

        const { data } = await api.get("/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTasks(Array.isArray(data) ? data : []);
        setErrMsg("");
      } catch (err) {
        console.error("Error fetching tasks:", err.response?.data || err);
        setErrMsg(err.response?.data?.message || "Failed to load tasks.");
      }
    };

    fetchTasks();
  }, [token]);

  // Add new task
  const addTask = async (colKey) => {
    const title = taskInputs[colKey].title.trim();

    if (!title) {
      setErrors((prev) => ({
        ...prev,
        [colKey]: "Task title is required",
      }));
      return;
    }

    try {
      const { data } = await api.post(
        "/api/tasks",
        {
          title,
          column: colKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) => [...prev, data]);

      setTaskInputs((prev) => ({
        ...prev,
        [colKey]: {
          show: false,
          title: "",
        },
      }));

      setErrors((prev) => ({
        ...prev,
        [colKey]: "",
      }));

      setErrMsg("");
    } catch (err) {
      console.error("Error adding task:", err.response?.data || err);
      setErrMsg(err.response?.data?.message || "Failed to add task.");
    }
  };

  // Move task to another column
  const moveTask = async (task, newCol) => {
    try {
      const { data } = await api.put(
        `/api/tasks/${task._id}`,
        {
          column: newCol,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((t) => (t._id === data._id ? data : t))
      );

      setErrMsg("");
    } catch (err) {
      console.error("Error moving task:", err.response?.data || err);
      setErrMsg(err.response?.data?.message || "Failed to move task.");
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setErrMsg("");
    } catch (err) {
      console.error("Error deleting task:", err.response?.data || err);
      setErrMsg(err.response?.data?.message || "Failed to delete task.");
    }
  };

  return (
    <div className="mt-8">
      {errMsg ? (
        <div className="mb-3 text-sm text-red-600">
          {errMsg}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`rounded-xl shadow-sm p-4 border transition-colors ${darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
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
              values={tasks.filter((t) => t.column === col.key)}
              onReorder={() => { }}
              className="space-y-3"
            >
              {tasks
                .filter((t) => t.column === col.key)
                .map((task) => (
                  <Reorder.Item
                    key={task._id}
                    value={task}
                    className={`p-3 rounded-lg shadow-sm cursor-grab ${col.color
                      } ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                    whileDrag={{
                      scale: 1.05,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>{task.title}</span>

                      <div className="flex space-x-1">
                        {columns
                          .filter((c) => c.key !== col.key)
                          .map((c) => (
                            <button
                              key={c.key}
                              type="button"
                              onClick={() => moveTask(task, c.key)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${darkMode
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                }`}
                            >
                              {c.label}
                            </button>
                          ))}

                        <button
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
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
                  placeholder={
                    errors[col.key] ? errors[col.key] : "Enter task"
                  }
                  value={taskInputs[col.key].title}
                  onChange={(e) =>
                    setTaskInputs((prev) => ({
                      ...prev,
                      [col.key]: {
                        ...prev[col.key],
                        title: e.target.value,
                      },
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTask(col.key);
                    }
                  }}
                  className={`flex-1 p-2 rounded border transition-colors ${errors[col.key]
                      ? "border-red-500 placeholder-red-500 focus:ring-red-500"
                      : darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                />

                <button
                  type="button"
                  onClick={() => addTask(col.key)}
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-2 flex items-center justify-center w-full py-1 text-sm text-blue-600 border border-blue-200 dark:border-blue-700 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-gray-700"
                onClick={() =>
                  setTaskInputs((prev) => ({
                    ...prev,
                    [col.key]: {
                      ...prev[col.key],
                      show: true,
                    },
                  }))
                }
              >
                <Plus size={16} className="mr-1" />
                Add Task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTaskBoard;