import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TeamLeaderDashboardTemplate from "../../templates/TeamLeaderDashboardTemplate";
import { useNavigate, useParams } from "react-router-dom";

const TeamLeaderCallEntry = () => {
  const { teamleaderId } = useParams();
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
    teamleaderId: teamleaderId,
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
      "brandName",
      "customerName",
      "contactNumber",
      "productsName",
      "warrantyTerms",
      "serviceType",
      "jobStatus",
      "callNumber",
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
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("duplicatedCallDetail");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData((prev) => ({
        ...prev,
        customerName: parsedData.customerName,
        contactNumber: parsedData.contactNumber,
        whatsappNumber: parsedData.whatsappNumber,
        address: parsedData.address,
        route: parsedData.route,
      }));
      localStorage.removeItem("duplicatedCallDetail");
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formDataWithTeamLeader = { ...formData, teamleaderId };
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/create`,
        formDataWithTeamLeader
      );

      if (response.status === 201) {
        setMessage("Call Details Created Successfully");
        navigate(`/teamleader/dashboard/${teamleaderId}`);
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
          teamleaderId: teamleaderId,
        });
        setErrors({});
      } else {
        setMessage("Failed to create call details");
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

  const formRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        formRef.current.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber" || name === "whatsappNumber") {
      if (value.length <= 10 && /^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const calculateTAT = (callDate) => {
    const today = new Date();
    const dateDifference = Math.ceil(
      (today - callDate) / (1000 * 60 * 60 * 24)
    );
    return dateDifference > 0 ? dateDifference : 1;
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
    <TeamLeaderDashboardTemplate>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Call Details</h2>
        <form
          ref={formRef}
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
              maxDate={new Date()}
            />
          </div>

          <div>
            <label className="form-label">Receive from Engineer</label>
            <input
              type="text"
              name="receivefromEngineer"
              value={formData.receivefromEngineer}
              onChange={handleInputChange}
              onKeyUp={(e) => handleKeyUp(e, "receivefromEngineer")}
              onBlur={() => handleBlur("receivefromEngineer")}
              className="form-input"
            />
          </div>

          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="form-submit xlg:!w-[30%] sm:!w-[50%] lg:!w-[40%] !h-[3.5rem]"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            {message && <p className="mt-4">{message}</p>}
          </div>
        </form>
      </div>
    </TeamLeaderDashboardTemplate>
  );
};

export default TeamLeaderCallEntry;
