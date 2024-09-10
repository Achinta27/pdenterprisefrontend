import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import ManageBrand from "../../component/ManageBrand";

const AddAndManageBrand = () => {
  const [brandname, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/brandsadd/get`
      );
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/brandsadd/create`,
        { brandname }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setBrandName("");

        // Update the brands state with the newly added brand
        setBrands((prevBrands) => [...prevBrands, response.data.newBrand]);
      } else {
        setMessage(response.data.error || "Failed to create brand");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
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
          <label className="text-lg text-black font-medium">Brand Name</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={brandname}
              onChange={(e) => setBrandName(e.target.value)}
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
          <ManageBrand brands={brands} fetchBrands={fetchBrands} />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageBrand;
