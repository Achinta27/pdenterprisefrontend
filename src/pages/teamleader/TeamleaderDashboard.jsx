import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEye, FiEdit } from "react-icons/fi";
import { useDebounce } from "use-debounce";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoadingAnimation from "../../component/LoadingAnimation";
import TeamLeaderDashboardTemplate from "../../templates/TeamLeaderDashboardTemplate";

import { DateRangePicker } from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { GrCopy } from "react-icons/gr";
import { MdFileCopy } from "react-icons/md";
import ExcelExport from "../../component/ExcelExport";
import { FaArrowDown, FaArrowUp, FaChevronDown } from "react-icons/fa";
import { BiSolidDuplicate } from "react-icons/bi";

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
  const [showDateFilterButtons, setShowDateFilterButtons] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  const [isEngineerFilterActive, setIsEngineerFilterActive] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState(null);
  const [isCommissionFilterActive, setIsCommissionFilterActive] =
    useState(false);
  const [followupfilter, setFollowupfilter] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [noEngineerCount, setNoEngineerCount] = useState(0);

  const [debouncedSearchFilter] = useDebounce(searchFilter, 300);
  const [debouncedBrand] = useDebounce(selectedBrand, 300);
  const [debouncedJobStatus] = useDebounce(selectedJobStatus, 300);
  const [debouncedEngineer] = useDebounce(selectedEngineer, 300);
  const [debouncedWarrantyTerm] = useDebounce(selectedWarrantyTerm, 300);
  const [debouncedServiceType] = useDebounce(selectedServiceType, 300);
  const [debouncedDateRange] = useDebounce(appliedDateRange, 300);

  const [gdDateRange, setGdDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [appliedGdDateRange, setAppliedGdDateRange] = useState(null);
  const [debouncedGdDateRange] = useDebounce(appliedGdDateRange, 300);
  const [showGdDatePicker, setShowGdDatePicker] = useState(false);
  const [showGdDateFilterButtons, setShowGdDateFilterButtons] = useState(false);

  const [visitDateRange, setVisitDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [appliedVisitDateRange, setAppliedVisitDateRange] = useState(null);
  const [debouncedVisitDateRange] = useDebounce(appliedVisitDateRange, 300);
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showVisitDateFilterButtons, setShowVisitDateFilterButtons] =
    useState(false);

  const [sortedColumn, setSortedColumn] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    if (teamleaderId) {
      fetchCallDetailsData(currentPage);
    }
  }, [
    currentPage,
    debouncedBrand,
    debouncedJobStatus,
    debouncedEngineer,
    debouncedWarrantyTerm,
    debouncedServiceType,
    debouncedSearchFilter,
    selectedServiceType,
    debouncedDateRange,
    teamleaderId,
    isEngineerFilterActive,
    isCommissionFilterActive,
    jobStatusFilter,
    followupfilter,
    debouncedGdDateRange,
    debouncedVisitDateRange,
  ]);

  let cancelToken;

  const fetchCallDetailsData = async (page) => {
    setLoading(true);

    if (cancelToken) {
      cancelToken.cancel(); // Cancel previous request without logging
    }
    cancelToken = axios.CancelToken.source();

    const startDate = debouncedDateRange
      ? format(debouncedDateRange[0].startDate, "yyyy-MM-dd")
      : undefined;
    const endDate = debouncedDateRange
      ? format(debouncedDateRange[0].endDate, "yyyy-MM-dd")
      : undefined;

    const startGdDate = debouncedGdDateRange
      ? format(debouncedGdDateRange[0].startDate, "yyyy-MM-dd")
      : undefined;
    const endGdDate = debouncedGdDateRange
      ? format(debouncedGdDateRange[0].endDate, "yyyy-MM-dd")
      : undefined;

    const startVisitDate = debouncedVisitDateRange
      ? format(debouncedVisitDateRange[0].startDate, "yyyy-MM-dd")
      : undefined;
    const endVisitDate = debouncedVisitDateRange
      ? format(debouncedVisitDateRange[0].endDate, "yyyy-MM-dd")
      : undefined;

    const params = {
      page,
      limit: callDetailsPerPage,
      brand: debouncedBrand || undefined,
      jobStatus: debouncedJobStatus || undefined,
      engineer: debouncedEngineer || undefined,
      warrantyTerms: debouncedWarrantyTerm || undefined,
      serviceType: debouncedServiceType || undefined,
      number: debouncedSearchFilter || undefined,
      noEngineer: isEngineerFilterActive ? true : undefined,
      commissionOw: isCommissionFilterActive ? true : undefined,
      notClose: jobStatusFilter === "Not Close" ? true : undefined,
      followup: followupfilter === "FollowUp" ? true : undefined,
      startDate,
      endDate,
      startGdDate,
      endGdDate,
      startVisitDate,
      endVisitDate,
    };

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get?sortBy=visitdate`,
        { params, cancelToken: cancelToken.token }
      );

      setCallDetails(response.data.data);
      setTotalPages(response.data.totalPages);
      setNoEngineerCount(response.data.noEngineerCount);
      setOriginalData(response.data.data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error fetching call details:", error); // Log only non-cancelation errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortedColumn === column && isSorted) {
      setIsSorted(false);
      setSortedColumn("");
      setCallDetails(originalData);
      return;
    }

    setSortedColumn(column);
    setIsSorted(true);

    const sortedData = [...callDetails].sort((a, b) => {
      const valueA = (
        a[column] ? a[column].toString().toLowerCase() : ""
      ).replace(/[^a-zA-Z0-9]/g, "");
      const valueB = (
        b[column] ? b[column].toString().toLowerCase() : ""
      ).replace(/[^a-zA-Z0-9]/g, "");

      // Check if the column contains numbers
      if (typeof a[column] === "number" && typeof b[column] === "number") {
        return a[column] - b[column]; // Numeric sorting
      }

      // Default sorting for strings
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });

    setCallDetails(sortedData);
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

  const handleDateChange = (ranges) => {
    let { startDate, endDate } = ranges.selection;

    setDateRange([
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        key: "selection",
      },
    ]);

    setShowDateFilterButtons(true);
  };
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchFilter(value);

    if (value === "") {
      setCurrentPage(1);
      fetchCallDetailsData(1, true);
    } else {
      setCurrentPage(1);
      fetchCallDetailsData(1);
    }
  };

  const handleApplyDateFilter = () => {
    setAppliedDateRange(dateRange);
    setShowDatePicker(false);
    setShowDateFilterButtons(false);
    fetchCallDetailsData(1);
    setCurrentPage(1);
  };

  const handleCancelDateFilter = () => {
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

  // for GD date filter

  const handleGdDateChange = (ranges) => {
    let { startDate, endDate } = ranges.selection;

    setGdDateRange([
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        key: "selection",
      },
    ]);

    setShowGdDateFilterButtons(true);
  };

  const handleApplyGdDateFilter = () => {
    setAppliedGdDateRange(gdDateRange);
    setShowGdDatePicker(false);
    setShowGdDateFilterButtons(false);
    fetchCallDetailsData(1);
    setCurrentPage(1);
  };

  const handleCancelGdDateFilter = () => {
    setGdDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setAppliedGdDateRange(null);
    setShowGdDateFilterButtons(false);

    setShowGdDatePicker(false);
    fetchCallDetailsData(1);
  };

  const clearGdDateFilter = () => {
    setGdDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setAppliedGdDateRange(null);
    setShowGdDateFilterButtons(false);

    setShowGdDatePicker(false);
    fetchCallDetailsData(1);
    setCurrentPage(1);
  };

  const isGDDateFilterApplied = () => {
    return (
      appliedGdDateRange !== null &&
      appliedGdDateRange[0].startDate !== undefined &&
      appliedGdDateRange[0].endDate !== undefined
    );
  };

  // end Gd date filter

  // for Visit Date Filter

  const handleVisitDateChange = (ranges) => {
    let { startDate, endDate } = ranges.selection;

    setVisitDateRange([
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        key: "selection",
      },
    ]);

    setShowVisitDateFilterButtons(true);
  };

  const handleApplyVisitDateFilter = () => {
    setAppliedVisitDateRange(visitDateRange);
    setShowVisitDatePicker(false);
    setShowVisitDateFilterButtons(false);
    fetchCallDetailsData(1);
    setCurrentPage(1);
  };

  const handleCancelVisitDateFilter = () => {
    setVisitDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setAppliedVisitDateRange(null);
    setShowVisitDateFilterButtons(false);

    setShowVisitDatePicker(false);
    fetchCallDetailsData(1);
  };

  const clearVisitDateFilter = () => {
    setVisitDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setAppliedVisitDateRange(null);
    setShowVisitDateFilterButtons(false);

    setShowVisitDatePicker(false);
    fetchCallDetailsData(1);
    setCurrentPage(1);
  };

  const isVisitDateFilterApplied = () => {
    return (
      appliedVisitDateRange !== null &&
      appliedVisitDateRange[0].startDate !== undefined &&
      appliedVisitDateRange[0].endDate !== undefined
    );
  };

  // end visit date filter

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

  const renderArrow = (column) => {
    if (sortedColumn === column && isSorted) {
      return isSorted === "asc" ? <FaArrowDown /> : <FaArrowUp />;
    }
    return <FaArrowDown />;
  };

  const headers = [
    { name: "Visit Date" },
    { name: "Call No" },
    { name: "Brand" },
    { name: "C. Name", column: "customerName" },
    { name: "Mobile No" },
    { name: "Route", column: "route" },
    { name: "Product" },
    { name: "Warranty" },
    { name: "Status" },
    { name: "Engineer", column: "engineer" },
    { name: "Call Type" },
    { name: "Action" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Use UTC methods to get the date parts
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
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
  const navigate = useNavigate();
  const handleEditClick = (calldetailsId) => {
    navigate(`/teamleader/edit-calldetails/${teamleaderId}/${calldetailsId}`);
  };

  const handleDuplicateClick = (callDetail) => {
    localStorage.setItem("duplicatedCallDetail", JSON.stringify(callDetail));
    navigate(`/teamleader/add-calldetails/${teamleaderId}`);
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
    setFollowupfilter((prevStatus) =>
      prevStatus === "FollowUp" ? null : "FollowUp"
    );

    // Filter jobs where followupdate is not null
    const followupfilter = followup.filter(
      (followup) => followup.followupdate !== null
    );
    setFollowupfilter(followupfilter); // update state with filtered jobs

    setCurrentPage(1); // reset to first page if using pagination
  };
  const handleNotCloseClick = () => {
    setJobStatusFilter((prevStatus) =>
      prevStatus === "Not Close" ? null : "Not Close"
    );
    setCurrentPage(1);
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

  const handleCopy = (callDetails) => {
    const calldetailsText = `Customer Name: ${callDetails.customerName}\nContact Number: ${callDetails.contactNumber}\nBrand: ${callDetails.brandName}\nCall Number: ${callDetails.callNumber}\nAddress: ${callDetails.address}\nRoute: ${callDetails.route}
    \nProduct Name: ${callDetails.productsName}\nWarranty Terms:${callDetails.warrantyTerms}\nService Type:${callDetails.serviceType}`;

    navigator.clipboard
      .writeText(calldetailsText)
      .then(() => {
        toast.success("Lead copied to clipboard", {
          position: "bottom-center",
          icon: "✅",
        });
      })
      .catch((error) => {
        console.error("Error copying lead:", error);
      });
  };

  const columns = [
    "callDate",
    "visitdate",
    "callNumber",
    "brandName",
    "customerName",
    "address",
    "route",
    "contactNumber",
    "whatsappNumber",
    "engineer",
    "productsName",
    "warrantyTerms",
    "TAT",
    "serviceType",
    "remarks",
    "parts",
    "jobStatus",
    "modelNumber",
    "iduser",
    "closerCode",
    "dateofPurchase",
    "oduser",
    "followupdate",
    "gddate",
    "receivefromEngineer",
  ];

  return (
    <TeamLeaderDashboardTemplate>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-6">
          <button
            onClick={handleEngineerFilterClick}
            className={`text-black w-fit font-medium bg-[#EEEEEE] text-sm px-4 py-1 rounded-md shadow-custom ${
              isEngineerFilterActive
                ? "bg-blue-500 text-white"
                : noEngineerCount > 0
                ? "animate-blink"
                : ""
            }`}
          >
            Engineer Not Assigned
          </button>
          <button
            onClick={handleFollowUpClick}
            className={`text-black w-fit font-medium text-wm px-4 py-1 rounded-md shadow-custom ${
              followupfilter === "FollowUp"
                ? "bg-blue-500 text-white"
                : "bg-[#EEEEEE]"
            }`}
          >
            FollowUp
          </button>

          <button
            onClick={handleNotCloseClick}
            className={`text-black w-fit font-medium text-sm px-4 py-1 rounded-md shadow-custom ${
              jobStatusFilter === "Not Close"
                ? "bg-blue-500 text-white"
                : "bg-[#EEEEEE]"
            }`}
          >
            Not Close
          </button>

          <button
            onClick={handleCommissionFilterClick}
            className={`text-black w-fit font-medium  text-sm px-4 py-1 rounded-md shadow-custom ${
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

              startGdDate: appliedGdDateRange
                ? format(appliedGdDateRange[0].startDate, "yyyy-MM-dd")
                : undefined,
              endGdDate: appliedGdDateRange
                ? format(appliedGdDateRange[0].endDate, "yyyy-MM-dd")
                : undefined,
              startVisitDate: appliedVisitDateRange
                ? format(appliedVisitDateRange[0].startDate, "yyyy-MM-dd")
                : undefined,
              endVisitDate: appliedVisitDateRange
                ? format(appliedVisitDateRange[0].endDate, "yyyy-MM-dd")
                : undefined,
            }}
            columns={columns}
            fileName="Filtered_Call_Details.xlsx"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 ">
            <h1 className="text-sm font-medium">Call Date:</h1>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={`From: ${dateRange[0].startDate.toLocaleDateString()} To: ${dateRange[0].endDate.toLocaleDateString()}`}
                className="md:px-2 w-fit shadow-custom !outline-none md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
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
                  className="px-4 py-1 bg-red-500 text-sm shadow-custom text-white rounded-lg"
                >
                  Clear
                </button>
              ) : (
                ""
              )}
            </div>

            {showDateFilterButtons && (
              <div className="flex gap-2 text-sm">
                <button
                  onClick={handleApplyDateFilter}
                  className="px-4 py-1 bg-blue-500 shadow-custom text-white rounded-lg"
                >
                  Show
                </button>
                <button
                  onClick={handleCancelDateFilter}
                  className="px-4 py-1 bg-gray-300 shadow-custom text-black rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">GD Date:</h1>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={`From: ${gdDateRange[0].startDate.toLocaleDateString()} To: ${gdDateRange[0].endDate.toLocaleDateString()}`}
                className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
                onClick={() => setShowGdDatePicker(!showGdDatePicker)}
              />

              {showGdDatePicker && (
                <div className="absolute z-10 top-16 bg-white shadow-lg">
                  <DateRangePicker
                    ranges={gdDateRange}
                    onChange={handleGdDateChange}
                    rangeColors={["#3b82f6"]}
                  />
                </div>
              )}
            </div>

            <div>
              {isGDDateFilterApplied() ? (
                <button
                  onClick={clearGdDateFilter}
                  className="px-4 py-1 text-sm shadow-custom bg-red-500 text-white rounded-lg"
                >
                  Clear
                </button>
              ) : (
                ""
              )}
            </div>

            {showGdDateFilterButtons && (
              <div className="flex gap-2 text-sm">
                <button
                  onClick={handleApplyGdDateFilter}
                  className="px-4 py-1 shadow-custom bg-blue-500 text-white rounded-lg"
                >
                  Show
                </button>
                <button
                  onClick={handleCancelGdDateFilter}
                  className="px-4 py-1 shadow-custom bg-gray-300 text-black rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">Visit Date:</h1>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={`From: ${visitDateRange[0].startDate.toLocaleDateString()} To: ${visitDateRange[0].endDate.toLocaleDateString()}`}
                className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
                onClick={() => setShowVisitDatePicker(!showVisitDatePicker)}
              />

              {showVisitDatePicker && (
                <div className="absolute z-10 top-16 bg-white shadow-lg">
                  <DateRangePicker
                    ranges={visitDateRange}
                    onChange={handleVisitDateChange}
                    rangeColors={["#3b82f6"]}
                  />
                </div>
              )}
            </div>

            <div>
              {isVisitDateFilterApplied() ? (
                <button
                  onClick={clearVisitDateFilter}
                  className="px-4 py-1 text-sm shadow-custom bg-red-500 text-white rounded-lg"
                >
                  Clear
                </button>
              ) : (
                ""
              )}
            </div>

            {showVisitDateFilterButtons && (
              <div className="flex gap-2 text-sm">
                <button
                  onClick={handleApplyVisitDateFilter}
                  className="px-4 py-1 shadow-custom bg-blue-500 text-white rounded-lg"
                >
                  Show
                </button>
                <button
                  onClick={handleCancelVisitDateFilter}
                  className="px-4 py-1 shadow-custom bg-gray-300 text-black rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search using number"
              value={searchFilter}
              onChange={handleSearchChange}
              className="px-4 p-1 border !shadow-custom border-[#cccccc] text-sm rounded-md"
            />
          </div>

          <div>
            <select
              name="status"
              value={selectedJobStatus}
              onChange={handleJobStatusChange}
              className="px-4 p-1 border shadow-custom !outline-none border-[#cccccc] text-sm rounded-md"
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
              className="px-4 p-1 border shadow-custom !outline-none border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Engineer</option>
              {filterOptions.engineers.map((engineer, index) => (
                <option key={index} value={engineer}>
                  {engineer}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="brand"
              value={selectedBrand}
              onChange={handleBrandChange}
              className="px-4 p-1 border shadow-custom !outline-none border-[#cccccc] text-sm rounded-md"
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
              className="px-4 p-1 border shadow-custom !outline-none border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Warranty Terms</option>
              {filterOptions.warrantyTerms.map((term, index) => (
                <option key={index} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="serviceType"
              value={selectedServiceType}
              onChange={handleServiceTypeChange}
              className="px-4 p-1 border shadow-custom !outline-none border-[#cccccc] text-sm rounded-md"
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
            className="text-black w-fit bg-[#EEEEEE] font-medium px-4 py-1 text-sm rounded-md shadow-custom"
          >
            Add Call
          </Link>
        </div>

        <div className=" sm:w-full">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="flex flex-col ">
              <div className="flex flex-row p-4 gap-4 font-medium xxl:text-base text-sm bg-black text-white w-full border-b">
                {headers.map((header, index) => (
                  <div
                    key={index}
                    className="flex-1 flex items-center gap-3 cursor-pointer"
                    onClick={() => header.column && handleSort(header.column)} // Only apply sorting to columns with a 'column' key
                  >
                    {header.name}
                    {header.column && (
                      <button className="text-center">
                        {renderArrow(header.column)}
                      </button>
                    )}{" "}
                    {/* Only show arrow for sortable columns */}
                  </div>
                ))}
              </div>
              <div className="flex flex-col h-[60vh] no-scrollbar bg-white overflow-auto">
                {callDetails.map((detail) => (
                  <div
                    className="flex flex-row px-2 py-4 border-b border-[#BBBBBB] group hover:bg-sky-500 hover:text-white transition-colors duration-300 gap-4 font-medium text-[13px] xl:text-xs xxl:text-base w-full"
                    key={detail.calldetailsId}
                  >
                    <div className="flex-1 break-words">
                      {formatDate(detail.visitdate)}
                    </div>
                    <div className="flex-1 break-words">
                      {detail.callNumber}
                    </div>
                    <div className="flex-1 break-words">{detail.brandName}</div>
                    <div className="flex-1 break-all">
                      {detail.customerName}
                    </div>
                    <div className="flex-1 break-words">
                      {detail.contactNumber}
                    </div>
                    <div className="flex-1 break-all">{detail.route}</div>
                    <div className="flex-1 break-all">
                      {detail.productsName}
                    </div>
                    <div className="flex-1 break-words">
                      {detail.warrantyTerms}
                    </div>
                    <div className="flex-1 break-all">{detail.jobStatus}</div>
                    <div className="flex-1 break-all">
                      {detail.engineer || "Not Assign"}
                    </div>
                    <div className="font-semibold flex-1 break-all">
                      {detail.serviceType}
                    </div>
                    <div className="flex flex-row flex-1 items-center text-base font-semibold gap-5">
                      <button
                        className="text-[#5BC0DE] group-hover:text-green-300"
                        onClick={() => handleViewClick(detail)}
                        title="View"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleDuplicateClick(detail)}
                        className=" text-pink-600 relative group group-hover:text-purple-300"
                        title="Duplicate"
                      >
                        <BiSolidDuplicate />
                      </button>
                      <button
                        className="text-yellow-500 group-hover:text-yellow-300"
                        onClick={() => handleEditClick(detail.calldetailsId)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <div
                        onClick={() => handleCopy(detail)}
                        className="cursor-pointer text-[#c33434] group-hover:text-red-200"
                        title="Copy"
                      >
                        <MdFileCopy />
                      </div>
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
      <ToastContainer />
    </TeamLeaderDashboardTemplate>
  );
};

export default TeamleaderDashboard;
