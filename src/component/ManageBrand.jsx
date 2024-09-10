import React, { useState } from "react";
import axios from "axios";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ManageBrand = ({ brands, fetchBrands }) => {
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editedBrandName, setEditedBrandName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const brandsPerPage = 10;

  // Calculate the current brands to display
  const indexOfLastBrand = currentPage * brandsPerPage;
  const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
  const currentBrands = brands.slice(indexOfFirstBrand, indexOfLastBrand);

  const totalPages = Math.ceil(brands.length / brandsPerPage);

  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    setEditedBrandName(brand.brandname);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/brandsadd/update/${
          editingBrand.brandId
        }`,
        {
          brandname: editedBrandName,
        }
      );

      if (response.status === 200) {
        fetchBrands();
        setEditingBrand(null);
        setEditedBrandName("");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingBrand(null);
    setEditedBrandName("");
  };

  const handleDeleteClick = (brand) => {
    setBrandToDelete(brand);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/brandsadd/delete/${
          brandToDelete.brandId
        }`
      );
      if (response.status === 200) {
        fetchBrands();
        setShowModal(false);
        setBrandToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setBrandToDelete(null);
  };

  const toggleActiveState = async (brand) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/brandsadd/update/${
          brand.brandId
        }`,
        {
          activeState: brand.activeState === "Active" ? "Disable" : "Active",
        }
      );

      if (response.status === 200) {
        fetchBrands();
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
            <div className="w-[40%]">Brand Name</div>
            <div className="w-[20%]">Actions</div>
          </div>
          <div className="flex flex-col h-[50vh] no-scrollbar bg-white overflow-auto">
            {currentBrands.map((brand) => (
              <div
                className="flex flex-row p-3 border-b border-[#BBBBBB] gap-4 font-medium text-base w-full"
                key={brand.brandId}
              >
                {editingBrand && editingBrand.brandId === brand.brandId ? (
                  <>
                    <div className="w-[40%]">
                      <input
                        type="text"
                        value={editedBrandName}
                        onChange={(e) => setEditedBrandName(e.target.value)}
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
                      {brand.brandname}
                    </div>
                    <div className="flex flex-row w-[20%] items-center font-semibold gap-5">
                      <button
                        className={`px-4 h-[1.7rem] py-4 text-sm rounded-md flex justify-center items-center ${
                          brand.activeState === "Active"
                            ? "bg-green-600 text-white border-[#bbbbbb] border"
                            : "bg-[#EEEEEE] text-black border-[#bbbbbb] border "
                        }`}
                        onClick={() => toggleActiveState(brand)}
                      >
                        {brand.activeState}
                      </button>
                      <button
                        className="text-[#5BC0DE]"
                        onClick={() => handleEditClick(brand)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={() => handleDeleteClick(brand)}
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
            <p>Are you sure you want to delete this brand?</p>
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

export default ManageBrand;
