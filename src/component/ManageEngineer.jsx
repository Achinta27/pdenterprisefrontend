import React, { useState } from "react";
import axios from "axios";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ManageEngineer = ({ engineers, fetchEngineers }) => {
  const [loading, setLoading] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState(null);
  const [editedEngineerName, setEditedEngineerName] = useState("");
  const [editedEngineerMobileNumber, setEditedEngineerMobileNumber] =
    useState("");
  const [editedEngineerCity, setEditedEngineerCity] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [engineerToDelete, setEngineerToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const engineersPerPage = 10;

  // Calculate the current engineers to display
  const indexOfLastEngineer = currentPage * engineersPerPage;
  const indexOfFirstEngineer = indexOfLastEngineer - engineersPerPage;
  const currentEngineers = engineers.slice(
    indexOfFirstEngineer,
    indexOfLastEngineer
  );

  const totalPages = Math.ceil(engineers.length / engineersPerPage);

  const handleEditClick = (engineer) => {
    setEditingEngineer(engineer);
    setEditedEngineerName(engineer.engineername);
    setEditedEngineerMobileNumber(engineer.engineerMobilenumber);
    setEditedEngineerCity(engineer.engineerCity);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/enginnerdetails/update/${
          editingEngineer.engineerId
        }`,
        {
          engineername: editedEngineerName,
          engineerMobilenumber: editedEngineerMobileNumber,
          engineerCity: editedEngineerCity,
        }
      );

      if (response.status === 200) {
        fetchEngineers();
        setEditingEngineer(null);
        setEditedEngineerName("");
        setEditedEngineerMobileNumber("");
        setEditedEngineerCity("");
      }
    } catch (error) {
      console.error("Error updating engineer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingEngineer(null);
    setEditedEngineerName("");
    setEditedEngineerMobileNumber("");
    setEditedEngineerCity("");
  };

  const handleDeleteClick = (engineer) => {
    setEngineerToDelete(engineer);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!engineerToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/enginnerdetails/delete/${
          engineerToDelete.engineerId
        }`
      );
      if (response.status === 200) {
        fetchEngineers();
        setShowModal(false);
        setEngineerToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting engineer:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setEngineerToDelete(null);
  };

  const toggleActiveState = async (engineer) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/enginnerdetails/update/${
          engineer.engineerId
        }`,
        {
          activeState: engineer.activeState === "Active" ? "Disable" : "Active",
        }
      );

      if (response.status === 200) {
        fetchEngineers();
      }
    } catch (error) {
      console.error("Error updating active state:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    } else if (currentPage > totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-1 mx-1 text-lg font-medium bg-[#EEEEEE] text-black ${
            i === currentPage ? "" : " shadow-custom"
          } rounded`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="lg:w-[90%] sm:w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row p-4 gap-4 font-medium text-base bg-black text-white w-full border-b">
            <div className="w-[20%]">Engineer Name</div>
            <div className="w-[20%]">Mobile Number</div>
            <div className="w-[20%]">City</div>
            <div className="w-[20%]">Actions</div>
          </div>
          <div className="flex flex-col h-[50vh] no-scrollbar bg-white overflow-auto">
            {currentEngineers.map((engineer) => (
              <div
                className="flex flex-row p-3 border-b border-[#BBBBBB] gap-4 font-medium text-base w-full"
                key={engineer.engineerId}
              >
                {editingEngineer &&
                editingEngineer.engineerId === engineer.engineerId ? (
                  <>
                    <div className="w-[20%]">
                      <input
                        type="text"
                        value={editedEngineerName}
                        onChange={(e) => setEditedEngineerName(e.target.value)}
                        className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#5BC0DE] bg-[white] border  text-[#FF2722] rounded-sm"
                      />
                    </div>
                    <div className="w-[20%]">
                      <input
                        type="text"
                        value={editedEngineerMobileNumber}
                        onChange={(e) =>
                          setEditedEngineerMobileNumber(e.target.value)
                        }
                        className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#5BC0DE] bg-[white] border  text-[#FF2722] rounded-sm"
                      />
                    </div>
                    <div className="w-[20%]">
                      <input
                        type="text"
                        value={editedEngineerCity}
                        onChange={(e) => setEditedEngineerCity(e.target.value)}
                        className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#5BC0DE] bg-[white] border  text-[#FF2722] rounded-sm"
                      />
                    </div>
                    <div className="flex flex-row items-center w-[20%] font-semibold gap-5">
                      <button
                        className="text-[#5BC0DE]"
                        disabled={loading}
                        onClick={handleSaveClick}
                      >
                        {loading ? "Uploading..." : <FaCheck />}
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={handleCancelClick}
                      >
                        <RxCross2 />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold w-[20%]">
                      {engineer.engineername}
                    </div>
                    <div className="text-sm font-semibold w-[20%]">
                      {engineer.engineerMobilenumber}
                    </div>
                    <div className="text-sm font-semibold w-[20%]">
                      {engineer.engineerCity}
                    </div>
                    <div className="flex flex-row w-[20%] items-center font-semibold gap-5">
                      <button
                        className={`px-4 h-[1.7rem] py-4 text-sm rounded-md flex justify-center items-center ${
                          engineer.activeState === "Active"
                            ? "bg-green-600 text-white border-[#bbbbbb] border"
                            : "bg-[#EEEEEE] text-black border-[#bbbbbb] border "
                        }`}
                        onClick={() => toggleActiveState(engineer)}
                      >
                        {engineer.activeState}
                      </button>
                      <button
                        className="text-[#5BC0DE]"
                        onClick={() => handleEditClick(engineer)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={() => handleDeleteClick(engineer)}
                      >
                        <RiDeleteBin5Line />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
            currentPage === totalPages ? " text-[#777777]" : " text-black"
          }`}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {renderPageNumbers()}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
            currentPage === totalPages ? " text-[#777777]" : " text-black"
          }`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this engineer?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={closeDeleteModal}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={confirmDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEngineer;
