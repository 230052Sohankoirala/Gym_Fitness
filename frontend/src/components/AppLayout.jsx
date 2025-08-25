import React from "react";
import ThemeToggle from "./ThemeToggle";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
