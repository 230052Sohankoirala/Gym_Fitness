import { useState } from 'react';
import {
  HiOutlineSearch,
  HiOutlineDotsHorizontal,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineHeart,
  HiHeart,
  HiOutlineArrowLeft
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      user: 'Alex Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'liked your post',
      time: '2 hours ago',
      read: false,
      liked: false
    },
    {
      id: 2,
      type: 'comment',
      user: 'Maria Garcia',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'commented: "Great photo!"',
      time: '5 hours ago',
      read: true,
      liked: false
    },
    {
      id: 3,
      type: 'follow',
      user: 'Jamie Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      text: 'started following you',
      time: '1 day ago',
      read: true,
      liked: false
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleLike = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, liked: !n.liked } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'likes') return n.liked;
    return true;
  });

  return (
    <div className={`min-h-screen flex justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="w-full max-w-xl pb-16">
        {/* Header */}
        <div className={`sticky top-0 z-10 p-4 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/home')}
                className="mr-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                <HiOutlineArrowLeft className="text-xl" />
              </button>
              <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={markAllAsRead}
                className="text-blue-500 text-sm font-medium"
              >
                Mark all as read
              </button>
              <button className="text-gray-500 dark:text-gray-400">
                <HiOutlineDotsHorizontal className="text-xl" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-3 mt-3 overflow-x-auto scrollbar-hide">
            {['all', 'unread', 'likes'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none text-sm text-black dark:text-white"
            />
          </div>
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 flex items-start transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-gray-800' : ''
                }`}
              >
                <img
                  src={notification.avatar}
                  alt={notification.user}
                  className="w-12 h-12 rounded-full mr-3 flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{notification.user}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{notification.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notification.time}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-2 text-lg">
                    <button
                      onClick={() => toggleLike(notification.id)}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition"
                    >
                      {notification.liked ? <HiHeart className="text-red-500" /> : <HiOutlineHeart />}
                    </button>

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition"
                      >
                        <HiOutlineCheck />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No notifications found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
