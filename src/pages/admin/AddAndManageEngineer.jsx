import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import ManageEngineer from "../../component/ManageEngineer";

const AddAndManageEngineer = () => {
  const [engineername, setEngineerName] = useState("");
  const [engineerMobilenumber, setEngineerMobileNumber] = useState("");
  const [engineerCity, setEngineerCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [engineers, setEngineers] = useState([]);
  const [error, setError] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/enginnerdetails/get`
      );
      setEngineers(response.data);
    } catch (error) {
      console.error("Error fetching engineers:", error);
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    if (value.length <= 10) {
      setEngineerMobileNumber(value);
      setMobileNumberError(""); // Reset error when input is valid
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (engineerMobilenumber.length !== 10) {
      setMobileNumberError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/enginnerdetails/create`,
        { engineername, engineerMobilenumber, engineerCity }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setEngineerName("");
        setEngineerMobileNumber("");
        setEngineerCity("");

        // Update the engineers state with the newly added engineer
        setEngineers((prevEngineers) => [
          ...prevEngineers,
          response.data.newEngineer,
        ]);
      } else {
        setMessage(response.data.error || "Failed to create engineer");
      }
    } catch (error) {
      console.error("Error creating engineer:", error);
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
            <label className="text-lg text-black">Engineer Name</label>
            <div className="w-full flex items-center gap-4">
              <input
                type="text"
                value={engineername}
                onChange={(e) => setEngineerName(e.target.value)}
                className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-md border border-[#CCCCCC]"
                placeholder="Engineer Name"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg text-black">Engineer Mobile Number</label>
            <div className="w-full flex items-center gap-4">
              <input
                type="text"
                value={engineerMobilenumber}
                onChange={handleMobileNumberChange}
                className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-md border border-[#CCCCCC]"
                placeholder="Mobile Number"
              />
            </div>
            {mobileNumberError && (
              <p className="text-red-600">{mobileNumberError}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg text-black">Engineer City</label>

            <input
              type="text"
              value={engineerCity}
              onChange={(e) => setEngineerCity(e.target.value)}
              className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-md border border-[#CCCCCC]"
              placeholder="City"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg text-transparent">Submit</label>

            <button
              type="submit"
              disabled={loading}
              className="w-[40%] h-[3.5rem] bg-[#EEEEEE] rounded-md shadow-custom text-lg text-[black] font-medium flex justify-center items-center"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-black">{message}</p>}
        </form>
        <div>
          <ManageEngineer
            engineers={engineers}
            fetchEngineers={fetchEngineers}
          />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageEngineer;
