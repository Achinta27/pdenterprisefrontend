import React from "react";

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Confirmation</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            No
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
