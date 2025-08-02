import AppNav from '../components/AppNav';
import ContentStream from '../components/ContentStream';
import Sidebar from '../components/Sidebar';

import { HiOutlineChat, HiOutlineBell } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // <-- add this line
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const HomePage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme(); // <-- get dark mode & toggle

  const handleTabChange = (tab) => navigate(`/${tab}`);

  return (
    <div className={`min-h-screen flex justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-8xl flex">
        {/* Main Feed */}
        <div className="flex-5/6 max-w-xl w-full mx-auto">
          {/* Floating Header */}
          <header className={`sticky top-0 z-20 backdrop-blur-sm border-b p-4 ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="p-2 rounded-lg">
                <h1 className={`text-2xl font-bold font-[Raleway] ${darkMode ? 'text-white' : 'text-black'}`}>Zuno</h1>
              </div>

              {/* Icons & Theme Toggle */}
              <div className="flex items-center gap-4">
                {/* Toggle */}
                <button
                  onClick={toggleTheme}
                  className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-colors"
                >
                  {darkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
                </button>

                <button
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 transition relative"
                  onClick={() => handleTabChange('chat')}
                >
                  <HiOutlineChat className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                <button
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 transition relative"
                  onClick={() => handleTabChange('notifications')}
                >
                  <HiOutlineBell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    5
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Feed */}
          <main className="px-4">
            <ContentStream />
          </main>

          {/* Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30">
            <AppNav />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;
