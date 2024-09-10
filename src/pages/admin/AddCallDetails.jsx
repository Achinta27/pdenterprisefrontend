import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";

const AddCallDetails = () => {
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
  }, []);

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

    // Required fields validation
    const requiredFields = [
      "callDate",
      "callNumber",
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
        formValid = false;
      }
    });

    // Set the errors state
    setErrors(newErrors);

    // Return whether the form is valid
    return formValid && Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/create`,
        formData
      );

      if (response.status === 201) {
        setMessage("Call Details Created Successfully");
        setFormData({
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
        });
        setErrors({});
      } else {
        setMessage("Failed to create call details");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        // Assuming the error response provides the field that caused the error
        const errorField = Object.keys(error.response.data.error)[0];
        setErrors((prev) => ({
          ...prev,
          [errorField]: error.response.data.error,
        }));
      } else {
        console.error("Error creating call details:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For contact and WhatsApp numbers, allow only digits and limit to 10 digits
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

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <AdminDashboardTemplate>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Call Details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 w-full">
          <div className="w-full">
            <label className="form-label">Call Date</label>
            <DatePicker
              selected={formData.callDate}
              onChange={(date) => handleDateChange(date, "callDate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
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
              maxLength={10}
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
              maxLength={10}
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
            <label className="form-label">ID User</label>
            <input
              type="text"
              name="iduser"
              value={formData.iduser}
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
            />
          </div>

          <div>
            <label className="form-label">OD User</label>
            <input
              type="text"
              name="oduser"
              value={formData.oduser}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Follow-up Date</label>
            <DatePicker
              selected={formData.followupdate}
              onChange={(date) => handleDateChange(date, "followupdate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="form-label">GD Date</label>
            <DatePicker
              selected={formData.gddate}
              onChange={(date) => handleDateChange(date, "gddate")}
              className="form-input"
              dateFormat="yyyy-MM-dd"
            />
          </div>

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

          <div className="col-span-2 mt-4">
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            {message && <p className="mt-4">{message}</p>}
          </div>
        </form>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddCallDetails;
