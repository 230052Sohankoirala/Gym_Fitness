import { useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineCamera, HiOutlinePhotograph } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const CreatePage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    {
      id: 'post',
      title: 'Create Post',
      description: 'Share photos or videos to your profile',
      icon: <HiOutlinePhotograph className="text-3xl" />
    },
    {
      id: 'story',
      title: 'Create Story',
      description: 'Share a photo or video that disappears after 24 hours',
      icon: <HiOutlineCamera className="text-3xl" />
    }
  ];

  return (
    <div className="max-w-xl mx-auto bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            <HiOutlineArrowLeft className="text-xl" />
          </button>
          <h1 className="text-lg font-bold">Create</h1>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!selectedOption ? (
          <div className="space-y-4 mt-8">
            {options.map(option => (
              <div 
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="mr-4 text-indigo-500">
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-bold">{option.title}</h3>
                  <p className="text-gray-500 text-sm">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center">
            {selectedOption === 'post' ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Create New Post</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <HiOutlinePhotograph className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p>Drag photos and videos here</p>
                  <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Select from device
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Create New Story</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <HiOutlineCamera className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p>Take a photo or video</p>
                  <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Open Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;