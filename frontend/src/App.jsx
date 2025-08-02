import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from "./auth/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterPage from './auth/RegisterPage';
import ChatPage from './pages/ChatPAge';
import NotificationPage from './pages/NotificationPage';
import SearchPage from './pages/SearchPage';
import CreatePage from './pages/CreatePage';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationPage />} />
         <Route path="/chat" element={<ChatPage />} />
             <Route path="/search" element={<SearchPage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                 <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </Router>
  );
}

export default App;