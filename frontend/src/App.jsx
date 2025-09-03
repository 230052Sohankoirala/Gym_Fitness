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
import UserGoal from "./pages/User/InfoUser/UserGoal";
import UserInfo from "./pages/User/InfoUser/UserInfo";
import RecentActivity from "./pages/User/RecentActivity";
import UserMeals from "./pages/User/UserMeals";
import UserClasses from "./pages/User/UserClasses";
import ProfilePage from "./pages/User/userProfile/ProfilePage";
import MessagePortal from "./components/userComponents/MessagePortal";
import WorkoutVideo from "./pages/User/userProfile/WorkoutVideo";
import HelpCenter from "./pages/User/userProfile/HelpCenter";
import UserPlanCard from "./pages/User/UserPlanCard";

// Trainer
import TrainerLogin from "./auth/TrainerAuth/trainerLogin";
import TrainerHome from "./pages/Trainer/TrainerHome";
// NOTE: ensure this import path is correct in your repo structure
import TrainerNavbar from "./components/trainerComponents/TrainerNavbar";
import TrainerClient from "./pages/Trainer/TrainerClient";
import TrainerSessions from "./pages/Trainer/TrainerSessions";

// Admin

const Layout = ({ children }) => {
  const location = useLocation();
  const { darkMode } = useTheme();

  const path = location.pathname;

  const isTrainerRoute = path.startsWith("/trainer");

  const isTrainerLogin = path === "/trainerLogin";


  // User pages where Navbar should be hidden
  const noUserNavbarRoutes = [
    "/", "/login", "/register", "/userGoal", "/userInfo",
    "/recentActivity", "/help"
  ];

  const hideUserNavbar =
    noUserNavbarRoutes.includes(path) ||
    path.startsWith("/chat/") ||
    path.startsWith("/workout/") ||
    isTrainerRoute;

  // Decide which top navbar to show
  let TopNav = null;
  if (isTrainerRoute && !isTrainerLogin) {
    TopNav = <TrainerNavbar />;
  
  } else if (!hideUserNavbar) {
    TopNav = <Navbar />;
  }

  return (
    <div
      className={`min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {TopNav}
      <div className={!hideUserNavbar && !isTrainerRoute  ? "pt-1" : ""}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public / Auth */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />

            {/* User Info */}
            <Route path="/userInfo" element={<UserInfo />} />
            <Route path="/userGoal" element={<UserGoal />} />

            {/* User Dashboard */}
            <Route path="/recentActivity" element={<RecentActivity />} />
            <Route path="/workoutPlan/:category" element={<UserPlanCard />} />

            {/* User Navbar routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/workouts" element={<Workout />} />
            <Route path="/nutrition" element={<Nutrients />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/userMeals" element={<UserMeals />} />
            <Route path="/userClasses" element={<UserClasses />} />

            {/* User Profile */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/workoutsVideo" element={<WorkoutVideo />} />
            <Route path="/workoutsVideo/:slug" element={<WorkoutVideo />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* Messages */}
            <Route path="/chat/:trainerName" element={<MessagePortal />} />

            {/* Trainer */}
            <Route path="/trainerLogin" element={<TrainerLogin />} />
            <Route path="/trainerHome" element={<TrainerHome />} />
            <Route path="/trainer/clients" element={<TrainerClient />} />
            <Route path="/trainer/sessions" element={<TrainerSessions />} />

       
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
