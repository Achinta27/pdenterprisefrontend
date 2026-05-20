import { useState, useEffect } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingAnimation from "../../component/LoadingAnimation";

const STATUS_TABS = ["All", "pending", "approved", "rejected"];

export default function ManageDealerCall() {
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchCalls();
  }, [currentPage, activeTab]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(activeTab !== "All" && { status: activeTab }),
        ...(search && { customerName: search }),
      });
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/dealercall/get-all?${params}`,
      );
      setCalls(response.data.calls);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching dealer calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCalls();
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-sm font-medium ${styles[status] || "bg-gray-100"}`}
      >
        {status}
      </span>
    );
  };

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
            className={`px-4 py-1 mx-1 text-lg font-medium bg-[#EEEEEE] text-black ${i === currentPage ? "" : "shadow-custom"} rounded`}
          >
            {i}
          </button>,
        );
      }
    }
    return pageNumbers;
  };

  return (
    <AdminDashboardTemplate>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Dealer Calls</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button
            type="submit"
            className="bg-[#007bff] text-white px-4 py-2 rounded"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
              fetchCalls();
            }}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Clear
          </button>
        </form>

        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">Call ID</th>
                  <th className="p-3 border">Dealer</th>
                  <th className="p-3 border">Customer</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Brand</th>
                  <th className="p-3 border">Product</th>
                  <th className="p-3 border">Service Type</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-gray-500">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border font-mono text-sm">
                        {call.dealerCallId}
                      </td>
                      <td className="p-3 border">{call.dealer?.name || "-"}</td>
                      <td className="p-3 border">{call.customerName}</td>
                      <td className="p-3 border">{call.contactNumber}</td>
                      <td className="p-3 border">
                        {call.brand?.brandname || "-"}
                      </td>
                      <td className="p-3 border">
                        {call.product?.productname || "-"}
                      </td>
                      <td className="p-3 border">
                        {call.serviceType?.servicetype ||
                          call.serviceType ||
                          "-"}
                      </td>
                      <td className="p-3 border">
                        {getStatusBadge(call.status)}
                      </td>
                      <td className="p-3 border">
                        {new Date(call.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 border">
                        <Link
                          to={`/admin/dealer-calls/${call.dealerCallId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">{renderPageNumbers()}</div>
        )}
      </div>
    </AdminDashboardTemplate>
  );
}
