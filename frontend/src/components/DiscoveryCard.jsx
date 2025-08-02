import {
  HiOutlineHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineShare,
  HiOutlineBookmark,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext'; // adjust path as needed

const NeoCard = ({ item }) => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`rounded-2xl shadow-sm overflow-hidden border w-full transition-colors duration-300
      ${darkMode
        ? 'bg-gray-800 border-gray-700 text-gray-100'
        : 'bg-white border-gray-100 text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
              darkMode ? 'border-indigo-700' : 'border-indigo-100'
            }`}
          >
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm">
            <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium leading-tight`}>
              {item.user.name}
            </h4>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
              {item.user.handle}
            </p>
          </div>
        </div>
        <button
          className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className={`${darkMode ? 'text-gray-100' : 'text-gray-800'} px-4 pb-3 text-sm sm:text-base`}>
        <p className="mb-3">{item.content.text}</p>

        {item.type === 'moment' && (
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl overflow-hidden aspect-square`}>
            <img
              src={item.content.media}
              alt="Content media"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {item.type === 'question' && (
          <div className="space-y-2 mt-2">
            {item.content.options.map((option, i) => (
              <button
                key={i}
                className={`w-full text-left px-4 py-2 rounded-lg border hover:bg-indigo-50 transition
                  ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-indigo-600 text-indigo-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-indigo-50 text-indigo-700'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-1 rounded
              ${
                darkMode
                  ? 'bg-indigo-800 text-indigo-200'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div
        className={`px-4 py-3 border-t flex justify-between items-center text-sm transition-colors duration-300
          ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-500'}`}
      >
        <button className="flex items-center gap-1 hover:text-pink-500 transition">
          <HiOutlineHeart className="text-lg sm:text-xl" />
          <span>{item.stats.reactions}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-indigo-500 transition">
          <HiOutlineChatBubbleOvalLeft className="text-lg sm:text-xl" />
          <span>{item.stats.comments}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-green-500 transition">
          <HiOutlineShare className="text-lg sm:text-xl" />
          <span>{item.stats.shares}</span>
        </button>
        <button className="hover:text-yellow-500 transition">
          <HiOutlineBookmark className="text-lg sm:text-xl" />
        </button>
      </div>
    </div>
  );
};

export default NeoCard;
