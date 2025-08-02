import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext'; // adjust path as needed

const Stories = () => {
  const { darkMode } = useTheme();

  const storiesRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const stories = [
    { id: 1, username: 'your_story', isUser: true },
    { id: 2, username: 'saroj_khadka08' },
    { id: 3, username: '_subiduble' },
    { id: 4, username: 'saroj_kc' },
    { id: 5, username: 'mide_vibez__' },
    { id: 6, username: 'travel_lover' },
    { id: 7, username: 'travel_lover' },
    { id: 8, username: 'travel_lover' },
  ];

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - storiesRef.current.offsetLeft);
    setScrollLeft(storiesRef.current.scrollLeft);
    storiesRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      storiesRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    storiesRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - storiesRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    storiesRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch event handlers
  useEffect(() => {
    const element = storiesRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - element.offsetLeft);
      setScrollLeft(element.scrollLeft);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.touches[0].pageX - element.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      element.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <div
      className={`pt-3 pb-4 border-b transition-colors duration-300
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div
        ref={storiesRef}
        className="flex space-x-4 px-4 overflow-x-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          userSelect: 'none',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          touchAction: 'pan-y',
        }}
      >
        {/* Hide scrollbar for WebKit browsers */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                story.isUser
                  ? 'bg-gradient-to-tr from-yellow-300 to-pink-500 p-0.5'
                  : 'bg-gradient-to-tr from-purple-400 to-blue-500 p-0.5'
              }`}
            >
              <div
                className={`p-0.5 rounded-full w-full h-full flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {story.isUser ? (
                    <span
                      className={`text-2xl transition-colors duration-300 ${
                        darkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}
                    >
                      +
                    </span>
                  ) : (
                    <img
                      src={`https://randomuser.me/api/portraits/${
                        story.id % 2 === 0 ? 'women' : 'men'
                      }/${story.id + 10}.jpg`}
                      alt={story.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
            <p
              className={`text-xs w-16 text-center truncate transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              {story.isUser ? 'Your story' : story.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
