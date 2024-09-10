import React, { useState } from "react";
import axios from "axios";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ManageJobstatus = ({ jobstatuses, fetchJobstatuses }) => {
  const [loading, setLoading] = useState(false);
  const [editingJobstatus, setEditingJobstatus] = useState(null);
  const [editedJobstatusName, setEditedJobstatusName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [jobstatusToDelete, setJobstatusToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const jobstatusesPerPage = 10;

  const indexOfLastJobstatus = currentPage * jobstatusesPerPage;
  const indexOfFirstJobstatus = indexOfLastJobstatus - jobstatusesPerPage;
  const currentJobstatuses = jobstatuses.slice(
    indexOfFirstJobstatus,
    indexOfLastJobstatus
  );

  const totalPages = Math.ceil(jobstatuses.length / jobstatusesPerPage);

  const handleEditClick = (jobstatus) => {
    setEditingJobstatus(jobstatus);
    setEditedJobstatusName(jobstatus.jobstatusName);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/jobstatus/update/${
          editingJobstatus.jobstatusId
        }`,
        {
          jobstatusName: editedJobstatusName,
        }
      );

      if (response.status === 200) {
        fetchJobstatuses();
        setEditingJobstatus(null);
        setEditedJobstatusName("");
      }
    } catch (error) {
      console.error("Error updating jobstatus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingJobstatus(null);
    setEditedJobstatusName("");
  };

  const handleDeleteClick = (jobstatus) => {
    setJobstatusToDelete(jobstatus);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!jobstatusToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/jobstatus/delete/${
          jobstatusToDelete.jobstatusId
        }`
      );
      if (response.status === 200) {
        fetchJobstatuses();
        setShowModal(false);
        setJobstatusToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting jobstatus:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setJobstatusToDelete(null);
  };

  const toggleActiveState = async (jobstatus) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/jobstatus/update/${
          jobstatus.jobstatusId
        }`,
        {
          activeState:
            jobstatus.activeState === "Active" ? "Disable" : "Active",
        }
      );

      if (response.status === 200) {
        fetchJobstatuses();
      }
    } catch (error) {
      console.error("Error updating active state:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-[40%]">Jobstatus Name</div>
            <div className="w-[20%]">Actions</div>
          </div>
          <div className="flex flex-col h-[50vh] no-scrollbar bg-white overflow-auto">
            {currentJobstatuses.map((jobstatus) => (
              <div
                className="flex flex-row p-3 border-b border-[#BBBBBB] gap-4 font-medium text-base w-full"
                key={jobstatus.jobstatusId}
              >
                {editingJobstatus &&
                editingJobstatus.jobstatusId === jobstatus.jobstatusId ? (
                  <>
                    <div className="w-[40%]">
                      <input
                        type="text"
                        value={editedJobstatusName}
                        onChange={(e) => setEditedJobstatusName(e.target.value)}
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
                    <div className="text-sm font-semibold w-[40%]">
                      {jobstatus.jobstatusName}
                    </div>
                    <div className="flex flex-row w-[20%] items-center font-semibold gap-5">
                      <button
                        className={`px-4 h-[1.7rem] py-4 text-sm rounded-md flex justify-center items-center ${
                          jobstatus.activeState === "Active"
                            ? "bg-green-600 text-white border-[#bbbbbb] border"
                            : "bg-[#EEEEEE] text-black border-[#bbbbbb] border "
                        }`}
                        onClick={() => toggleActiveState(jobstatus)}
                      >
                        {jobstatus.activeState}
                      </button>
                      <button
                        className="text-[#5BC0DE]"
                        onClick={() => handleEditClick(jobstatus)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={() => handleDeleteClick(jobstatus)}
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

      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
            currentPage === 1 ? " text-[#777777]" : " text-black"
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
            <p>Are you sure you want to delete this jobstatus?</p>
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

export default ManageJobstatus;
