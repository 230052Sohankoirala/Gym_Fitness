import NeoCard from './DiscoveryCard';
import MoodSelector from './InterestPills';
import { useTheme } from '../context/ThemeContext';

const ContentStream = () => {
  const { darkMode } = useTheme();

  const contentItems = [
    {
      id: 1,
      type: 'moment',
      user: {
        name: 'Alex Chen',
        handle: '@alexchen',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      content: {
        text: 'Just launched my new digital art collection! Check out the interactive gallery link in bio.',
        media: 'https://source.unsplash.com/random/600x600/?digital,art',
      },
      stats: {
        reactions: 142,
        comments: 28,
        shares: 12,
      },
      tags: ['digitalart', 'nft', 'creative'],
    },
    {
      id: 2,
      type: 'question',
      user: {
        name: 'Tech Thoughts',
        handle: '@techthoughts',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      content: {
        text: 'What emerging technology are you most excited about in 2023?',
        options: ['AI/ML', 'Web3', 'Biotech', 'Quantum'],
      },
      stats: {
        reactions: 89,
        comments: 42,
        shares: 5,
      },
      tags: ['technology', 'discussion'],
    },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto px-4 pb-28 pt-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Mood or interest pills */}
      <div className="mb-4">
        <MoodSelector />
      </div>

      {/* Content feed */}
      <div className="space-y-6">
        {contentItems.map((item) => (
          <NeoCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ContentStream;
