// MessagePortal.jsx
import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from 'framer-motion';// eslint-disable-line no-unused-vars
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Paperclip, File, Send, Phone, VideoIcon, MoreVertical } from 'lucide-react';

const MessagePortal = () => {
  const { trainerId } = useParams();
  const location = useLocation();
  const trainer = location.state?.trainer;
  const { darkMode } = useTheme();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (trainerId && location.state?.messages) {
      setMessages(location.state.messages);
    } else {
      setMessages([]);
    }
  }, [trainerId, location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (message) => {
    switch (message.type) {
      case 'image':
        return (
          <img
            src={`https://picsum.photos/seed/${message.content}/300/200`}
            alt={message.content}
            className="w-full h-auto rounded-lg"
          />
        );
      case 'file':
        return (
          <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <File size={20} className="text-blue-500 mr-2" />
            <span className="truncate">{message.content}</span>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };


  if (!trainer) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Trainer Not Found</h2>
          <Link to="/userClasses" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Back to Trainers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-3 sm:p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center">
          <Link to="/userClasses" className="mr-3">
            <ArrowLeft size={20} />
          </Link>
          <img src={trainer.img} alt={trainer.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="ml-2 sm:ml-3">
            <h3 className="font-semibold text-sm sm:text-base truncate">{trainer.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{trainer.speciality}</p>
          </div>
        </div>
        <div className="flex space-x-2 sm:space-x-3">
          <Phone size={20} />
          <VideoIcon size={20} />
          <MoreVertical size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col">
        <div className="flex-1 flex flex-col space-y-2 max-w-full mx-auto w-full sm:max-w-3xl">
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-start mb-2 w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {/* Left avatar for trainer */}
              {message.sender !== 'user' && (
                <img
                  src={`https://i.pravatar.cc/40?u=${message.id}`}
                  alt="Trainer"
                  className="w-8 h-8 rounded-full object-cover mr-2 sm:mr-3"
                />
              )}

              {/* Chat bubble */}
              <div
                className={`p-2 sm:p-3 rounded-lg max-w-[75%] sm:max-w-md break-words ${message.sender === 'user'
                    ? darkMode
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border'
                  }`}
              >
                {renderMessageContent(message)}
                <p className="text-[10px] sm:text-xs mt-1 text-gray-400 text-right">
                  {message.timestamp}
                </p>
              </div>

              {/* Right avatar for user */}
              {message.sender === 'user' && (
                <img
                  src={`https://i.pravatar.cc/40?u=user-${message.id}`}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover ml-2 sm:ml-3"
                />
              )}
            </motion.div>


          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className={`p-2 sm:p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center space-x-2 w-full">
          <button onClick={() => fileInputRef.current.click()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Paperclip size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" />
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={`flex-1 resize-none rounded-full py-2 px-2 text-start ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'} outline-none max-h-25 w-full`}
          />
          <button onClick={handleSendMessage} disabled={!inputMessage.trim()} className={`p-2 rounded-full ${inputMessage.trim() ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-200'}`}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePortal;
