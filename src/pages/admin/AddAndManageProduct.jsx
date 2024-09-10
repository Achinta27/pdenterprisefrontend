import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import ManageProduct from "../../component/ManageProducts";

const AddAndManageProduct = () => {
  const [productname, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/productsadd/get`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/productsadd/create`,
        { productname }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setProductName("");

        setProducts((prevProducts) => [
          ...prevProducts,
          response.data.newProduct,
        ]);
      } else {
        setMessage(response.data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
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
          <label className="text-lg text-black">Product Name</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={productname}
              onChange={(e) => setProductName(e.target.value)}
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
          <ManageProduct products={products} fetchProducts={fetchProducts} />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageProduct;
