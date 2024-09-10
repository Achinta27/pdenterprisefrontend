import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import ManageUser from "../../component/ManageUsers";

const AddAndManageUser = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users`
      );
      const teamLeaderResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/teamleader`
      );
      setUsers([...userResponse.data, ...teamLeaderResponse.data]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    if (value.length <= 10) {
      setPhone(value);
      setMobileNumberError(""); // Reset error when input is valid
    }
  };

  const generatePassword = () => {
    if (name && phone.length >= 6) {
      // Capitalize the first letter of the name
      const capitalizedFirstLetter = name.charAt(0).toUpperCase();
      const restOfName = name.substring(1, 4); // The remaining characters after the first letter

      const passwordPart = `${capitalizedFirstLetter}${restOfName}@${phone.substring(
        0,
        2
      )}#${phone.substring(2, 4)}`;
      setPassword(passwordPart);
    } else {
      setPassword("Invalid Data for Password Generation");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (phone.length !== 10) {
      setMobileNumberError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    // Adjust the payload based on the role
    const payload =
      role === "Admin"
        ? { name, phone, password, designation: role, activeState: "Active" } // Ensure activeState is set to Active
        : {
            teamleadername: name,
            phone,
            password,
            designation: role,
            activeState: "Active",
          }; // Ensure activeState is set to Active

    const url =
      role === "Admin"
        ? `${import.meta.env.VITE_BASE_URL}/api/users`
        : `${import.meta.env.VITE_BASE_URL}/api/teamleader`;

    try {
      const response = await axios.post(url, payload);

      if (response.status === 201) {
        const newUser =
          role === "Admin"
            ? {
                ...response.data,
                name,
                phone,
                designation: role,
                activeState: "Active",
              }
            : {
                ...response.data,
                teamleadername: name,
                phone,
                designation: role,
                activeState: "Active",
              };

        setMessage(response.data.message);
        setName("");
        setPhone("");
        setPassword("");
        setRole("Admin");

        // Update the users state with the newly added user
        setUsers((prevUsers) => [...prevUsers, newUser]);
      } else {
        setMessage(response.data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="p-4 flex flex-col gap-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 w-full gap-8 py-4 lg:w-[90%] sm:w-full"
        >
          <div className="flex flex-col gap-2">
            <label className="text-lg text-black">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
              placeholder="Name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg text-black">Mobile Number</label>
            <input
              type="text"
              value={phone}
              onChange={handleMobileNumberChange}
              className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
              placeholder="Mobile Number"
            />
            {mobileNumberError && (
              <p className="text-red-600">{mobileNumberError}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg text-black">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
            >
              <option value="Admin">Admin</option>
              <option value="TeamLeader">Team Leader</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg text-black">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[3.5rem] p-2 bg-[white] text-black rounded-md border border-[#CCCCCC]"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="mt-2 text-black text-start ml-4 hover:underline"
            >
              Generate Password
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-[40%] h-[3.5rem] bg-[#EEEEEE] rounded-md shadow-custom text-lg text-[black] font-medium flex justify-center items-center"
          >
            {loading ? "Uploading..." : "Submit"}
          </button>

          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-black">{message}</p>}
        </form>
        <ManageUser users={users} fetchUsers={fetchUsers} setUsers={setUsers} />
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageUser;
