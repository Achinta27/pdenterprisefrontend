import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEye, FiEdit } from "react-icons/fi";

import { Link, useNavigate, useParams } from "react-router-dom";

import LoadingAnimation from "../../component/LoadingAnimation";
import TeamLeaderDashboardTemplate from "../../templates/TeamLeaderDashboardTemplate";

const TeamleaderDashboard = () => {
  const [callDetails, setCallDetails] = useState([]);
  const [cachedPages, setCachedPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCallDetail, setSelectedCallDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(1);

  const callDetailsPerPage = 50;
  const { teamleaderId } = useParams();

  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    engineers: [],
    warrantyTerms: [],
    serviceTypes: [],
    jobStatuss: [],
  });

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedJobStatus, setSelectedJobStatus] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [selectedWarrantyTerm, setSelectedWarrantyTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [mobileNumberFilter, setMobileNumberFilter] = useState("");

  useEffect(() => {
    if (teamleaderId) {
      fetchCallDetailsData(currentPage);
    }
  }, [
    currentPage,
    selectedBrand,
    selectedJobStatus,
    selectedEngineer,
    selectedWarrantyTerm,
    selectedServiceType,
    mobileNumberFilter,

    teamleaderId,
  ]);

  const fetchCallDetailsData = async (page) => {
    setLoading(true);

    const params = {
      page,
      limit: callDetailsPerPage,
      brand: selectedBrand || undefined,
      jobStatus: selectedJobStatus || undefined,
      engineer: selectedEngineer || undefined,
      warrantyTerms: selectedWarrantyTerm || undefined,
      serviceType: selectedServiceType || undefined,
      mobileNumber: mobileNumberFilter || undefined,
    };

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/calldetails/get?teamleaderId=${teamleaderId}`,
        { params }
      );

      setCallDetails(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching call details:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/filters`
      );
      setFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleViewClick = (callDetail) => {
    setSelectedCallDetail(callDetail);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCallDetail(null);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
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
          className={`px-4 py-1 mx-1 text-lg font-medium bg-[#EEEEEE] text-black ${
            i === currentPage ? "" : " shadow-custom"
          } rounded`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const handleBrandChange = (event) => {
    setSelectedBrand(event.target.value);
    setCurrentPage(1);
    fetchCallDetailsData(1);
  };

  const handleJobStatusChange = (event) => {
    setSelectedJobStatus(event.target.value);
    setCurrentPage(1);
    fetchCallDetailsData(1);
  };

  const handleEngineerChange = (event) => {
    setSelectedEngineer(event.target.value);
    setCurrentPage(1);
    fetchCallDetailsData(1);
  };

  const handleWarrantyTermChange = (event) => {
    setSelectedWarrantyTerm(event.target.value);
    setCurrentPage(1);
    fetchCallDetailsData(1);
  };

  const handleServiceTypeChange = (event) => {
    setSelectedServiceType(event.target.value);
    setCurrentPage(1);
    fetchCallDetailsData(1);
  };

  const handleMobileNumberChange = (event) => {
    const value = event.target.value;
    setMobileNumberFilter(value);

    if (value === "") {
      setCurrentPage(1);
      fetchCallDetailsData(1);
    } else {
      setCurrentPage(1);
    }
  };

  const headers = [
    "C. Name",
    "Mobile Number",
    "Location",
    "Call Date",
    "Visit Date",
    "Service Type",
    "Action",
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Formats date as dd/mm/yyyy
  };

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatValue = (key, value) => {
    if (!value) return "N/A";
    if (key.toLowerCase().includes("date")) {
      return formatDate(value);
    }
    return value;
  };

  const fieldsToDisplay = [
    "customerName",
    "contactNumber",
    "address",
    "callDate",
    "visitdate",
    "callNumber",
    "brandName",
    "route",
    "whatsappNumber",
    "engineer",
    "productsName",
    "warrantyTerms",
    "modelNumber",
    "TAT",
    "parts",
    "jobStatus",
    "iduser",
    "closerCode",
    "dateofPurchase",
    "oduser",
    "followupdate",
    "gddate",
    "receivefromEngineer",
    "serviceType",
    "remarks",
  ];

  return (
    <TeamLeaderDashboardTemplate>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-4">
          <div>
            <input
              type="text"
              placeholder="Search using number"
              value={mobileNumberFilter}
              onChange={handleMobileNumberChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            />
          </div>

          <div>
            <select
              name="status"
              value={selectedJobStatus}
              onChange={handleJobStatusChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Status</option>
              {filterOptions.jobStatuss.map((jobStatus, index) => (
                <option key={index} value={jobStatus}>
                  {jobStatus}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="engineer"
              value={selectedEngineer}
              onChange={handleEngineerChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Engineer</option>
              {/* {filterOptions.engineers.map((engineer, index) => (
                <option key={index} value={engineer}>
                  {engineer}
                </option>
              ))} */}
            </select>
          </div>

          <div>
            <select
              name="brand"
              value={selectedBrand}
              onChange={handleBrandChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Brand</option>
              {filterOptions.brands.map((brand, index) => (
                <option key={index} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="warrantyTerms"
              value={selectedWarrantyTerm}
              onChange={handleWarrantyTermChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Warranty Terms</option>
              {/* {filterOptions.warrantyTerms.map((term, index) => (
                <option key={index} value={term}>
                  {term}
                </option>
              ))} */}
            </select>
          </div>

          <div>
            <select
              name="serviceType"
              value={selectedServiceType}
              onChange={handleServiceTypeChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Service Type</option>
              {filterOptions.serviceTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <Link
            to={`/teamleader/add-calldetails/${teamleaderId}`}
            className="form-submit"
          >
            Add Call
          </Link>
        </div>

        <div className=" sm:w-full">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-row p-4 gap-4 font-medium text-base bg-black text-white w-full border-b">
                {headers.map((header, index) => (
                  <div className="flex-1" key={index}>
                    {header}
                  </div>
                ))}
              </div>
              <div className="flex flex-col h-[50vh] no-scrollbar bg-white overflow-auto">
                {callDetails.map((detail) => (
                  <div
                    className="flex flex-row p-3 border-b border-[#BBBBBB] gap-4 font-medium text-base w-full"
                    key={detail.calldetailsId}
                  >
                    <div className="text-sm font-semibold flex-1">
                      {detail.customerName}
                    </div>
                    <div className="text-sm font-semibold flex-1">
                      {detail.contactNumber}
                    </div>
                    <div className="text-sm font-semibold flex-1">
                      {detail.address}
                    </div>
                    <div className="text-sm font-semibold flex-1">
                      {formatDate(detail.callDate)}
                    </div>
                    <div className="text-sm font-semibold flex-1">
                      {formatDate(detail.visitdate)}
                    </div>
                    <div className="text-sm font-semibold flex-1">
                      {detail.serviceType}
                    </div>

                    <div className="flex flex-row flex-1 items-center font-semibold gap-5">
                      <button
                        className="text-[#5BC0DE]"
                        onClick={() => handleViewClick(detail)}
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
              currentPage === 1 ? "text-[#777777]" : "text-black"
            }`}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {renderPageNumbers()}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`px-3 py-1 mx-1 rounded text-lg font-medium ${
              currentPage === totalPages ? "text-[#777777]" : "text-black"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {/* Modal for viewing details */}
        {showModal && selectedCallDetail && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-2xl h-[80vh] overflow-scroll no-scrollbar">
              <div className="flex justify-end gap-4 ">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg fixed"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
              <h2 className="text-lg font-bold mb-4">
                Call Detail Information
              </h2>
              <div className="flex flex-col gap-2">
                {fieldsToDisplay.map((key) => (
                  <p key={key}>
                    <strong>{formatKey(key)}:</strong>{" "}
                    {formatValue(key, selectedCallDetail[key])}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </TeamLeaderDashboardTemplate>
  );
};

export default TeamleaderDashboard;
