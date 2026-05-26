// App.jsx
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Outlet,
} from "react-router-dom";
import WelcomePage from "./pages/WelcomePage/WelcomePage";

import UserLogin from "./auth/userAuth/userLogin";
import Home from "./pages/User/userHomePage";
import Workout from "./pages/User/userWorkout";
import Nutrients from "./pages/User/userNutrients";
import BeATrainerPage from "./pages/User/userProfile/BeATrainerPage";
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
import VerifyEmail from "./auth/userAuth/VerifyEmail";

// Trainer
import TrainerLogin from "./auth/TrainerAuth/trainerLogin";
import TrainerHome from "./pages/Trainer/TrainerHome";
import TrainerNavbar from "./components/trainerComponents/TrainerNavbar";
import TrainerClient from "./pages/Trainer/TrainerClient";
import TrainerSessions from "./pages/Trainer/TrainerSessions";
import TrainerSettings from "./pages/Trainer/TrainerSettings";
import TrainerAnalytics from "./pages/Trainer/TrainerAnalytics";
// ⭐ New (make sure these files exist)
import TrainerNotification from "./pages/Trainer/TrainerNotification";
import TrainerMessages from "./pages/Trainer/TrainerMessages";

// Admin
import AdminLogin from "./auth/AdminAuth/AdminLogin";
import AdminNavbar from "./components/AdminComponents/AdminNavbar";
import AdminHomepage from "./pages/Admin/AdminHomepage";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminTrainerList from "./pages/Admin/AdminTrainerList";
import AdminSessions from "./pages/Admin/AdminSessions";
import AdminUserList from "./pages/Admin/AdminUserList";
import AdminPayments from "./pages/Admin/AdminPayments";
// ⭐ New (make sure these files exist)


// Shared
import EditProfile from "./pages/User/userProfile/EditProfile";
import UserNotifications from "./pages/User/userProfile/Notification";
import TrainerAdminMessages from "./pages/Trainer/TrainerAdminMessages";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./fallback/NotFound";

// Auth Context
import { AuthProvider } from "./context/AuthContext";
import PrivacyPolicy from "./pages/WelcomePage/PrivacyPolicy";
import Terms from "./pages/WelcomePage/Terms";
import Contact from "./pages/WelcomePage/Contact";
import AdminNotificationsPage from "./pages/Admin/AdminNotificationsPage";
import PaymentSuccess from "./pages/User/PaymentSuccess";
import AdminReports from "./pages/Admin/AdminReports";
import AdminMessages from "./pages/Admin/AdminMessages";
import AdminFeedback from "./pages/Admin/AdminFeedback";
import TrainerStripeConnect from "./pages/Trainer/TrainerStripeConnect";
import TrainerStripeReturn from "./pages/Trainer/TrainerStripeReturn";
import TrainerStripeRefresh from "./pages/Trainer/TrainerStripeRefresh";
import TrainerApplicationsPage from "./pages/Admin/TrainerApplicationsPage";
import ForgotPassword from "./auth/userAuth/ForgotPassword";
import WorkoutPlanPage from "./pages/User/WorkoutPlanPage";


