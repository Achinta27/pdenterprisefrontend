import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEye, FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import { Link, useNavigate } from "react-router-dom";
import ExcelImport from "../../component/ExcelImport";
import DuplicatePopup from "../../component/DuplicatePopup";
import LoadingAnimation from "../../component/LoadingAnimation";
import ExcelExport from "../../component/ExcelExport";
import { DateRangePicker } from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

const ManageCallDetails = () => {
  const [callDetails, setCallDetails] = useState([]);
  const [cachedPages, setCachedPages] = useState({}); // Cache for pages
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCallDetail, setSelectedCallDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicateNumbers] = useState([]);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [callDetailToDelete, setCallDetailToDelete] = useState(null);
  const [isEngineerFilterActive, setIsEngineerFilterActive] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState(null);
  const [isCommissionFilterActive, setIsCommissionFilterActive] =
    useState(false);

  const navigate = useNavigate();

  const callDetailsPerPage = 50;

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
  const [showDateFilterButtons, setShowDateFilterButtons] = useState(false); // For showing "Show" and "Cancel" buttons
  const [appliedDateRange, setAppliedDateRange] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    fetchCallDetailsData(currentPage);
  }, [
    currentPage,
    selectedBrand,
    selectedJobStatus,
    selectedEngineer,
    selectedWarrantyTerm,
    selectedServiceType,
    mobileNumberFilter,
    isEngineerFilterActive,
    isCommissionFilterActive,
    jobStatusFilter,
    appliedDateRange,
  ]);

  const fetchCallDetailsData = async (page) => {
    setLoading(true);

    const startDate = appliedDateRange
      ? format(appliedDateRange[0].startDate, "yyyy-MM-dd")
      : undefined;
    const endDate = appliedDateRange
      ? format(appliedDateRange[0].endDate, "yyyy-MM-dd")
      : undefined;
    const params = {
      page,
      limit: callDetailsPerPage,
      brand: selectedBrand || undefined,
      jobStatus: jobStatusFilter || selectedJobStatus || undefined,
      engineer: selectedEngineer || undefined,
      warrantyTerms: selectedWarrantyTerm || undefined,
      serviceType: selectedServiceType || undefined,
      mobileNumber: mobileNumberFilter || undefined,
      noEngineer: isEngineerFilterActive ? true : undefined,
      commissionOw: isCommissionFilterActive ? true : undefined,
      notClose: jobStatusFilter === "Not Close" ? true : undefined,
      followup: jobStatusFilter === "FollowUp" ? true : undefined,
      startDate,
      endDate,
    };

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get`,
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

  // const prefetchNextPage = async (nextPage) => {
  //   const cacheKey = `${nextPage}-${selectedBrand}-${selectedJobStatus}-${selectedEngineer}-${selectedWarrantyTerm}-${selectedServiceType}-${mobileNumberFilter}`;

  //   if (!cachedPages[cacheKey]) {
  //     try {
  //       const params = {
  //         page: nextPage,
  //         limit: callDetailsPerPage,
  //         brand: selectedBrand || undefined,
  //         jobStatus: selectedJobStatus || undefined,
  //         engineer: selectedEngineer || undefined,
  //         warrantyTerms: selectedWarrantyTerm || undefined,
  //         serviceType: selectedServiceType || undefined,
  //         mobileNumber: mobileNumberFilter || undefined,
  //         noEngineer: isEngineerFilterActive ? true : undefined,
  //         commissionOw: isCommissionFilterActive ? true : undefined,
  //       };

  //       const response = await axios.get(
  //         `${import.meta.env.VITE_BASE_URL}/api/calldetails/get`,
  //         { params }
  //       );

  //       setCachedPages((prevCache) => ({
  //         ...prevCache,
  //         [cacheKey]: response.data.data,
  //       }));
  //     } catch (error) {
  //       console.error("Error prefetching next page:", error);
  //     }
  //   }
  // };

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

  const handleDateChange = (ranges) => {
    let { startDate, endDate } = ranges.selection;

    if (!endDate || endDate === startDate) {
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    }

    if (endDate < startDate) {
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    }

    setDateRange([
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        key: "selection",
      },
    ]);

    setShowDateFilterButtons(true);
  };

  const handleApplyDateFilter = () => {
    setAppliedDateRange(dateRange);
    setShowDatePicker(false);
    setShowDateFilterButtons(false);
    fetchCallDetailsData(1);
  };

  const handleCancelDateFilter = () => {
    setDateRange([
      {
        startDate: undefined,
        endDate: undefined,
        key: "selection",
      },
    ]);
    setAppliedDateRange(null);
    setShowDateFilterButtons(false);
    fetchCallDetailsData(1);
  };

  const clearDateFilter = () => {
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setAppliedDateRange(null);
    setShowDateFilterButtons(false);
    fetchCallDetailsData(1);
    setShowDatePicker(false);
  };

  const isDateFilterApplied = () => {
    return (
      appliedDateRange !== null &&
      appliedDateRange[0].startDate !== undefined &&
      appliedDateRange[0].endDate !== undefined
    );
  };

  useEffect(() => {
    if (mobileNumberFilter === "") {
      fetchCallDetailsData(1);
    }
  }, [mobileNumberFilter]);

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

  const handleEngineerFilterClick = () => {
    setIsEngineerFilterActive((prevState) => !prevState);
    setCurrentPage(1);
  };

  const handleCommissionFilterClick = () => {
    setIsCommissionFilterActive((prevState) => !prevState);
    setCurrentPage(1);
  };

  const handleFollowUpClick = () => {
    setJobStatusFilter((prevStatus) =>
      prevStatus === "FollowUp" ? null : "FollowUp"
    );
    setCurrentPage(1);
  };

  const handleNotCloseClick = () => {
    setJobStatusFilter((prevStatus) =>
      prevStatus === "Not Close" ? null : "Not Close"
    );
    setCurrentPage(1);
  };

  const handleProceedClick = (calldetailsId) => {
    navigate(`/admin/call-details/part2/${calldetailsId}`);
  };

  const handleViewClick = (callDetail) => {
    setSelectedCallDetail(callDetail);
    setShowModal(true);
  };

  const handleEditClick = (calldetailsId) => {
    navigate(`/admin/calldetails/edit-calldetails/${calldetailsId}`);
  };

  const handleDeleteClick = (callDetail) => {
    setCallDetailToDelete(callDetail);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!callDetailToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/delete/${
          callDetailToDelete.calldetailsId
        }`
      );

      setCallDetails((prevDetails) =>
        prevDetails.filter(
          (detail) => detail.calldetailsId !== callDetailToDelete.calldetailsId
        )
      );
      setShowDeletePopup(false);
      setCallDetailToDelete(null);
    } catch (error) {
      console.error("Error deleting call detail:", error);
    }
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setCallDetailToDelete(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCallDetail(null);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages > 1) {
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
    }

    return pageNumbers;
  };

  const headers = [
    "C. Name",
    "Mobile Number",
    "Location",
    "Call Date",
    "Visit Date",
    "Service Type",
    "Part II",
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

  const handleDuplicateFound = (duplicates) => {
    setDuplicateNumbers(duplicates);
    setShowDuplicatePopup(true);
  };

  const handleImportSuccess = (newBusinesses) => {
    setCallDetails((prevDetails) => [...prevDetails, ...newBusinesses]);
  };

  const handleClosePopup = () => {
    setShowDuplicatePopup(false);
    setDuplicateNumbers([]);
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-4 border-b border-[#cccccc] pb-8">
          <ExcelImport
            onImportSuccess={handleImportSuccess}
            onDuplicateFound={handleDuplicateFound}
          />
          <Link to={`/admin/add-calldetails`} className="form-submit">
            Add Call
          </Link>
          <button
            onClick={handleEngineerFilterClick}
            className={`text-black w-fit font-medium px-4 py-2 rounded-md shadow-custom ${
              isEngineerFilterActive ? "bg-blue-500 text-white" : "bg-[#EEEEEE]"
            }`}
          >
            Engineer Not Assigned
          </button>
          <button
            onClick={handleFollowUpClick}
            className={`text-black w-fit font-medium px-4 py-2 rounded-md shadow-custom ${
              jobStatusFilter === "FollowUp"
                ? "bg-blue-500 text-white"
                : "bg-[#EEEEEE]"
            }`}
          >
            FollowUp
          </button>

          <button
            onClick={handleNotCloseClick}
            className={`text-black w-fit font-medium px-4 py-2 rounded-md shadow-custom ${
              jobStatusFilter === "Not Close"
                ? "bg-blue-500 text-white"
                : "bg-[#EEEEEE]"
            }`}
          >
            Not Close
          </button>

          <button
            onClick={handleCommissionFilterClick}
            className={`text-black w-fit font-medium px-4 py-2 rounded-md shadow-custom ${
              isCommissionFilterActive
                ? "bg-blue-500 text-white"
                : "bg-[#EEEEEE]"
            }`}
          >
            Commission OW
          </button>
          <ExcelExport
            filters={{
              brand: selectedBrand,
              jobStatus: jobStatusFilter || selectedJobStatus,
              engineer: selectedEngineer,
              warrantyTerms: selectedWarrantyTerm,
              serviceType: selectedServiceType,
              mobileNumber: mobileNumberFilter,
              noEngineer: isEngineerFilterActive ? true : undefined,
              commissionOw: isCommissionFilterActive ? true : undefined,
              followup: jobStatusFilter === "FollowUp" ? true : undefined,
              notClose: jobStatusFilter === "Not Close" ? true : undefined,
              startDate: appliedDateRange
                ? format(appliedDateRange[0].startDate, "yyyy-MM-dd")
                : undefined,
              endDate: appliedDateRange
                ? format(appliedDateRange[0].endDate, "yyyy-MM-dd")
                : undefined,
            }}
            fileName="Filtered_Call_Details.xlsx"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center  ">
          <div className="relative">
            <input
              type="text"
              readOnly
              value={`From: ${dateRange[0].startDate.toLocaleDateString()} To: ${dateRange[0].endDate.toLocaleDateString()}`}
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
              onClick={() => setShowDatePicker(!showDatePicker)}
            />

            {showDatePicker && (
              <div className="absolute z-10 top-16 bg-white shadow-lg">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={handleDateChange}
                  rangeColors={["#3b82f6"]}
                />
              </div>
            )}
          </div>
          <div>
            {isDateFilterApplied() ? (
              <button
                onClick={clearDateFilter}
                className="px-4 py-1 bg-red-500 text-white rounded-lg"
              >
                Clear
              </button>
            ) : (
              ""
            )}
          </div>

          {showDateFilterButtons && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleApplyDateFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Show
              </button>
              <button
                onClick={handleCancelDateFilter}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}

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
                    <div className="text-sm font-semibold flex-1">
                      <button
                        onClick={() => handleProceedClick(detail.calldetailsId)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md"
                      >
                        Proceed
                      </button>
                    </div>
                    <div className="flex flex-row flex-1 items-center font-semibold gap-5">
                      <button
                        className="text-[#5BC0DE]"
                        onClick={() => handleViewClick(detail)}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="text-yellow-500"
                        onClick={() => handleEditClick(detail.calldetailsId)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={() => handleDeleteClick(detail)}
                      >
                        <RiDeleteBin5Line />
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

        {showDeletePopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md">
              <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this call detail?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={handleCloseDeletePopup}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        <DuplicatePopup
          isOpen={showDuplicatePopup}
          onClose={handleClosePopup}
          duplicates={duplicates}
        />
      </div>
    </AdminDashboardTemplate>
  );
};

export default ManageCallDetails;
