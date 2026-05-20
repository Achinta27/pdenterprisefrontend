import { useState, useEffect } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditDealer() {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [qrCodeFile, setQrCodeFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    dealerCode: "",
    password: "",
    aadharNo: "",
    panCardNo: "",
    upiId: "",
    bankAccountName: "",
    ifsc: "",
    payeeName: "",
    remarks: "",
    status: "active",
  });

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/dealer/get/${dealerId}`
        );
        const d = response.data;
        setForm({
          name: d.name || "",
          phoneNumber: d.phoneNumber || "",
          dealerCode: d.dealerCode || "",
          password: "",
          aadharNo: d.aadharNo || "",
          panCardNo: d.panCardNo || "",
          upiId: d.upiId || "",
          bankAccountName: d.bankAccountName || "",
          ifsc: d.ifsc || "",
          payeeName: d.payeeName || "",
          remarks: d.remarks || "",
          status: d.status || "active",
        });
        if (d.qrCodeImage) setQrCodePreview(d.qrCodeImage);
      } catch (err) {
        alert("Dealer not found");
        navigate("/admin/dealers");
      } finally {
        setFetching(false);
      }
    };
    fetchDealer();
  }, [dealerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setForm((prev) => ({ ...prev, phoneNumber: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrCodeFile(file);
    setQrCodePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "password" && !form[key]) return; // don't send empty password
        if (form[key]) data.append(key, form[key]);
      });
      if (qrCodeFile) data.append("qrCodeImage", qrCodeFile);

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/dealer/update/${dealerId}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        setMessage("Dealer updated successfully!");
        setTimeout(() => navigate("/admin/dealers"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Name *", name: "name", type: "text" },
    { label: "Phone Number *", name: "phoneNumber", type: "tel" },
    { label: "Dealer Code *", name: "dealerCode", type: "text" },
    { label: "New Password", name: "password", type: "password", note: "(leave blank to keep current)" },
    { label: "Aadhar No.", name: "aadharNo", type: "text" },
    { label: "PAN Card No.", name: "panCardNo", type: "text" },
    { label: "UPI ID", name: "upiId", type: "text" },
    { label: "Bank A/C Name", name: "bankAccountName", type: "text" },
    { label: "IFSC", name: "ifsc", type: "text" },
    { label: "Payee Name", name: "payeeName", type: "text" },
    { label: "Remarks", name: "remarks", type: "text" },
  ];

  return (
    <AdminDashboardTemplate>
      {fetching ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Edit Dealer</h2>

          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ label, name, type, note }) => (
                <div key={name} className="flex flex-col">
                  <label className="mb-1 font-medium text-sm text-gray-700">
                    {label} {note && <span className="text-gray-400 text-xs">({note})</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={name === "phoneNumber" ? handlePhoneChange : handleChange}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium text-sm text-gray-700">Upload QR Code (S3)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="border border-gray-300 rounded px-3 py-2" />
              {qrCodePreview && (
                <img src={qrCodePreview} alt="QR Preview" className="mt-2 h-24 w-24 object-contain border" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#007bff] text-white px-6 py-2 rounded hover:bg-[#0056b3] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Dealer"}
            </button>
          </form>
        </div>
      )}
    </AdminDashboardTemplate>
  );
}