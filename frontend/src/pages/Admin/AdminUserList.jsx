import React, { useState } from "react";
import { Trash2, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * AdminUserList Component
 * Displays a dummy list of users with remove functionality.
 * Dark/Light mode matches AdminHomepage.
 */
const AdminUserList = () => {
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const [users, setUsers] = useState([
        { id: 1, name: "Adarsh Sapkota", email: "adarsh@example.com" },
        { id: 2, name: "Suvam Parajuli", email: "suvam@example.com" },
        { id: 3, name: "Shrabhya Paudel", email: "shrabhya@example.com" },
        { id: 4, name: "Sohan Koirala", email: "sohan@example.com" },
    ]);

    const handleRemove = (id) => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
    };

    return (
        <div
            className={`min-h-screen p-6 transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                }`}
        >
            <h1 className="text-2xl font-bold mb-6">Admin – User List</h1>

            <div
                className={`shadow-md rounded-lg divide-y transition-colors duration-200 ${darkMode
                        ? "bg-gray-800 divide-gray-700"
                        : "bg-white divide-gray-200"
                    }`}
            >
                {users.length > 0 ? (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center justify-between p-4 transition-colors duration-200 ${darkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <User className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm opacity-75">{user.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRemove(user.id)}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                            >
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center opacity-75">No users found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminUserList;
