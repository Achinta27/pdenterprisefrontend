import React, { useEffect, useState } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CallDetailsPartii = () => {
  const { calldetailsId } = useParams();
  const [formData, setFormData] = useState({
    receivefromEngineer: null,
    amountReceived: "",
    commissionow: null,
    serviceChange: null,
    commissionDate: null,
    NPS: null,
    incentive: null,
    expenses: null,
    approval: null,
    totalAmount: "",
    commissioniw: null,
    partamount: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date) ? null : date;
  };

  const fetchCallDetailData = async (calldetailsId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get/${calldetailsId}`
      );

      if (response.data && response.data.data) {
        const callDetail = response.data.data;
        setFormData({
          receivefromEngineer: callDetail.receivefromEngineer || "",
          amountReceived: callDetail.amountReceived || "",
          commissionow: callDetail.commissionow || "",
          serviceChange: callDetail.serviceChange || "",
          commissionDate: callDetail.commissionDate
            ? parseDate(callDetail.commissionDate)
            : null,
          NPS: callDetail.NPS || "",
          incentive: callDetail.incentive || "",
          expenses: callDetail.expenses || "",
          approval: callDetail.approval || "",
          totalAmount: callDetail.totalAmount || "",
          commissioniw: callDetail.commissioniw || "",
          partamount: callDetail.partamount || "",
        });
      }
    } catch (error) {
      console.error("Error fetching call detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (calldetailsId) {
      fetchCallDetailData(calldetailsId);
    }
  }, [calldetailsId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim() === "" ? null : value,
    }));
  };

  const evaluateExpression = (expression) => {
    try {
      const percentageRegex = /(\d+)(\s?[%])/g;
      let expressionWithPercent = expression.replace(
        percentageRegex,
        (match, p1) => {
          const prevNumberMatch = expression
            .slice(0, expression.indexOf(match))
            .match(/(\d+)(?=\D*$)/);
          if (prevNumberMatch) {
            const prevNumber = prevNumberMatch[0];
            return `(${prevNumber} * ${p1} / 100)`;
          }
          return match;
        }
      );

      const sanitizedExpression = expressionWithPercent.replace(
        /[^-()\d/*+.]/g,
        ""
      );
      const result = new Function(`return ${sanitizedExpression}`)();
      return result;
    } catch (error) {
      setMessage("Invalid expression");
      return expression;
    }
  };

  const handleKeyUp = (e, field) => {
    if (e.key === "=") {
      const expression = formData[field];
      const result = evaluateExpression(expression);
      setFormData((prev) => ({
        ...prev,
        [field]: result,
      }));
    }
  };

  const handleBlur = (field) => {
    const expression = formData[field];
    const result = evaluateExpression(expression);
    setFormData((prev) => ({
      ...prev,
      [field]: result,
    }));
  };

  const handleDateChange = (date, name) => {
    if (date) {
      // Convert the selected date to UTC to prevent timezone-related shifts
      const utcDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        )
      );

      setFormData((prev) => ({ ...prev, [name]: utcDate }));
    } else {
      // Explicitly set the date field to null when cleared
      setFormData((prev) => ({ ...prev, [name]: null }));
    }
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
      totalAmount: calculatedTotalAmount.toFixed(2),
    }));
  }, [
    formData.serviceChange,
    formData.incentive,
    formData.NPS,
    formData.approval,
    formData.expenses,
    formData.commissioniw,
  ]);

  useEffect(() => {
    const { receivefromEngineer, commissionow } = formData;

    const calculatedAmountRecived =
      (parseFloat(receivefromEngineer) || 0) - (parseFloat(commissionow) || 0);

    setFormData((prev) => ({
      ...prev,
      amountReceived: calculatedAmountRecived.toFixed(2),
    }));
  }, [formData.receivefromEngineer, formData.commissionow]);

  const validateForm = () => {
    const errors = {};
    const requiredFields = [];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/calldetails/part2/${calldetailsId}`,
        formData
      );

      if (response.status === 200) {
        navigate(`/admin/dashboard`);
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
          <p>Loading...</p>
        ) : (
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-6 w-full"
          >
            <div>
              <label className="form-label">
                Receive from Engineer (Calculate)
              </label>
              <input
                type="text"
                name="receivefromEngineer"
                value={formData.receivefromEngineer}
                onChange={handleInputChange}
                onKeyUp={(e) => handleKeyUp(e, "receivefromEngineer")}
                onBlur={() => handleBlur("receivefromEngineer")}
                className="form-input"
              />
              {formErrors.receivefromEngineer && (
                <p className="mt-1 text-red-500">
                  {formErrors.receivefromEngineer}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Commission OW (Calculate)</label>
              <input
                type="text"
                name="commissionow"
                value={formData.commissionow}
                onChange={handleInputChange}
                onKeyUp={(e) => handleKeyUp(e, "commissionow")}
                onBlur={() => handleBlur("commissionow")}
                className="form-input"
              />
              {formErrors.commissionow && (
                <p className="mt-1 text-red-500">{formErrors.commissionow}</p>
              )}
            </div>

            <div>
              <label className="form-label">Amount Received</label>
              <input
                type="text"
                name="amountReceived"
                value={formData.amountReceived}
                className="form-input"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Commission Date</label>
              <DatePicker
                selected={formData.commissionDate}
                onChange={(date) => handleDateChange(date, "commissionDate")}
                className="form-input"
                dateFormat="yyyy-MM-dd"
                isClearable
              />
            </div>

            <div>
              <label className="form-label">Service Charges (Calculate)</label>
              <input
                type="text"
                name="serviceChange"
                value={formData.serviceChange}
                onChange={handleInputChange}
                onKeyUp={(e) => handleKeyUp(e, "serviceChange")}
                onBlur={() => handleBlur("serviceChange")}
                className="form-input"
              />
              {formErrors.serviceChange && (
                <p className="mt-1 text-red-500">{formErrors.serviceChange}</p>
              )}
            </div>

            <div>
              <label className="form-label">NPS</label>
              <input
                type="text"
                name="NPS"
                value={formData.NPS}
                onChange={handleInputChange}
                className="form-input"
              />
              {formErrors.NPS && (
                <p className="mt-1 text-red-500">{formErrors.NPS}</p>
              )}
            </div>

            <div>
              <label className="form-label">Incentive (Calculate)</label>
              <input
                type="text"
                name="incentive"
                value={formData.incentive}
                onChange={handleInputChange}
                onKeyUp={(e) => handleKeyUp(e, "incentive")}
                onBlur={() => handleBlur("incentive")}
                className="form-input"
              />
              {formErrors.incentive && (
                <p className="mt-1 text-red-500">{formErrors.incentive}</p>
              )}
            </div>

            <div>
              <label className="form-label">Approval</label>
              <input
                type="text"
                name="approval"
                value={formData.approval}
                onChange={handleInputChange}
                className="form-input"
              />
              {formErrors.approval && (
                <p className="mt-1 text-red-500">{formErrors.approval}</p>
              )}
            </div>

            <div>
              <label className="form-label">Advance</label>
              <input
                type="text"
                name="expenses"
                value={formData.expenses}
                onChange={handleInputChange}
                onKeyUp={(e) => handleKeyUp(e, "expenses")}
                onBlur={() => handleBlur("expenses")}
                className="form-input"
              />
              {formErrors.expenses && (
                <p className="mt-1 text-red-500">{formErrors.expenses}</p>
              )}
            </div>

            <div>
              <label className="form-label">Commission IW (Calculate)</label>
              <input
                type="text"
                name="commissioniw"
                value={formData.commissioniw}
                onChange={handleInputChange}
                onKeyUp={(e) => handleKeyUp(e, "commissioniw")}
                onBlur={() => handleBlur("commissioniw")}
                className="form-input"
              />
              {formErrors.commissioniw && (
                <p className="mt-1 text-red-500">{formErrors.commissioniw}</p>
              )}
            </div>

            <div>
              <label className="form-label">Total Amount</label>
              <input
                type="text"
                name="totalAmount"
                value={formData.totalAmount}
                className="form-input"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Part Amount</label>
              <input
                type="text"
                name="partamount"
                value={formData.partamount}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                type="submit"
                className="form-submit xlg:!w-[30%] sm:!w-[50%] lg:!w-[40%] !h-[3.5rem]"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              {message && <p className="mt-4">{message}</p>}

              <div className="xlg:!w-[30%] sm:!w-[50%] lg:!w-[40%] ">
                <Link
                  to={"/admin/manage-calldetails"}
                  className="text-black bg-[#EEEEEE] font-medium flex justify-center items-center px-4 py-2 rounded-md shadow-custom w-full h-[3.5rem]"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminDashboardTemplate>
  );
};

export default CallDetailsPartii;
