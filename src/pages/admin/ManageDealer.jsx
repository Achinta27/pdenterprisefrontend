import { useState, useEffect } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import LoadingAnimation from "../../component/LoadingAnimation";

export default function ManageDealer() {
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDealers();
  }, [currentPage, statusFilter]);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { name: search, phoneNumber: search, dealerCode: search }),
      });
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/dealer/get-all?${params}`
      );
      setDealers(response.data.dealers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDealers();
  };

  const handleDelete = async (dealerId) => {
    const confirm = window.confirm("Are you sure you want to delete this dealer?");
    if (!confirm) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/dealer/delete/${dealerId}`
      );
      alert("Dealer deleted successfully");
      fetchDealers();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting dealer");
    }
  };

  const handleToggleStatus = async (dealerId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/dealer/status/${dealerId}`,
        { status: newStatus }
      );
      alert(`Dealer ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchDealers();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages >= 1) {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      if (currentPage <= 3) { startPage = 1; endPage = Math.min(5, totalPages); }
      else if (currentPage > totalPages - 2) { startPage = Math.max(1, totalPages - 4); endPage = totalPages; }
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-4 py-1 mx-1 text-lg font-medium bg-[#EEEEEE] text-black ${i === currentPage ? "" : "shadow-custom"} rounded`}
          >
            {i}
          </button>
        );
      }
    }
    return pageNumbers;
  };

  return (
    <AdminDashboardTemplate>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Dealers</h2>
          <Link
            to="/admin/dealers/add"
            className="bg-[#007bff] text-white px-4 py-2 rounded hover:bg-[#0056b3]"
          >
            + Add Dealer
          </Link>
        </div>

        <div className="flex gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            <button type="submit" className="bg-[#007bff] text-white px-4 py-2 rounded">Search</button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <LoadingAnimation />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">Dealer ID</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Code</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.length === 0 ? (
                  <tr><td colSpan="6" className="p-4 text-center text-gray-500">No dealers found</td></tr>
                ) : dealers.map((dealer) => (
                  <tr key={dealer._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border font-mono text-sm">{dealer.dealerId}</td>
                    <td className="p-3 border">{dealer.name}</td>
                    <td className="p-3 border">{dealer.phoneNumber}</td>
                    <td className="p-3 border">{dealer.dealerCode}</td>
                    <td className="p-3 border">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${dealer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {dealer.status}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/dealers/edit/${dealer.dealerId}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(dealer.dealerId, dealer.status)}
                          className={`${dealer.status === "active" ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"}`}
                          title={dealer.status === "active" ? "Deactivate" : "Activate"}
                        >
                          {dealer.status === "active" ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(dealer.dealerId)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <RiDeleteBin5Line size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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