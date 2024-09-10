import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center justify-center">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
        <h2 className="text-center text-white text-xl font-semibold">
          Uploading...
        </h2>
      </div>
    </div>
  );
};

export default LoadingSpinner;
