// src/components/trainerComponents/TrainerTaskBoard.jsx

import React, { useState, useEffect } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

/* ================== API Base URL ================== */
const API_BASE_URL =
     import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

/* ================== Axios instance ================== */
const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("trainerToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/* ================== Kanban Columns ================== */
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

const TrainerTaskBoard = () => {
    const { darkMode } = useTheme();

    const [tasks, setTasks] = useState([]);
    const [errors, setErrors] = useState({});
    const [errMsg, setErrMsg] = useState("");

    const [taskInputs, setTaskInputs] = useState({
        todo: {
            show: false,
            title: "",
        },
    });

    /* ---------------- Fetch tasks ---------------- */
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("trainerToken");

                if (!token) {
                    setErrMsg("No token found. Please sign in again as a trainer.");
                    return;
                }

                const { data } = await api.get("/api/trainers/tasks");

                setTasks(Array.isArray(data) ? data : []);
                setErrMsg("");
            } catch (err) {
                console.error(
                    "Error fetching trainer tasks:",
                    err.response?.status,
                    err.response?.data || err.message
                );

                setErrMsg(
                    err.response?.data?.message || "Failed to load tasks"
                );
            }
        };

        fetchTasks();
    }, []);

    /* ---------------- Add task ---------------- */
    const addTask = async () => {
        const title = taskInputs.todo.title.trim();

        if (!title) {
            setErrors({
                todo: "Task title is required",
            });
            return;
        }

        try {
            const { data } = await api.post("/api/trainers/tasks", {
                title,
                column: "todo",
            });

            setTasks((prev) => [...prev, data]);

            setTaskInputs({
                todo: {
                    show: false,
                    title: "",
                },
            });

            setErrors({});
            setErrMsg("");
        } catch (err) {
            console.error(
                "Error adding trainer task:",
                err.response?.status,
                err.response?.data || err.message
            );

            setErrMsg(
                err.response?.data?.message || "Failed to add task"
            );
        }
    };

    /* ---------------- Move task ---------------- */
    const moveTask = async (task, newCol) => {
        try {
            const { data } = await api.put(`/api/trainers/tasks/${task._id}`, {
                column: newCol,
            });

            setTasks((prev) =>
                prev.map((t) => (t._id === data._id ? data : t))
            );

            setErrMsg("");
        } catch (err) {
            console.error(
                "Error moving trainer task:",
                err.response?.status,
                err.response?.data || err.message
            );

            setErrMsg(
                err.response?.data?.message || "Failed to move task"
            );
        }
    };

    /* ---------------- Delete task ---------------- */
    const deleteTask = async (taskId) => {
        try {
            await api.delete(`/api/trainers/tasks/${taskId}`);

            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            setErrMsg("");
        } catch (err) {
            console.error(
                "Error deleting trainer task:",
                err.response?.status,
                err.response?.data || err.message
            );

            setErrMsg(
                err.response?.data?.message || "Failed to delete task"
            );
        }
    };

    return (
        <div className="mt-12">
            {errMsg ? (
                <div className="mb-3 text-sm text-red-600">
                    {errMsg}
                </div>
            ) : null}

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.map((col) => (
                    <div
                        key={col.key}
                        className={`w-full rounded-xl shadow-sm p-4 border transition-colors duration-200 ${darkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                    >
                        <h3
                            className={`font-bold mb-4 text-base md:text-lg ${darkMode ? "text-gray-200" : "text-gray-800"
                                }`}
                        >
                            {col.label}
                        </h3>

                        <Reorder.Group
                            axis="y"
                            values={tasks.filter((t) => t.column === col.key)}
                            onReorder={() => { }}
                            className="space-y-4"
                        >
                            <AnimatePresence>
                                {tasks
                                    .filter((t) => t.column === col.key)
                                    .map((task) => (
                                        <Reorder.Item
                                            key={task._id}
                                            value={task}
                                            layout
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.9,
                                                transition: {
                                                    duration: 0.2,
                                                },
                                            }}
                                            className={`p-3 rounded-lg shadow-sm cursor-grab transition-colors duration-200 ${col.color
                                                } ${darkMode
                                                    ? "text-gray-200"
                                                    : "text-gray-800"
                                                }`}
                                            whileDrag={{
                                                scale: 1.05,
                                            }}
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                <span className="text-sm md:text-base">
                                                    {task.title}
                                                </span>

                                                <div className="flex flex-wrap gap-1">
                                                    {columns
                                                        .filter(
                                                            (c) =>
                                                                c.key !== col.key
                                                        )
                                                        .map((c) => (
                                                            <button
                                                                key={c.key}
                                                                type="button"
                                                                onClick={() =>
                                                                    moveTask(
                                                                        task,
                                                                        c.key
                                                                    )
                                                                }
                                                                className={`text-xs px-2 py-1 rounded ${darkMode
                                                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                                                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                                                    }`}
                                                            >
                                                                {c.label}
                                                            </button>
                                                        ))}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteTask(task._id)
                                                        }
                                                        className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                            </AnimatePresence>
                        </Reorder.Group>

                        {col.key === "todo" && (
                            <>
                                {taskInputs.todo.show ? (
                                    <div className="mt-2 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            placeholder={
                                                errors.todo || "Enter task"
                                            }
                                            value={taskInputs.todo.title}
                                            onChange={(e) =>
                                                setTaskInputs({
                                                    todo: {
                                                        ...taskInputs.todo,
                                                        title: e.target.value,
                                                    },
                                                })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    addTask();
                                                }
                                            }}
                                            className={`p-2 rounded border text-sm md:text-base ${errors.todo
                                                    ? "border-red-500 placeholder-red-500"
                                                    : darkMode
                                                        ? "bg-gray-700 border-gray-600 text-gray-200"
                                                        : "bg-white border-gray-300 text-gray-800"
                                                }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={addTask}
                                            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm md:text-base"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="mt-2 flex items-center justify-center w-full py-1 text-sm md:text-base text-blue-600 border border-blue-200 dark:border-blue-700 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-gray-700"
                                        onClick={() =>
                                            setTaskInputs({
                                                todo: {
                                                    ...taskInputs.todo,
                                                    show: true,
                                                },
                                            })
                                        }
                                    >
                                        <Plus size={16} className="mr-1" />
                                        Add Task
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainerTaskBoard;