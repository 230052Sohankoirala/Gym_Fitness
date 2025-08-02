import { useState } from 'react';
import {
  HiOutlineBookmark,
  HiOutlineFilm,
  HiOutlineUserAdd,
  HiOutlineMenu,
  HiOutlineLink,
  HiOutlineMail,
  HiOutlineViewGrid,
  HiOutlineArrowLeft,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const profile = {
    username: 'jane_doe',
    name: 'Jane Doe',
    bio: 'Digital creator | Travel enthusiast ✈️ | Photography lover',
    website: 'janedoe.art',
    followers: '12.8K',
    following: '584',
    posts: 86,
    isPrivate: false,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  };

  const posts = [
    { id: 1, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', likes: '1.2K', comments: 42 },
    { id: 2, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', likes: '856', comments: 21 },
    { id: 3, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', likes: '2.3K', comments: 87 },
  ];

  const reels = [
    { id: 1, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', views: '24.5K' },
    { id: 2, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', views: '18.2K' },
  ];

  const savedPosts = [
    { id: 1, image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde' },
  ];

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="max-w-xl mx-auto pb-16 relative z-10">
        
        {/* Header */}
        <div className={`sticky top-0 z-20 flex items-center justify-between p-4 border-b transition-colors
          ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button onClick={() => navigate(-1)} className="text-xl text-gray-600 dark:text-gray-300">
            <HiOutlineArrowLeft />
          </button>

          <div className="flex items-center">
            <span className="font-bold mr-2">@{profile.username}</span>
            {profile.isPrivate && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">Private</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
            </button>
            <button className="text-xl text-gray-600 dark:text-gray-300">
              <HiOutlineMenu />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="w-20 h-20 rounded-full border-2 border-pink-500 p-0.5">
              <img src={profile.avatar} alt="Avatar" className="rounded-full w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex justify-around px-4 text-center">
              <div>
                <p className="font-bold">{profile.posts}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
              </div>
              <div>
                <p className="font-bold">{profile.followers}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
              </div>
              <div>
                <p className="font-bold">{profile.following}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <h2 className="font-bold">{profile.name}</h2>
            <p className="my-1 text-gray-800 dark:text-gray-200">{profile.bio}</p>
            {profile.website && (
              <a
                href={`https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 dark:text-blue-400 text-sm flex items-center"
              >
                <HiOutlineLink className="mr-1" /> {profile.website}
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                isFollowing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  : 'bg-blue-500 dark:bg-blue-600 text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-800 dark:text-gray-200">
              <HiOutlineMail className="inline mr-1" /> Message
            </button>
            <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
              <HiOutlineUserAdd className="text-xl" />
            </button>
          </div>

          {/* Highlights */}
          <div className="flex space-x-4 mb-6 overflow-x-auto scrollbar-hide">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600"></div>
                </div>
                <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">Highlight {item}</span>
              </div>
            ))}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 p-0.5 flex items-center justify-center">
                <span className="text-2xl text-gray-800 dark:text-gray-300">+</span>
              </div>
              <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">New</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700 flex">
          {[
            { id: 'posts', icon: <HiOutlineViewGrid /> },
            { id: 'reels', icon: <HiOutlineFilm /> },
            { id: 'saved', icon: <HiOutlineBookmark /> }
          ].map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-3 flex items-center justify-center ${
                activeTab === id
                  ? 'border-t-2 border-black dark:border-white text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="text-xl">{icon}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-3 gap-0.5">
          {activeTab === 'posts' &&
            posts.map((post) => (
              <div key={post.id} className="aspect-square relative group">
                <img src={post.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white font-bold mr-3">♥ {post.likes}</span>
                  <span className="text-white font-bold">💬 {post.comments}</span>
                </div>
              </div>
            ))}

          {activeTab === 'reels' &&
            reels.map((reel) => (
              <div key={reel.id} className="aspect-[9/16] relative">
                <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 text-white text-sm flex items-center">
                  <HiOutlineFilm className="mr-1" /> {reel.views}
                </div>
              </div>
            ))}

          {activeTab === 'saved' &&
            savedPosts.map((post) => (
              <div key={post.id} className="aspect-square">
                <img src={post.image} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
};

export default ProfilePage;
