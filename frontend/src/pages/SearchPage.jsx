import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineArrowLeft, HiOutlineUser } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const allUsers = [
    { id: 1, username: 'alex_chen', name: 'Alex Chen', isFollowing: false, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, username: 'maria_g', name: 'Maria Garcia', isFollowing: true, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, username: 'jamie_w', name: 'Jamie Wilson', isFollowing: false, avatar: 'https://randomuser.me/api/portraits/women/68.jpg' }
  ];

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]);

  const toggleFollow = (id) => {
    setSearchResults(prev =>
      prev.map(user =>
        user.id === id ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
  };

  return (
    <div className={`min-h-screen flex justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className={`sticky top-0 z-10 p-4 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className={`mr-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <HiOutlineArrowLeft className="text-xl" />
            </button>

            <form className="flex-1">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-4 pb-24">
          <h2 className="font-bold mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : 'Suggested'}
          </h2>

          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => navigate(`/${user.username}`)}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full mr-3 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                        <HiOutlineUser className="text-gray-500 dark:text-gray-300 text-xl" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(user.id);
                    }}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition-colors
                      ${user.isFollowing
                        ? darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HiOutlineSearch className="mx-auto text-4xl mb-3 text-gray-400 dark:text-gray-500" />
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No results found for "{searchQuery}"</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try searching for something else</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
