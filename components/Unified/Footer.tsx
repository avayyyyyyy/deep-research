import React from 'react'

const Footer = () => {
  return (
    <div className="flex justify-center items-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} AI Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer
