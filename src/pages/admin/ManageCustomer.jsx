import { useCallback, useEffect, useState } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import { RiDeleteBin5Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { TiCancel } from "react-icons/ti";
import LoadingAnimation from "../../component/LoadingAnimation";
import axios from "axios";
import { FaCheck } from "react-icons/fa";

export default function ManageCustomer() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/customers?page=${currentPage}&mobile_number=${search}`
      );
      const data = response.data;
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const headers = [
    { name: "C. Name" },
    { name: "Mobile Number" },
    { name: "Active Status" },
    { name: "Address" },
    { name: "Pincode" },
    { name: "Area" },
    { name: "Created At" },
    { name: "Action" },
  ];

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages >= 1) {
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
    }

    return pageNumbers;
  };

  async function handelDelete(id) {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/customers/${id}`
      );
      if (response.status === 200) {
        alert("Customer deleted successfully");
        fetchCustomers();
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

  async function handelUpdate(id, status) {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/customers/${id}`,
        {
          activeState: status,
        }
      );
      if (response.status === 200) {
        alert("Customer updated successfully");
        fetchCustomers();
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search Customer
            </label>
            <input
              type="search"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
              placeholder="Search by number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-full">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-row px-2 py-4 gap-4 font-medium sm:text-sm xlg:text-base bg-black text-white w-full border-b">
                {headers.map((header, index) => (
                  <div
                    key={index}
                    className="flex-1 flex items-center gap-3 cursor-pointer"
                  >
                    {header.name}
                  </div>
                ))}
              </div>
              <div className="flex flex-col h-[60vh] no-scrollbar bg-white overflow-auto">
                {customers.map((detail) => (
                  <div
                    className="flex flex-row px-2 py-4 border-b border-[#BBBBBB] group hover:bg-sky-500 hover:text-white transition-colors duration-300 gap-4 font-medium text-base w-full"
                    key={detail.customerId}
                  >
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.name}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.mobile_number}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.activeState ? "Active" : "Deactive"}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.address}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.pincode}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.area}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.createdAt
                        ? new Date(detail.createdAt).toDateString()
                        : ""}
                    </div>
                    <div className="flex flex-row flex-1 items-center font-semibold gap-5 text-xl">
                      <button
                        type="button"
                        title={
                          detail.activeState
                            ? "Deactivate Customer"
                            : "Activate Customer"
                        }
                        onClick={() =>
                          handelUpdate(detail._id, !detail.activeState)
                        }
                      >
                        {detail.activeState ? (
                          <TiCancel className="text-red-500 group-hover:text-red-200" />
                        ) : (
                          <FaCheck className="text-green-500 group-hover:text-green-200" />
                        )}
                      </button>
                      <button
                        className="text-[#D53F3A] group-hover:text-red-200"
                        onClick={() => handelDelete(detail._id)}
                        title="Delete"
                      >
                        <RiDeleteBin5Line />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
              currentPage === 1 ? "text-[#777777]" : "text-black"
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
    </AdminDashboardTemplate>
  );
}
