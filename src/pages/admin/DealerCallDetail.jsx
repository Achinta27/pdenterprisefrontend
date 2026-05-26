import { useState, useEffect, useContext } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import LoadingAnimation from "../../component/LoadingAnimation";
import { AuthContext } from "../../context/AuthContext";

export default function DealerCallDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/dealercall/get/${id}`,
        );
        setCall(response.data);
      } catch (error) {
        console.log(error.response?.data?.message || "Error fetching call");
        alert("Call not found");
        navigate("/admin/dealer-calls");
      } finally {
        setLoading(false);
      }
    };
    fetchCall();
  }, [id]);

  const handleReject = async () => {
    if (!adminRemarks.trim()) {
      alert("Please provide a reason for rejection in remarks.");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/dealercall/reject/${id}`,
        { adminRemarks },
      );
      alert("Call rejected successfully!");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/dealercall/get/${id}`,
      );
      setCall(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting call");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetToPending = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/dealercall/reset-to-pending/${id}`,
        { adminRemarks },
      );
      alert("Call reset to pending successfully!");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/dealercall/get/${id}`,
      );
      setCall(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Error resetting call");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded text-sm font-medium ${styles[status] || ""}`}
      >
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading)
    return (
      <AdminDashboardTemplate>
        <LoadingAnimation />
      </AdminDashboardTemplate>
    );

  const field = (label, value) => (
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );

  return (
    <AdminDashboardTemplate>
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin/dealer-calls"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Dealer Calls
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Call Details — {call.dealerCallId}
          </h2>
          {getStatusBadge(call.status)}
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Dealer Info</h3>
          <div className="grid grid-cols-2 gap-4">
            {field("Dealer ID", call.dealer?.dealerId)}
            {field("Dealer Name", call.dealer?.name)}
            {field("Phone", call.dealer?.phoneNumber)}
            {field("Dealer Code", call.dealer?.dealerCode)}
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 pt-2">
            Customer Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {field("Customer Name", call.customerName)}
            {field("Contact Number", call.contactNumber)}
            {field("Address", call.address)}
            {field("Area", call.area)}
            {field("PIN Code", call.pinCode)}
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 pt-2">
            Service Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {field("Brand", call.brand?.brandname)}
            {field("Product", call.product?.productname)}
            {field(
              "Service Type",
              call.serviceType?.servicetype || call.serviceType || "-",
            )}
            {field("Remarks", call.remarks)}
          </div>

          {call.adminRemarks && (
            <>
              <h3 className="font-semibold text-lg border-b pb-2 pt-2">
                Admin Remarks
              </h3>
              <p className="text-gray-700">{call.adminRemarks}</p>
            </>
          )}
        </div>

        {/* Admin Actions — for pending and approved calls */}
        {(call.status === "pending" || call.status === "approved") && (
          <div className="bg-gray-50 border rounded-lg p-6 mt-4">
            <h3 className="font-semibold mb-4">Admin Action</h3>
            <div className="flex flex-col gap-3">
              <label className="font-medium text-sm text-gray-700">
                Admin Remarks{" "}
                {call.status === "pending"
                  ? "(required for rejection)"
                  : "(optional)"}
              </label>
              <textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add remarks..."
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows={3}
              />
              <div className="flex gap-4 flex-wrap">
                {call.status === "pending" && (
                  <Link
                    to={
                      user?.role === "TeamLeader"
                        ? `/teamleader/add-calldetails/${user.teamleaderId || localStorage.getItem("teamleaderId")}?dealerCallId=${id}`
                        : `/admin/add-calldetails?dealerCallId=${id}`
                    }
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Create Call Details
                  </Link>
                )}
                {call.status === "approved" && (
                  <button
                    onClick={handleResetToPending}
                    disabled={actionLoading}
                    className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Reset to Pending"}
                  </button>
                )}
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardTemplate>
  );
}
