import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // check saved preference or system preference
        if (localStorage.getItem("theme")) {
            return localStorage.getItem("theme") === "dark";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    const toggleTheme = () => {
        setDarkMode((prev) => {
            const newMode = !prev;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            return newMode;
        });
    };

    // Add/remove `dark` class on <html>
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);//

export default ThemeProvider;