import { useState, useEffect } from 'react';
import {
  HiOutlineSearch,
  HiOutlineDotsHorizontal,
  HiOutlineArrowLeft,
  HiOutlineChat,
  HiOutlinePhone,
  HiOutlineVideoCamera
} from 'react-icons/hi';
import { IoMdSend } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // Assuming you want to support dark mode

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Added theme context
  const [clickCount, setClickCount] = useState(0);

  const handleBackClick = () => {
    if (clickCount === 0) {
      setClickCount(1);
      setActiveChat(null); // First click: just close chat
      // Reset counter after 1 second
      setTimeout(() => setClickCount(0), 1000);
    } else {
      // Second click within time window: go home
      navigate('/home');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const conversations = [
    {
      id: 1,
      name: 'Alex Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMsg: 'See you tomorrow!',
      time: '2h ago',
      unread: 3,
      online: true
    },
    {
      id: 2,
      name: 'Tech Group',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastMsg: 'Maria: Check this new framework',
      time: '5h ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Jamie Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      lastMsg: 'Thanks for the feedback',
      time: '1d ago',
      unread: 0,
      online: true
    }
  ];

  const messages = [
    { id: 1, text: 'Hey there!', sent: false, time: '10:30 AM' },
    { id: 2, text: 'How are you doing?', sent: false, time: '10:31 AM' },
    { id: 3, text: "I'm good, thanks! How about you?", sent: true, time: '10:33 AM' },
    { id: 4, text: 'Working on that project we discussed', sent: false, time: '10:35 AM' },
    { id: 5, text: 'Awesome! Need any help?', sent: true, time: '10:36 AM' }
  ];

  return (
    <div className={`flex h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Chat List - Always visible on desktop, conditionally on mobile */}
      <div className={`${!isMobile || !activeChat ? 'flex' : 'hidden'} flex-col w-full md:w-96 border-r transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`p-4 border-b transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBackClick}
              className={`flex items-center transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
            >
              <HiOutlineArrowLeft className="text-xl mr-2" />
              <h1 className="text-xl font-bold">Chats</h1>
            </button>
          </div>
          <div className="relative">
            <HiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search messages"
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500' : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-500'}`}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 border-b cursor-pointer transition-colors duration-300 hover:bg-gray-100 ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100'} ${
                activeChat === chat.id ? (darkMode ? 'bg-blue-900' : 'bg-blue-50') : ''
              }`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="relative mr-3">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{chat.name}</h3>
                  <span className={`text-xs transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.time}</span>
                </div>
                <p className={`text-sm truncate transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area - Hidden on mobile when no chat selected */}
      {activeChat && (
        <div className="flex flex-col flex-1 transition-colors duration-300">
          {/* Chat Header with back button on mobile */}
          <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setActiveChat(null)}
                  className={`mr-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  <HiOutlineArrowLeft className="text-xl" />
                </button>
              )}
              <img
                src={conversations.find((c) => c.id === activeChat)?.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h2 className={`font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {conversations.find((c) => c.id === activeChat)?.name}
                </h2>
                <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {conversations.find((c) => c.id === activeChat)?.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-500 transition-colors duration-300">
              <button
                className={`hover:text-blue-500 transition-colors duration-300 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}
                aria-label="Start phone call"
              >
                <HiOutlinePhone className="text-xl" />
              </button>
              <button
                className={`hover:text-blue-500 transition-colors duration-300 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}
                aria-label="Start video call"
              >
                <HiOutlineVideoCamera className="text-xl" />
              </button>
              <button
                className={`hover:text-gray-700 transition-colors duration-300 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="More options"
              >
                <HiOutlineDotsHorizontal className="text-xl" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                      msg.sent ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700 text-white border border-gray-600' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sent ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 text-white border border-gray-600 placeholder-gray-400' : 'bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500'
                }`}
              />
              <button className="ml-3 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                <IoMdSend className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Only shown on desktop when no chat selected */}
      {!activeChat && !isMobile && (
        <div className={`hidden md:flex flex-col items-center justify-center flex-1 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          <div className="text-center p-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 dark:bg-gray-700">
              <HiOutlineChat className="text-3xl" />
            </div>
            <h2 className="text-xl font-medium mb-2">Select a chat</h2>
            <p>Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
