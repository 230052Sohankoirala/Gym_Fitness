import { useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineSearch,
  HiOutlineFire,
  HiOutlineUserAdd,
  HiOutlineMusicNote,
  HiOutlinePhotograph
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('trending');

  const trendingPosts = [
    {
      id: 1,
      username: 'traveler_jane',
      caption: 'Sunset in Bali 🌅 #travel',
      likes: '12.4K',
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21'
    },
    {
      id: 2,
      username: 'food_explorer',
      caption: 'Homemade pasta recipe! 🍝',
      likes: '8.2K',
      image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb'
    }
  ];

  const suggestedUsers = [
    { id: 1, username: 'photography_love', name: 'Emma Stone', isFollowing: false },
    { id: 2, username: 'fitness_guru', name: 'Mike Johnson', isFollowing: true }
  ];

  const popularAudio = [
    { id: 1, title: 'Viral Dance Trend', plays: '1.2M', artist: '@dancecrew' },
    { id: 2, title: 'Chill Lofi Beat', plays: '856K', artist: '@musicproducer' }
  ];

  const trendingTags = [
    { id: 1, tag: '#summer2023', posts: '1.4M' },
    { id: 2, tag: '#fitnessmotivation', posts: '892K' }
  ];

  return (
    <div className={`min-h-screen flex justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="w-full max-w-xl pb-16">
        {/* Header */}
        <div className={`sticky top-0 z-10 border-b p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300">
              <HiOutlineArrowLeft className="text-xl" />
            </button>
            <div className="relative flex-1 mx-4">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Discover"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg focus:outline-none text-black dark:text-white"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-3 overflow-x-auto scrollbar-hide">
            {[
              { id: 'trending', icon: <HiOutlineFire />, label: 'Trending' },
              { id: 'people', icon: <HiOutlineUserAdd />, label: 'People' },
              { id: 'audio', icon: <HiOutlineMusicNote />, label: 'Audio' },
              { id: 'tags', icon: <HiOutlinePhotograph />, label: 'Tags' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col">
          {activeTab === 'trending' && (
            <div>
              <h2 className="font-bold text-lg mb-4">Trending Now</h2>
              <div className="space-y-6">
                {trendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border dark:border-gray-700 rounded-xl overflow-hidden"
                  >
                    <div className="p-3 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                      <span className="font-medium">@{post.username}</span>
                    </div>
                    <img src={post.image} alt="" className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <p className="font-medium">{post.caption}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{post.likes} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div>
              <h2 className="font-bold text-lg mb-4">Suggested Accounts</h2>
              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                      <div>
                        <p className="font-medium">@{user.username}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{user.name}</p>
                      </div>
                    </div>
                    <button
                      className={`px-4 py-1 rounded-full text-sm transition-colors ${
                        user.isFollowing
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div>
              <h2 className="font-bold text-lg mb-4">Popular Audio</h2>
              <div className="space-y-4">
                {popularAudio.map((audio) => (
                  <div
                    key={audio.id}
                    className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                        <HiOutlineMusicNote className="text-xl text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{audio.title}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{audio.artist}</p>
                      </div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">{audio.plays} plays</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <h2 className="font-bold text-lg mb-4">Trending Tags</h2>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <span className="font-medium">{tag.tag}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">{tag.posts}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
