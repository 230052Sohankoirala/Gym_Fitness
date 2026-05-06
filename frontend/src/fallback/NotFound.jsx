import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl mb-4">Oops! Page not found.</p>
        <Link  className="text-blue-500 hover:underline">
        <button
          onClick={() => navigate(-1)}>Go Back</button>
        </Link>

      </div>
    </div>
  );
};

export default NotFound