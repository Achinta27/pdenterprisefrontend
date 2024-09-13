import React, { useState } from "react";
import axios from "axios";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import ConfirmationModal from "./ConfirmationModel";

const ManageUser = ({ users, fetchUsers, setUsers }) => {
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [editedActiveState, setEditedActiveState] = useState("");
  const [editedPassword, setEditedPassword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditedName(user.name || user.teamleadername);
    setEditedPhone(user.phone);
    setEditedRole(user.designation || "Admin");
    setEditedActiveState(user.activeState || "Active");
    setEditedPassword(user.password || "");
    setIsPopupOpen(true);
  };

  const handleSaveClick = async () => {
    setLoading(true);

    const payload =
      editedRole === "Admin"
        ? {
            name: editedName,
            phone: editedPhone,
            designation: editedRole,
            activeState: editedActiveState,
            password: editedPassword,
          }
        : {
            teamleadername: editedName, // Use teamleadername for team leaders
            phone: editedPhone,
            designation: editedRole,
            activeState: editedActiveState,
            password: editedPassword,
          };

    const url =
      editedRole === "Admin"
        ? `${import.meta.env.VITE_BASE_URL}/api/users/${editingUser.userId}`
        : `${import.meta.env.VITE_BASE_URL}/api/teamleader/${
            editingUser.teamleaderId
          }`;

    try {
      const response = await axios.put(url, payload);

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingUser._id
              ? {
                  ...user,
                  name: editedRole === "Admin" ? editedName : user.name,
                  teamleadername:
                    editedRole !== "Admin" ? editedName : user.teamleadername,
                  phone: editedPhone,
                  designation: editedRole,
                  activeState: editedActiveState,
                  password: editedPassword,
                }
              : user
          )
        );
        setEditingUser(null);
        setIsPopupOpen(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true); // Open modal when delete is clicked
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    const url =
      selectedUser.designation === "Admin"
        ? `${import.meta.env.VITE_BASE_URL}/api/users/delete/${
            selectedUser.userId
          }`
        : `${import.meta.env.VITE_BASE_URL}/api/teamleader/delete/${
            selectedUser.teamleaderId
          }`;

    try {
      await axios.delete(url);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsModalOpen(false); // Close the modal after deleting
      setSelectedUser(null); // Clear selected user
    }
  };
  const handleCancelClick = () => {
    setEditingUser(null);
    setIsPopupOpen(false);
  };

  const toggleActiveState = async (user) => {
    setLoading(true);
    const updatedState = user.activeState === "Active" ? "Disable" : "Active";

    // Ensure userId or teamleaderId exists
    const id = user.designation === "Admin" ? user.userId : user.teamleaderId;
    if (!id) {
      console.error("User ID or Team Leader ID not found");
      setLoading(false);
      return;
    }

    const url =
      user.designation === "Admin"
        ? `${import.meta.env.VITE_BASE_URL}/api/users/${user.userId}`
        : `${import.meta.env.VITE_BASE_URL}/api/teamleader/${
            user.teamleaderId
          }`;

    try {
      const response = await axios.put(url, { activeState: updatedState });
      if (response.status === 200) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating active state:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    if (editedName && editedPhone.length >= 6) {
      const capitalizedFirstLetter = editedName.charAt(0).toUpperCase();
      const restOfName = editedName.substring(1, 4);
      const passwordPart = `${capitalizedFirstLetter}${restOfName}@${editedPhone.substring(
        0,
        2
      )}#${editedPhone.substring(2, 4)}`;
      setEditedPassword(passwordPart);
    } else {
      setEditedPassword("Invalid Data for Password Generation");
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
      {/* User List */}
      <div className="lg:w-[90%] sm:w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row p-4 gap-4 font-medium text-base bg-black text-white w-full border-b">
            <div className="w-[20%]">Name</div>
            <div className="w-[20%]">Phone</div>
            <div className="w-[20%]">Role</div>
            <div className="w-[20%]">Active State</div>
            <div className="w-[20%]">Actions</div>
          </div>
          <div className="flex flex-col h-[50vh] no-scrollbar bg-white overflow-auto">
            {currentUsers.map((user) => (
              <div
                className="flex flex-row p-3 border-b border-[#BBBBBB] gap-4 font-medium text-base w-full"
                key={user._id}
              >
                <>
                  <div className="text-sm font-semibold w-[20%]">
                    {user.name || user.teamleadername}
                  </div>
                  <div className="text-sm font-semibold w-[20%]">
                    {user.phone}
                  </div>
                  <div className="text-sm font-semibold w-[20%]">
                    {user.designation}
                  </div>
                  <div className="text-sm font-semibold w-[20%]">
                    <button
                      onClick={() => toggleActiveState(user)}
                      className={`px-4 py-1 text-sm rounded-md ${
                        user.activeState === "Active"
                          ? "bg-green-600 text-white"
                          : "bg-[#EEEEEE] text-black"
                      }`}
                    >
                      {user.activeState}
                    </button>
                  </div>
                  <div className="flex flex-row w-[20%] items-center font-semibold gap-5">
                    <button
                      className="text-[#5BC0DE]"
                      onClick={() => handleEditClick(user)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="text-[#D53F3A]"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <RiDeleteBin5Line />
                    </button>
                  </div>
                </>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        message={`Are you sure you want to delete ${
          selectedUser?.name || selectedUser?.teamleadername
        }?`}
        onConfirm={confirmDeleteUser}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Popup for Editing */}
      {isPopupOpen && (
        <div className="popup fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
                placeholder="Name"
              />
              <input
                type="text"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
                placeholder="Mobile Number"
              />
              <select
                value={editedRole}
                onChange={(e) => setEditedRole(e.target.value)}
                className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
              >
                <option value="Admin">Admin</option>
                <option value="TeamLeader">Team Leader</option>
              </select>
              <input
                type="text"
                value={editedPassword}
                onChange={(e) => setEditedPassword(e.target.value)}
                className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="mt-2 text-black text-start hover:underline"
              >
                Generate Password
              </button>
              <div className="flex gap-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={handleSaveClick}
                >
                  Save
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
            currentPage === totalPages ? "text-[#777777]" : "text-black"
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
            currentPage === totalPages ? "text-[#777777]" : "text-black"
          }`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageUser;
