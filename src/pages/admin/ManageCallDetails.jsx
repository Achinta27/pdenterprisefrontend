import React, { useState, useEffect, useMemo } from "react";
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
import { useDebounce } from "use-debounce";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { BiSolidDuplicate } from "react-icons/bi";

const ManageCallDetails = () => {
  const [callDetails, setCallDetails] = useState([]);
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
  const [amountMissmatchedFilterActive, setAmountMissmatchedFilterActive] =
    useState(false);
  const [followupfilter, setFollowupfilter] = useState([]);
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
  const [showDateFilterButtons, setShowDateFilterButtons] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [users, setUsers] = useState([]);
  const [selectedTeamleader, setSelectedTeamleader] = useState("");
  const [noEngineerCount, setNoEngineerCount] = useState(0);
  const [amountMissmatchedCount, setAmountMissmatchedCount] = useState(0);

  const [debouncedSearchFilter] = useDebounce(searchFilter, 300);
  const [debouncedBrand] = useDebounce(selectedBrand, 300);
  const [debouncedJobStatus] = useDebounce(selectedJobStatus, 300);
  const [debouncedEngineer] = useDebounce(selectedEngineer, 300);
  const [debouncedTeamleader] = useDebounce(selectedTeamleader, 300);
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

  useEffect(() => {
    fetchCallDetailsData(currentPage);
  }, [
    currentPage,
    debouncedBrand,
    debouncedJobStatus,
    debouncedEngineer,
    debouncedWarrantyTerm,
    debouncedServiceType,
    debouncedSearchFilter,
    isEngineerFilterActive,
    isCommissionFilterActive,
    amountMissmatchedFilterActive,
    jobStatusFilter,
    followupfilter,
    debouncedDateRange,
    debouncedTeamleader,
    debouncedGdDateRange,
    debouncedVisitDateRange,
  ]);

  let cancelToken;

  const fetchCallDetailsData = async (page) => {
    setLoading(true);

    if (cancelToken) {
      cancelToken.cancel();
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
      amountmissmatched: amountMissmatchedFilterActive ? true : undefined,
      notClose: jobStatusFilter === "Not Close" ? true : undefined,
      followup: followupfilter === "FollowUp" ? true : undefined,
      teamleaderId: debouncedTeamleader || undefined,

      startDate,
      endDate,
      startGdDate,
      endGdDate,
      startVisitDate,
      endVisitDate,
    };

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get?sortBy=gddate`,
        { params, cancelToken: cancelToken.token }
      );

      setCallDetails(response.data.data);
      setTotalPages(response.data.totalPages);
      setNoEngineerCount(response.data.noEngineerCount);
      setAmountMissmatchedCount(response.data.amountMissMatchedCount);
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const teamLeaderResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/teamleader`
      );
      setUsers(teamLeaderResponse.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
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

  const handleTeamleaderChange = (event) => {
    setSelectedTeamleader(event.target.value); // Update the selected team leader ID
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
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  const isDateFilterApplied = () => {
    return (
      appliedDateRange !== null &&
      appliedDateRange[0].startDate !== undefined &&
      appliedDateRange[0].endDate !== undefined
    );
  };


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

  useEffect(() => {
    if (mobileNumberFilter === "") {
      fetchCallDetailsData(1);
    }
  }, [mobileNumberFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const hasCallRequest = useMemo(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/callrequests?call_status=Pending`
      );

      if (response.data.totalCallRequests > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error fetching call requests:", error);
      return false;
    }
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

  const handleAmountMissmatchedFilterClick = () => {
    setAmountMissmatchedFilterActive((prevState) => !prevState);
    setCurrentPage(1);
    fetchCallDetailsData(1);
  };

  const handleFollowUpClick = () => {
    setFollowupfilter((prevStatus) =>
      prevStatus === "FollowUp" ? null : "FollowUp"
    );

    const followupfilter = followup.filter(
      (followup) => followup.followupdate !== null
    );
    setFollowupfilter(followupfilter);

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

  const handleDuplicateClick = (callDetail) => {
    localStorage.setItem("duplicatedCallDetail", JSON.stringify(callDetail));
    navigate(`/admin/add-calldetails`);
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

  const renderArrow = (column) => {
    if (sortedColumn === column && isSorted) {
      return isSorted === "asc" ? <FaArrowDown /> : <FaArrowUp />;
    }
    return <FaArrowDown />;
  };

  const headers = [
    { name: "C. Name", column: "customerName" },
    { name: "Mobile Number" },
    { name: "Call No" },
    { name: "Brand", column: "brandName" },
    { name: "GD Date" },
    { name: "FollowUp Date" },
    { name: "Part II" },
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
    if (key.toLowerCase().includes("engineer")) {
      return value.engineername;
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

    "serviceType",
    "remarks",
    "receivefromEngineer",
    "amountReceived",
    "commissionow",
    "serviceChange",
    "commissionDate",
    "NPS",
    "incentive",
    "expenses",
    "approval",
    "totalAmount",
    "commissioniw",
    "partamount",
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
    "amountReceived",
    "commissionow",
    "serviceChange",
    "commissionDate",
    "NPS",
    "incentive",
    "expenses",
    "approval",
    "totalAmount",
    "commissioniw",
    "partamount",
  ];

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 border-b border-[#cccccc] pb-4">
          <ExcelImport
            onImportSuccess={handleImportSuccess}
            onDuplicateFound={handleDuplicateFound}
          />
          <Link
            to={`/admin/add-calldetails`}
            className="text-black w-fit bg-[#EEEEEE] flex justify-center items-center text-sm font-medium px-4 py-1 rounded-md shadow-custom"
          >
            Add Call
          </Link>
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
              mobileNumber: mobileNumberFilter,
              noEngineer: isEngineerFilterActive ? true : undefined,
              commissionOw: isCommissionFilterActive ? true : undefined,
              followup: jobStatusFilter === "FollowUp" ? true : undefined,
              notClose: jobStatusFilter === "Not Close" ? true : undefined,
              amountmissmatched: amountMissmatchedFilterActive
                ? true
                : undefined,
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
          <button
            onClick={handleAmountMissmatchedFilterClick}
            className={`text-black w-fit font-medium bg-[#EEEEEE] text-sm px-4 py-1 rounded-md shadow-custom ${
              amountMissmatchedFilterActive
                ? "bg-blue-500 text-white"
                : amountMissmatchedCount > 0
                ? "animate-blink "
                : ""
            }`}
          >
            Amount Missmatched
          </button>
          <Link
            to={`/admin/call-requests`}
            className={`text-black w-fit bg-[#EEEEEE] flex justify-center items-center text-sm font-medium px-4 py-1 rounded-md shadow-custom ${
              hasCallRequest ? "animate-blink" : ""
            }`}
          >
            Customer Call Request
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 items-center  ">
          <div className="flex items-center gap-2 ">
            <h1 className="text-sm font-medium">Call Date:</h1>
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
                  className="px-4 py-1 text-sm shadow-custom bg-red-500 text-white rounded-lg"
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
                  className="px-4 py-1 shadow-custom bg-blue-500 text-white rounded-lg"
                >
                  Show
                </button>
                <button
                  onClick={handleCancelDateFilter}
                  className="px-4 py-1 shadow-custom bg-gray-300 text-black rounded-lg"
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
              {filterOptions.engineers.map((engineer, index) => (
                <option key={index} value={engineer._id}>
                  {engineer.engineername}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="teamleader"
              value={selectedTeamleader}
              onChange={handleTeamleaderChange}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Teamleader</option>
              {users.map((user, index) => (
                <option key={index} value={user.teamleaderId}>
                  {user.teamleadername}
                </option>
              ))}
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
            <div className="flex flex-col">
              <div className="flex flex-row px-2 py-4 gap-4 font-medium sm:text-sm xlg:text-base bg-black text-white w-full border-b">
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
                    className="flex flex-row px-2 py-4 border-b border-[#BBBBBB] group hover:bg-sky-500 hover:text-white transition-colors duration-300 gap-4 font-medium text-base w-full"
                    key={detail.calldetailsId}
                  >
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.customerName}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.contactNumber}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.callNumber}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.brandName}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {formatDate(detail.gddate)}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {formatDate(detail.followupdate)}
                    </div>

                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 ">
                      <button
                        onClick={() => handleProceedClick(detail.calldetailsId)}
                        className="bg-blue-500 hover:bg-green-500 text-white px-3 py-1 rounded-sm"
                      >
                        Proceed
                      </button>
                    </div>
                    <div className="flex flex-row flex-1 items-center font-semibold gap-5 text-xl">
                      <button
                        className="text-[#5BC0DE] group-hover:text-green-300"
                        onClick={() => handleViewClick(detail)}
                        title="View"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleDuplicateClick(detail)}
                        className=" text-pink-600 group-hover:text-purple-300"
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
                      <button
                        className="text-[#D53F3A] group-hover:text-red-200"
                        onClick={() => handleDeleteClick(detail)}
                        title="Delete"
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
