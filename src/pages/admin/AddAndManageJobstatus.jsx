import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import ManageJobstatus from "../../component/ManageJobstatus";

const AddAndManageJobstatus = () => {
  const [jobstatusName, setJobstatusName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jobstatuses, setJobstatuses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobstatuses();
  }, []);

  const fetchJobstatuses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/jobstatus/get`
      );
      setJobstatuses(response.data);
    } catch (error) {
      console.error("Error fetching jobstatuses:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/jobstatus/create`,
        { jobstatusName }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setJobstatusName("");

        // Update the jobstatuses state with the newly added jobstatus
        setJobstatuses((prevJobstatuses) => [
          ...prevJobstatuses,
          response.data.newJobStatus,
        ]);
      } else {
        setMessage(response.data.error || "Failed to create jobstatus");
      }
    } catch (error) {
      console.error("Error creating jobstatus:", error);
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
          className="flex w-full flex-col gap-2 py-4"
        >
          <label className="text-lg text-black font-medium">
            Jobstatus Name
          </label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={jobstatusName}
              onChange={(e) => setJobstatusName(e.target.value)}
              className="xl:w-[40%] lg:w-[50%] sm:w-[60%] h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-md border border-[#CCCCCC]"
            />
            <button
              type="submit"
              disabled={loading}
              className="xl:w-[15%] lg:w-[25%] sm:w-[30%] h-[3.5rem] bg-[#EEEEEE] rounded-md shadow-custom text-lg text-[black]  font-medium flex justify-center items-center"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-black">{message}</p>}
        </form>
        <div>
          <ManageJobstatus
            jobstatuses={jobstatuses}
            fetchJobstatuses={fetchJobstatuses}
          />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageJobstatus;
