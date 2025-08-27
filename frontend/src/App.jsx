// App.jsx
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import UserLogin from "./auth/userAuth/userLogin";
import Home from "./pages/User/userHomePage";
import Workout from "./pages/User/userWorkout";
import Nutrients from "./pages/User/userNutrients";
import Progress from "./pages/User/userProgress";
import WorkoutDetail from "./pages/User/userWorkoutDetail";
import Navbar from "./components/userComponents/Navbar";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import UserRegister from "./auth/userAuth/userRegister";
const Layout = ({ children }) => {
  const location = useLocation();
  const { darkMode } = useTheme();

  // Pages where we don't want to show Navbar
  const noNavbarRoutes = ["/", "/login", "/register"];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div
      className={`min-h-screen  text-gray-900 dark:text-gray-100 transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
    >
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "pt-16" : ""}>{children}</div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/home" element={<Home />} />
            <Route path="/workouts" element={<Workout />} />
            <Route path="/nutrition" element={<Nutrients />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
