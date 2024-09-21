import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";

const EditCallDetails = () => {
  const { calldetailsId } = useParams(); // Get the ID from the URL
  const [formData, setFormData] = useState({
    callDate: null,
    visitdate: null,
    callNumber: "",
    brandName: "",
    customerName: "",
    address: "",
    route: "",
    contactNumber: "",
    whatsappNumber: "",
    engineer: "",
    productsName: "",
    warrantyTerms: "",
    TAT: "",
    serviceType: "",
    remarks: "",
    parts: "",
    jobStatus: "",
    modelNumber: "",
    iduser: "",
    closerCode: "",
    dateofPurchase: null,
    oduser: "",
    followupdate: null,
    gddate: null,
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [brands, setBrands] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [services, setServices] = useState([]);
  const [jobStatuses, setJobStatuses] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    fetchCallDetail();
  }, [calldetailsId]);

  const fetchDropdownData = async () => {
    try {
      const [
        brandRes,
        engineerRes,
        productRes,
        warrantyRes,
        serviceRes,
        jobStatusRes,
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/brandsadd/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/enginnerdetails/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/productsadd/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/warrantytype/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/servicetype/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/jobstatus/get`),
      ]);

      setBrands(brandRes.data);
      setEngineers(engineerRes.data);
      setProducts(productRes.data);
      setWarranties(warrantyRes.data);
      setServices(serviceRes.data);
      setJobStatuses(jobStatusRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return null;
    }
    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );

    return utcDate;
  };

  const fetchCallDetail = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get/${calldetailsId}`
      );
      const callDetail = response.data.data;

      setFormData({
        callDate: parseDate(callDetail.callDate),
        visitdate: parseDate(callDetail.visitdate),
        callNumber: callDetail.callNumber,
        brandName: callDetail.brandName,
        customerName: callDetail.customerName,
        address: callDetail.address,
        route: callDetail.route,
        contactNumber: callDetail.contactNumber,
        whatsappNumber: callDetail.whatsappNumber,
        engineer: callDetail.engineer,
        productsName: callDetail.productsName,
        warrantyTerms: callDetail.warrantyTerms,
        TAT: callDetail.TAT,
        serviceType: callDetail.serviceType,
        remarks: callDetail.remarks,
        parts: callDetail.parts,
        jobStatus: callDetail.jobStatus,
        modelNumber: callDetail.modelNumber,
        iduser: callDetail.iduser,
        closerCode: callDetail.closerCode,
        dateofPurchase: parseDate(callDetail.dateofPurchase),
        oduser: callDetail.oduser,
        followupdate: parseDate(callDetail.followupdate),
        gddate: parseDate(callDetail.gddate),
        receivefromEngineer: callDetail.receivefromEngineer,
        amountReceived: callDetail.amountReceived,
        commissionow: callDetail.commissionow,
        serviceChange: callDetail.serviceChange,
        commissionDate: parseDate(callDetail.commissionDate),
        NPS: callDetail.NPS,
        incentive: callDetail.incentive,
        expenses: callDetail.expenses,
        approval: callDetail.approval,
        totalAmount: callDetail.totalAmount,
        commissioniw: callDetail.commissioniw,
        partamount: callDetail.partamount,
      });
    } catch (error) {
      console.error("Error fetching call detail:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let formValid = true;

    const contactNumberRegex = /^\d{10}$/;

    // Validate contact number (must be exactly 10 digits)
    if (!contactNumberRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Mobile Number must be exactly 10 digits.";
      formValid = false;
    }

    // Validate WhatsApp number (optional, but if filled, must be exactly 10 digits)
    if (
      formData.whatsappNumber &&
      !contactNumberRegex.test(formData.whatsappNumber)
    ) {
      newErrors.whatsappNumber = "WhatsApp Number must be exactly 10 digits.";
      formValid = false;
    }

    const requiredFields = [
      "callDate",
      "brandName",
      "customerName",
      "contactNumber",
      "productsName",
      "warrantyTerms",
      "serviceType",
      "jobStatus",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/calldetails/update/${calldetailsId}`,
        formData
      );

      if (response.status === 200) {
        navigate(`/admin/dashboard`);
        setMessage("Call Details Updated Successfully");
      } else {
        setMessage("Failed to update call details");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorField = Object.keys(error.response.data.error)[0];
        const errorMessage = error.response.data.error;

        if (errorMessage.includes("contactNumber must be unique")) {
          setErrors((prev) => ({
            ...prev,
            contactNumber: "Mobile number already exists",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            [errorField]: errorMessage,
          }));
        }
      } else {
        console.error("Error creating call details:", error);
      }
    } finally {
      setLoading(false);
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

  useEffect(() => {
    const { receivefromEngineer, commissionow } = formData;

    const calculatedAmountRecived =
      (parseFloat(receivefromEngineer) || 0) - (parseFloat(commissionow) || 0);

    setFormData((prev) => ({
      ...prev,
      amountReceived: calculatedAmountRecived.toFixed(2),
    }));
  }, [formData.receivefromEngineer, formData.commissionow]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber" || name === "whatsappNumber") {
      if (value.length <= 10 && /^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" })); // Reset errors when input is valid
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculateTAT = (callDate) => {
    const today = new Date();
    const dateDifference = Math.ceil(
      (today - callDate) / (1000 * 60 * 60 * 24)
    );
    return dateDifference > 0 ? dateDifference : 1; // Minimum TAT should be 1
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
      // Convert to UTC explicitly
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );

      if (name === "callDate") {
        const TAT = calculateTAT(utcDate);
        setFormData((prev) => ({
          ...prev,
          [name]: utcDate,
          TAT: TAT,
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: utcDate }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <AdminDashboardTemplate>
      <div className="p-6">
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-6 w-full"
        >
          <div className="w-full">
            <label className="form-label">Call Date</label>
            <DatePicker
              selected={formData.callDate}
              onChange={(date) => handleDateChange(date, "callDate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
              isClearable
              maxDate={new Date()}
            />
            {errors.callDate && <p className="form-error">{errors.callDate}</p>}
          </div>

          <div>
            <label className="form-label">Visit Date</label>
            <DatePicker
              selected={formData.visitdate}
              onChange={(date) => handleDateChange(date, "visitdate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </div>

          <div>
            <label className="form-label">Call Number</label>
            <input
              type="text"
              name="callNumber"
              value={formData.callNumber}
              onChange={handleInputChange}
              className="form-input"
            />
            {errors.callNumber && (
              <p className="form-error">{errors.callNumber}</p>
            )}
          </div>

          <div>
            <label className="form-label">Brand Name</label>
            <select
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.brandId} value={brand.brandname}>
                  {brand.brandname}
                </option>
              ))}
            </select>
            {errors.brandName && (
              <p className="form-error">{errors.brandName}</p>
            )}
          </div>

          <div>
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="form-input"
            />
            {errors.customerName && (
              <p className="form-error">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Route</label>
            <input
              type="text"
              name="route"
              value={formData.route}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="form-input"
            />
            {errors.contactNumber && (
              <p className="form-error">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <label className="form-label">WhatsApp Number</label>
            <input
              type="text"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Engineer</label>
            <select
              name="engineer"
              value={formData.engineer}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Engineer</option>
              {engineers.map((engineer) => (
                <option key={engineer.engineerId} value={engineer.engineername}>
                  {engineer.engineername}
                </option>
              ))}
            </select>
            {errors.engineer && <p className="form-error">{errors.engineer}</p>}
          </div>

          <div>
            <label className="form-label">Product Name</label>
            <select
              name="productsName"
              value={formData.productsName}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productname}>
                  {product.productname}
                </option>
              ))}
            </select>
            {errors.productsName && (
              <p className="form-error">{errors.productsName}</p>
            )}
          </div>

          <div>
            <label className="form-label">Warranty Terms</label>
            <select
              name="warrantyTerms"
              value={formData.warrantyTerms}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Warranty</option>
              {warranties.map((warranty) => (
                <option key={warranty.warrantyId} value={warranty.warrantytype}>
                  {warranty.warrantytype}
                </option>
              ))}
            </select>
            {errors.warrantyTerms && (
              <p className="form-error">{errors.warrantyTerms}</p>
            )}
          </div>

          <div>
            <label className="form-label">TAT</label>
            <input
              type="text"
              name="TAT"
              value={formData.TAT}
              onChange={handleInputChange}
              className="form-input"
              readOnly
            />
          </div>

          <div>
            <label className="form-label">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Service Type</option>
              {services.map((service) => (
                <option key={service.serviceId} value={service.servicetype}>
                  {service.servicetype}
                </option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="form-error">{errors.serviceType}</p>
            )}
          </div>

          <div>
            <label className="form-label">Remarks</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Parts</label>
            <input
              type="text"
              name="parts"
              value={formData.parts}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Job Status</label>
            <select
              name="jobStatus"
              value={formData.jobStatus}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Job Status</option>
              {jobStatuses.map((status) => (
                <option key={status.jobstatusId} value={status.jobstatusName}>
                  {status.jobstatusName}
                </option>
              ))}
            </select>
            {errors.jobStatus && (
              <p className="form-error">{errors.jobStatus}</p>
            )}
          </div>

          <div>
            <label className="form-label">Model Number</label>
            <input
              type="text"
              name="modelNumber"
              value={formData.modelNumber}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">IDU Serial No</label>
            <input
              type="text"
              name="iduser"
              value={formData.iduser}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">ODU Serial No</label>
            <input
              type="text"
              name="oduser"
              value={formData.oduser}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Closer Code</label>
            <input
              type="text"
              name="closerCode"
              value={formData.closerCode}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Date of Purchase</label>
            <DatePicker
              selected={formData.dateofPurchase}
              onChange={(date) => handleDateChange(date, "dateofPurchase")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </div>

          <div>
            <label className="form-label">Follow-up Date</label>
            <DatePicker
              selected={formData.followupdate}
              onChange={(date) => handleDateChange(date, "followupdate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </div>

          <div>
            <label className="form-label">GD Date</label>
            <DatePicker
              selected={formData.gddate}
              onChange={(date) => handleDateChange(date, "gddate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
              isClearable
              maxDate={new Date()}
            />
          </div>

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
            {errors.receivefromEngineer && (
              <p className="mt-1 text-red-500">{errors.receivefromEngineer}</p>
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
            {errors.commissionow && (
              <p className="mt-1 text-red-500">{errors.commissionow}</p>
            )}
          </div>

          <div>
            <label className="form-label">Amount Received</label>
            <input
              type="text"
              name="amountReceived"
              value={formData.amountReceived}
              onChange={handleInputChange}
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
            <label className="form-label">Service Charge (Calculate)</label>
            <input
              type="text"
              name="serviceChange"
              value={formData.serviceChange}
              onChange={handleInputChange}
              onKeyUp={(e) => handleKeyUp(e, "serviceChange")}
              onBlur={() => handleBlur("serviceChange")}
              className="form-input"
            />
            {errors.serviceChange && (
              <p className="mt-1 text-red-500">{errors.serviceChange}</p>
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
            {errors.NPS && <p className="mt-1 text-red-500">{errors.NPS}</p>}
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
            {errors.incentive && (
              <p className="mt-1 text-red-500">{errors.incentive}</p>
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
            {errors.approval && (
              <p className="mt-1 text-red-500">{errors.approval}</p>
            )}
          </div>

          <div>
            <label className="form-label">Expenses (Calculate)</label>
            <input
              type="text"
              name="expenses"
              value={formData.expenses}
              onChange={handleInputChange}
              onKeyUp={(e) => handleKeyUp(e, "expenses")}
              onBlur={() => handleBlur("expenses")}
              className="form-input"
            />

            {errors.expenses && (
              <p className="mt-1 text-red-500">{errors.expenses}</p>
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
            {errors.commissioniw && (
              <p className="mt-1 text-red-500">{errors.commissioniw}</p>
            )}
          </div>

          <div>
            <label className="form-label">Total Amount</label>
            <input
              type="text"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className="form-input"
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
          <div className="flex flex-row gap-4 w-full items-center">
            <div className="xlg:!w-[30%] sm:!w-[50%] lg:!w-[40%] mt-4">
              <button
                type="submit"
                className="form-submit !w-full !h-[3.5rem]"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              {message && <p className="mt-4">{message}</p>}
            </div>
            <div className="xlg:!w-[30%] sm:!w-[50%] lg:!w-[40%] mt-4">
              <Link
                to={"/admin/manage-calldetails"}
                className="text-black bg-[#EEEEEE] font-medium flex justify-center items-center px-4 py-2 rounded-md shadow-custom w-full h-[3.5rem]"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AdminDashboardTemplate>
  );
};

export default EditCallDetails;