/* ---------------- Layout Wrapper ---------------- */
const Layout = () => {
  const location = useLocation();
  const { darkMode } = useTheme();

  const path = location.pathname;

  const isTrainerRoute = path.startsWith("/trainer");
  const isAdminRoute = path.startsWith("/admin");
  const isTrainerLogin = path === "/trainerLogin";
  const isAdminLogin = path === "/adminLogin";

  const noUserNavbarRoutes = [
    "/",
    "/be-a-trainer",
    "/memberLogin",
    "/register",
    "/usergoal",
    "/userInfo",
    "/recentActivity",
    "/help",
    "/verify-email",
    "/privacy",
    "/terms",
    "/contacts",
    "/forgot-password",
  ];

  const hideUserNavbar =
    noUserNavbarRoutes.includes(path) ||
    path.startsWith("/chat/") ||
    path.startsWith("/workout/") ||
    isTrainerRoute ||
    isAdminRoute;

  let TopNav = null;
  if (isTrainerRoute && !isTrainerLogin) {
    TopNav = <TrainerNavbar />;
  } else if (isAdminRoute && !isAdminLogin) {
    TopNav = <AdminNavbar />;
  } else if (!hideUserNavbar) {
    TopNav = <Navbar />;
  }

  return (
    <div
      className={`min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
    >
      {TopNav}
      <div
        className={
          !hideUserNavbar && !isTrainerRoute && !isAdminRoute ? "pt-1" : ""
        }
      >
        <Outlet />
      </div>
    </div>
  );
};

/* ---------------- App ---------------- */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Wrap all “normal” pages with Layout (handles navbars) */}
            <Route element={<Layout />}>
              {/* Public / Auth */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/memberLogin" element={<UserLogin />} />
              <Route path="/register" element={<UserRegister />} />
              <Route path="/trainerLogin" element={<TrainerLogin />} />
              <Route path="/adminLogin" element={<AdminLogin />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contacts" element={<Contact />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />


              {/* User Protected */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute role="member">
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workouts"
                element={
                  <ProtectedRoute role="member">
                    <Workout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nutrition"
                element={
                  <ProtectedRoute role="member">
                    <Nutrients />
                  </ProtectedRoute>
                }
              />
              <Route path="/workout-plan" 
              element={
                <ProtectedRoute role="member">
                <WorkoutPlanPage />
                </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute role="member">
                    <Progress />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout/:id"
                element={
                  <ProtectedRoute role="member">
                    <WorkoutDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userMeals"
                element={
                  <ProtectedRoute role="member">
                    <UserMeals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userClasses"
                element={
                  <ProtectedRoute role="member">
                    <UserClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute role="member">
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workoutsVideo"
                element={
                  <ProtectedRoute role="member">
                    <WorkoutVideo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workoutsVideo/:slug"
                element={
                  <ProtectedRoute role="member">
                    <WorkoutVideo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editProfile"
                element={
                  <ProtectedRoute role="member">
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute role="member">
                    <UserNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:trainerId"
                element={
                  <ProtectedRoute role="member">
                    <MessagePortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userInfo"
                element={
                  <ProtectedRoute role="member">
                    <UserInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recentActivity"
                element={
                  <ProtectedRoute role="member">
                    <RecentActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userGoal"
                element={
                  <ProtectedRoute role="member">
                    <UserGoal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute role="member">
                    <HelpCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workoutPlan/:category"
                element={
                  <ProtectedRoute role="member">
                    <UserPlanCard />
                  </ProtectedRoute>
                }
              />

          <Route path="/be-a-trainer" element={<BeATrainerPage />} />

              {/* Trainer Protected */}
              <Route
                path="/trainerHome"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/clients"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerClient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/sessions"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerSessions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/settings"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/stripe/return"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerStripeReturn />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/stripe/refresh"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerStripeRefresh />
                  </ProtectedRoute>
                }
              />




              <Route path="/trainer/admin-messages" element={
                <ProtectedRoute role="trainer">
                  <TrainerAdminMessages />
                </ProtectedRoute>
              } />


              <Route
                path="/trainer/analytics"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/notifications"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerNotification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/messages"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trainer/stripe/connect"
                element={
                  <ProtectedRoute role="trainer">
                    <TrainerStripeConnect />
                  </ProtectedRoute>
                }
              />
              {/* Admin Protected */}
              <Route
                path="/adminHome"
                element={
                  <ProtectedRoute role="admin">
                    <AdminHomepage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute role="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/trainers"
                element={
                  <ProtectedRoute role="admin">
                    <AdminTrainerList />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/sessions"
                element={
                  <ProtectedRoute role="admin">
                    <AdminSessions />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/trainer-applications" element={
                <ProtectedRoute role="admin">
                  <TrainerApplicationsPage />
                </ProtectedRoute>

              } />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <AdminUserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute role="admin">
                    <AdminMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages/:chatId"
                element={
                  <ProtectedRoute role="admin">
                    <AdminMessages />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute role="admin">
                    <AdminReports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/feedback"
                element={
                  <ProtectedRoute role="admin">
                    <AdminFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute role="admin">
                    <AdminNotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute role="admin">
                    <AdminPayments />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
