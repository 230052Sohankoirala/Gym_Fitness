import { useState } from 'react';
import { useTheme } from '../context/ThemeContext'; // Adjust path as needed

const Sidebar = () => {
  const { darkMode } = useTheme();

  const [accounts, setAccounts] = useState([
    { id: 1, username: 'travel_lover', followers: '142K', isFollowing: false },
    { id: 2, username: 'foodie_adventures', followers: '89K', isFollowing: true },
    { id: 3, username: 'tech_enthusiast', followers: '256K', isFollowing: false },
  ]);

  const toggleFollow = (id) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, isFollowing: !acc.isFollowing } : acc
      )
    );
  };

  return (
    <div
      className={`hidden lg:block w-80 fixed right-0 top-0 h-screen overflow-y-auto p-6 border-l shadow-sm transition-colors duration-300
        ${darkMode
          ? 'bg-gray-900 border-gray-700 text-gray-300'
          : 'bg-white border-gray-200 text-gray-800'
        }`}
    >
      {/* User Profile */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Profile"
            className={`w-12 h-12 rounded-full border-2 ${darkMode ? 'border-blue-600' : 'border-blue-400'
              } transition-colors duration-300`}
          />
          <div>
            <p className="font-semibold">{`your_username`}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your Name
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Accounts */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Suggested for you
          </h3>
          <button className="text-xs font-medium text-blue-500 hover:underline">
            See all
          </button>
        </div>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={`https://randomuser.me/api/portraits/${account.id % 2 === 0 ? 'women' : 'men'
                    }/${account.id}.jpg`}
                  alt={account.username}
                  className="w-9 h-9 rounded-full"
                />
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    {account.username}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {account.followers} followers
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(account.id)}
                className={`px-3 py-1 text-xs rounded-full font-semibold border transition-colors duration-300 ${account.isFollowing
                    ? darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                    : darkMode
                      ? 'bg-blue-700 text-blue-300 border-blue-600 hover:bg-blue-600'
                      : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                  }`}
              >
                {account.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <div
          className={`flex flex-wrap gap-3 text-xs mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
        >
          <a href="#" className="hover:underline">
            About
          </a>
          <a href="#" className="hover:underline">
            Help
          </a>
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            Terms
          </a>
          <a href="#" className="hover:underline">
            Cookies
          </a>
          <a href="#" className="hover:underline">
            Ads
          </a>
        </div>
        <p
          className={`text-xs transition-colors duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
        >
          © {new Date().getFullYear()} Zuno
        </p>
      </div>

    </div>
  );
};

export default Sidebar;
