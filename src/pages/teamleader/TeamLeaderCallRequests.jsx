import { useCallback, useState } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import LoadingAnimation from "../../component/LoadingAnimation";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { TiCancel } from "react-icons/ti";
import TeamLeaderDashboardTemplate from "../../templates/TeamLeaderDashboardTemplate";

export default function TeamLeaderCallRequests() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState("Pending");
  const [showDateFilterButtons, setShowDateFilterButtons] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [filterOptions, setFilterOptions] = useState({ serviceTypes: [] });
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [callRequests, setCallRequests] = useState([]);
  const { teamleaderId } = useParams();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/callrequests/filter/get`
        );
        setFilterOptions({
          serviceTypes: response.data.call_request_services,
        });
      } catch (error) {
        console.log("Error fetching Request filters:", error);
      }
    };

    fetchFilters();
  }, []);

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
    setCurrentPage(1);
    setShowDateFilterButtons(false);
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
    setShowDatePicker(false);
  };

  const isDateFilterApplied = () => {
    return (
      appliedDateRange !== null &&
      appliedDateRange[0].startDate !== undefined &&
      appliedDateRange[0].endDate !== undefined
    );
  };

  const fetchCallRequests = useCallback(async () => {
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL
      }/api/callrequests/?call_status=${selectedRequestStatus}&call_service=${selectedServiceType}&page=${currentPage}&start_date=${
        appliedDateRange
          ? appliedDateRange[0].startDate.toLocaleDateString()
          : ""
      }&end_date=${
        appliedDateRange ? appliedDateRange[0].endDate.toLocaleDateString() : ""
      }`
    );

    setCallRequests(response.data.callRequests);
    setTotalPages(response.data.totalPages);
  }, [
    selectedRequestStatus,
    selectedServiceType,
    appliedDateRange,
    currentPage,
  ]);

  const handleDeleteClick = async (id) => {
    const conformation = confirm("Are you sure you want to delete?");
    if (!conformation) {
      return;
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/callrequests/${id}`
      );

      if (response.status === 200) {
        alert("Call Request deleted successfully");
        fetchCallRequests();
      }
    } catch (error) {
      console.error("Error deleting Call Request:", error);
      alert("Error deleting Call Request");
    }
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
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  useEffect(() => {
    fetchCallRequests();
  }, [fetchCallRequests]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages >= 1) {
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
    { name: "Customer Name" },
    { name: "Mobile Number" },
    { name: "Area" },
    { name: "Service" },
    { name: "Remarks" },
    { name: "Visit Date" },
    { name: "Created Date" },
    { name: "Action" },
  ];

  async function rejectRequest(id) {
    const conformation = confirm("Are you sure you want to reject?");
    if (!conformation) {
      return;
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/callrequests/${id}`,
        {
          call_status: "Rejected",
        }
      );

      if (response.status === 200) {
        alert("Call Request rejected successfully");
        fetchCallRequests();
      }
    } catch (error) {
      console.log(error);
      alert("Error update Call Request");
    }
  }

  return (
    <TeamLeaderDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center  ">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">Visit Date:</h1>
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
                    showDateDisplay={false}
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
            <h1 className="text-sm font-medium">Service Type:</h1>
            <select
              name="serviceType"
              value={selectedServiceType}
              onChange={(e) => {
                setSelectedServiceType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Service Type</option>
              {filterOptions?.serviceTypes?.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">Request Status:</h1>
            <select
              name="requestStatus"
              value={selectedRequestStatus}
              onChange={(e) => {
                setSelectedRequestStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="sm:w-full">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-row px-2 py-4 gap-4 font-medium sm:text-sm xlg:text-base bg-black text-white w-full border-b">
                {headers.map((header, index) => (
                  <div
                    key={index}
                    className="flex-1 flex items-center gap-3 cursor-pointer"
                  >
                    {header.name}
                  </div>
                ))}
              </div>
              <div className="flex flex-col h-[60vh] no-scrollbar bg-white overflow-auto">
                {callRequests.map((detail) => (
                  <div
                    className="flex flex-row px-2 py-4 border-b border-[#BBBBBB] group hover:bg-sky-500 hover:text-white transition-colors duration-300 gap-4 font-medium text-base w-full"
                    key={detail.callrequestId}
                  >
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.customer?.name}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.customer?.mobile_number}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.customer?.area}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.call_service}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.remarks}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.preferred_visit_date
                        ? new Date(detail.preferred_visit_date).toDateString()
                        : ""}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.createdAt
                        ? new Date(detail.createdAt).toDateString()
                        : ""}
                    </div>
                    <div className="flex flex-row flex-1 items-center font-semibold gap-5 text-xl">
                      {detail.call_status === "Pending" && (
                        <button
                          className="text-red-500 group-hover:text-red-200"
                          type="button"
                          title="Reject Request"
                          onClick={() => rejectRequest(detail._id)}
                        >
                          <TiCancel />
                        </button>
                      )}
                      {detail.call_status === "Pending" && (
                        <Link
                          className="text-yellow-500 group-hover:text-yellow-300"
                          to={`/teamleader/add-calldetails/${teamleaderId}?request=${detail._id}`}
                          title="Add to Call"
                        >
                          <FiEdit />
                        </Link>
                      )}
                      <button
                        className="text-[#D53F3A] group-hover:text-red-200"
                        onClick={() => handleDeleteClick(detail._id)}
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
      </div>
    </TeamLeaderDashboardTemplate>
  );
}
