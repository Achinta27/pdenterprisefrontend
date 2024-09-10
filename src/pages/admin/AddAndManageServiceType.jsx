import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import ManageServiceType from "../../component/ManageServiceType";

const AddAndManageServiceType = () => {
  const [servicetype, setServiceType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/servicetype/get`
      );
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/servicetype/create`,
        { servicetype }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setServiceType("");

        // Update the services state with the newly added service
        setServices((prevServices) => [
          ...prevServices,
          response.data.newService,
        ]);
      } else {
        setMessage(response.data.error || "Failed to create service");
      }
    } catch (error) {
      console.error("Error creating service:", error);
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
          <label className="text-lg text-black">Service Type</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={servicetype}
              onChange={(e) => setServiceType(e.target.value)}
              className="xl:w-[40%] lg:w-[50%] sm:w-[60%] h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-sm border border-[#CCCCCC]"
              placeholder="Service Type"
            />
            <button
              type="submit"
              disabled={loading}
              className="xl:w-[15%] lg:w-[25%] sm:w-[30%] h-[3.5rem] bg-[#FF27221A] rounded-sm text-lg text-[#FF2722] font-medium flex justify-center items-center"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-black">{message}</p>}
        </form>
        <div>
          <ManageServiceType
            services={services}
            fetchServices={fetchServices}
          />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageServiceType;
