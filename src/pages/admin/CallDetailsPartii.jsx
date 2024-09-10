import React, { useEffect, useState } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import { useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CallDetailsPartii = () => {
  const { calldetailsId } = useParams();
  const [formData, setFormData] = useState({
    receivefromEngineer: "",
    amountReceived: "",
    commissionow: "",
    serviceChange: "",
    commissionDate: null,
    NPS: "",
    incentive: "",
    expenses: "",
    approval: "",
    totalAmount: "",
    commissioniw: "",
    partamount: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const parseDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    return isNaN(date) ? null : date;
  };

  const sanitizeValue = (value) => {
    return value || ""; // If the value is null/undefined, return an empty string
  };

  const fetchCallDetailData = async (calldetailsId) => {
    try {
      console.log("Fetching call details..."); // Add this log
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get/${calldetailsId}`
      );
      console.log("Response data:", response.data); // Log response

      if (response.data && response.data.data) {
        const callDetail = response.data.data;
        setFormData({
          receivefromEngineer: callDetail.receivefromEngineer || "",
          amountReceived: callDetail.amountReceived || "",
          commissionow: callDetail.commissionow || "",
          serviceChange: callDetail.serviceChange || "",
          commissionDate: parseDate(callDetail.commissionDate),
          NPS: callDetail.NPS || "",
          incentive: callDetail.incentive || "",
          expenses: callDetail.expenses || "",
          approval: callDetail.approval || "",
          totalAmount: callDetail.totalAmount || "",
          commissioniw: callDetail.commissioniw || "",
          partamount: callDetail.partamount || "",
        });
      } else {
        console.error("API response doesn't have data.");
      }
    } catch (error) {
      console.error("Error fetching call detail:", error);
    } finally {
      setLoading(false); // Ensure loading is set to false
    }
  };

  useEffect(() => {
    if (calldetailsId) {
      fetchCallDetailData(calldetailsId);
    }
  }, [calldetailsId]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" })); // Ensure empty values are set as ""
  };

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  useEffect(() => {
    const { serviceChange, incentive, NPS, approval, expenses, commissioniw } =
      formData;

    const calculatedTotalAmount =
      (parseFloat(serviceChange) || 0) +
      (parseFloat(incentive) || 0) +
      (parseFloat(NPS) || 0) +
      (parseFloat(approval) || 0) -
      (parseFloat(expenses) || 0) -
      (parseFloat(commissioniw) || 0);

    setFormData((prev) => ({
      ...prev,
      totalAmount: calculatedTotalAmount.toFixed(2), // Calculate and set totalAmount
    }));
  }, [
    formData.serviceChange,
    formData.incentive,
    formData.NPS,
    formData.approval,
    formData.expenses,
    formData.commissioniw,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/calldetails/part2/${calldetailsId}`,
        formData
      );

      if (response.status === 200) {
        setMessage("Call Details Updated Successfully");
      } else {
        setMessage("Failed to update call details");
      }
    } catch (error) {
      console.error("Error updating call details:", error);
      setMessage("Error: Failed to update call details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="p-6">
        {loading ? (
          <p>Loading...</p> // Show loading state
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-6 w-full"
          >
            <div>
              <label className="form-label">Receive from Engineer</label>
              <input
                type="text"
                name="receivefromEngineer"
                value={formData.receivefromEngineer}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Amount Received</label>
              <input
                type="text"
                name="amountReceived"
                value={formData.amountReceived}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Commission OW</label>
              <input
                type="text"
                name="commissionow"
                value={formData.commissionow} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Service Change</label>
              <input
                type="text"
                name="serviceChange"
                value={formData.serviceChange} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Commission Date</label>
              <DatePicker
                selected={formData.commissionDate} // Display the date if available
                onChange={(date) => handleDateChange(date, "commissionDate")}
                className="form-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div>
              <label className="form-label">NPS</label>
              <input
                type="text"
                name="NPS"
                value={formData.NPS} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Incentive</label>
              <input
                type="text"
                name="incentive"
                value={formData.incentive} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Expenses</label>
              <input
                type="text"
                name="expenses"
                value={formData.expenses} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Approval</label>
              <input
                type="text"
                name="approval"
                value={formData.approval} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Total Amount</label>
              <input
                type="text"
                name="totalAmount"
                value={formData.totalAmount} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
                readOnly
              />
            </div>
            <div>
              <label className="form-label">Commission IW</label>
              <input
                type="text"
                name="commissioniw"
                value={formData.commissioniw} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Part Amount</label>
              <input
                type="text"
                name="partamount"
                value={formData.partamount} // Set value from formData
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="col-span-2 mt-4">
              <button type="submit" className="form-submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
              {message && <p className="mt-4">{message}</p>}
            </div>
          </form>
        )}
      </div>
    </AdminDashboardTemplate>
  );
};

export default CallDetailsPartii;
