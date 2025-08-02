import { useState } from 'react';
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineSearch,
} from 'react-icons/hi';
import { RiCompassDiscoverLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // 💡

const AppNav = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // 💡

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t transition-colors duration-300
      ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center py-2 sm:py-3">
          {[
            { tab: 'home', icon: <HiOutlineHome /> },
            { tab: 'Search', icon: <HiOutlineSearch /> },
            { tab: 'discover', icon: <RiCompassDiscoverLine /> },
            { tab: 'profile', icon: <HiOutlineUser /> },
          ].map(({ tab, icon }) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex flex-col items-center flex-1 ${
                activeTab === tab ? 'text-indigo-600' : (darkMode ? 'text-gray-400' : 'text-gray-500')
              }`}
            >
              <div className="text-xl sm:text-2xl">{icon}</div>
              <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 capitalize">{tab}</span>
            </button>
          ))}

          <button
            className="flex items-center justify-center p-3 sm:p-4 -mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-md hover:scale-110 transition-transform"
            onClick={() => handleTabChange('create')}
          >
            <HiOutlinePlusCircle className="text-2xl sm:text-3xl" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
