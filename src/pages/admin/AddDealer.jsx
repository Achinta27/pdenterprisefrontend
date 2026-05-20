import { useState } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function generateDealerCode(name) {
  const letters = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
  const padded = (letters + "XXX").slice(0, 3);
  const random = Math.floor(Math.random() * 900 + 100).toString();
  return padded + random;
}

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function AddDealer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "name") {
      setForm((prev) => ({ ...prev, dealerCode: generateDealerCode(value) }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setForm((prev) => ({ ...prev, phoneNumber: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrCodeFile(file);
    setQrCodePreview(URL.createObjectURL(file));
  };

  const handleRegenerateDealerCode = () => {
    setForm((prev) => ({ ...prev, dealerCode: generateDealerCode(prev.name) }));
  };

  const handleRegeneratePassword = () => {
    setForm((prev) => ({ ...prev, password: generatePassword() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (form.phoneNumber.length !== 10) {
      setError("Phone number must be 10 digits");
      setLoading(false);
      return;
    }

    if (!form.dealerCode) {
      setError("Dealer code is required");
      setLoading(false);
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) data.append(key, form[key]);
      });
      if (qrCodeFile) data.append("qrCodeImage", qrCodeFile);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/dealer/create`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        setMessage("Dealer created successfully!");
        setTimeout(() => navigate("/admin/dealers"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const readOnlyFields = [
    { label: "Name *", name: "name", type: "text", placeholder: "Dealer full name", onChange: handleChange },
    { label: "Phone Number *", name: "phoneNumber", type: "tel", placeholder: "10-digit mobile", onChange: handlePhoneChange },
    { label: "Dealer Code *", name: "dealerCode", type: "text", placeholder: "Auto-generated from name", readOnly: true },
    { label: "Password *", name: "password", type: "text", placeholder: "Min 6 characters" },
  ];

  const optionalFields = [
    { label: "Aadhar No.", name: "aadharNo", type: "text", placeholder: "Aadhar card number" },
    { label: "PAN Card No.", name: "panCardNo", type: "text", placeholder: "PAN card number" },
    { label: "UPI ID", name: "upiId", type: "text", placeholder: "e.g. name@upi" },
    { label: "Bank A/C Name", name: "bankAccountName", type: "text", placeholder: "Bank account holder name" },
    { label: "IFSC", name: "ifsc", type: "text", placeholder: "IFSC code" },
    { label: "Payee Name", name: "payeeName", type: "text", placeholder: "Payee name for payments" },
    { label: "Remarks", name: "remarks", type: "text", placeholder: "Admin notes" },
  ];

  return (
    <AdminDashboardTemplate>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Add New Dealer</h2>

        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readOnlyFields.map(({ label, name, type, placeholder, onChange }) => (
              <div key={name} className="flex flex-col">
                <label className="mb-1 font-medium text-sm text-gray-700">{label}</label>
                <div className="flex gap-2">
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={onChange || handleChange}
                    placeholder={placeholder}
                    readOnly={name === "dealerCode"}
                    className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${name === "dealerCode" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {name === "dealerCode" && (
                    <button
                      type="button"
                      onClick={handleRegenerateDealerCode}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm shrink-0"
                      title="Regenerate"
                    >
                      &#x21BB;
                    </button>
                  )}
                  {name === "password" && (
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm shrink-0"
                      title="Regenerate"
                    >
                      &#x21BB;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalFields.map(({ label, name, type, placeholder }) => (
              <div key={name} className="flex flex-col">
                <label className="mb-1 font-medium text-sm text-gray-700">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
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
            {loading ? "Creating..." : "Create Dealer"}
          </button>
        </form>
      </div>
    </AdminDashboardTemplate>
  );
}