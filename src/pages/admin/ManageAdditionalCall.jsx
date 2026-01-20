import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import Select from "react-select";
import { FiEye, FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import DateRangePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";

const ManageAdditionalCall = () => {
  const [additionalCalls, setAdditionalCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [callToDelete, setCallToDelete] = useState(null);
  const [callToEdit, setCallToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    service_type: "",
    additional_service_type: "",
    start_date: null,
    end_date: null,
    search: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    requested_date: "",
    service_type: "",
    additional_service_type: "",
    visit_date: "",
    total_amount: "",
    profit_amount: "",
    commission_amount: "",
    customer: "",
    remarks: "",
    status: "",
  });

  // Pagination and sorting
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Service type options
  const serviceTypeOptions = [
    { value: "electronics_parts", label: "Electronics Parts" },
    { value: "salon_services", label: "Salon Services" },
    { value: "sanitary_services", label: "Sanitary Services" },
    { value: "cleaning_services", label: "Cleaning Services" },
    { value: "grocery_services", label: "Grocery Services" },
  ];

  // Status options
  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "Canceled", label: "Canceled" },
  ];

  // Additional service type options grouped by service type
  const additionalServiceOptions = {
    salon_services: [
      {
        value: "haircut_spa_and_wash_head_massage",
        label: "Haircut, Spa & Head Massage",
      },
      {
        value: "hair_smoothening_straightening",
        label: "Hair Smoothening & Straightening",
      },
      {
        value: "hair_coloring_and_root_touch_up",
        label: "Hair Coloring & Root Touch Up",
      },
      {
        value: "keratin_and_protein_hair_treatment",
        label: "Keratin & Protein Hair Treatment",
      },
      {
        value: "facial_cleanup_and_de_tan_facial",
        label: "Facial Cleanup & De-tan Facial",
      },
      {
        value: "full_arms_and_full_legs_waxing",
        label: "Full Arms & Legs Waxing",
      },
      {
        value: "eyebrow_threading_and_upper_lip",
        label: "Eyebrow Threading & Upper Lip",
      },
      { value: "manicure_and_pedicure", label: "Manicure & Pedicure" },
      {
        value: "party_makeup_and_occasion_makeup",
        label: "Party & Occasion Makeup",
      },
    ],
    cleaning_services: [
      {
        value: "home_deep_cleaning_service",
        label: "Home Deep Cleaning Service",
      },
      {
        value: "living_room_and_bedroom_cleaning",
        label: "Living Room & Bedroom Cleaning",
      },
      {
        value: "kitchen_degreasing_and_sanitizing",
        label: "Kitchen Degreasing & Sanitizing",
      },
      {
        value: "window_and_glass_cleaning_service",
        label: "Window & Glass Cleaning",
      },
      {
        value: "marble_and_granite_floor_polishing",
        label: "Marble & Granite Floor Polishing",
      },
      {
        value: "curtain_and_blind_cleaning",
        label: "Curtain & Blind Cleaning",
      },
      {
        value: "sofa_cleaning_and_shampooing_service",
        label: "Sofa Cleaning & Shampooing",
      },
      {
        value: "balcony_and_terrace_cleaning",
        label: "Balcony & Terrace Cleaning",
      },
      {
        value: "spring_and_festival_home_cleaning",
        label: "Spring & Festival Home Cleaning",
      },
    ],
    sanitary_services: [
      {
        value: "bathroom_and_toilet_deep_cleaning",
        label: "Bathroom & Toilet Deep Cleaning",
      },
      {
        value: "residential_house_cleaning",
        label: "Residential House Cleaning",
      },
      {
        value: "septic_tank_cleaning_and_desludging",
        label: "Septic Tank Cleaning & Desludging",
      },
      {
        value: "drain_and_sewer_line_cleaning",
        label: "Drain & Sewer Line Cleaning",
      },
      { value: "water_tank_cleaning", label: "Water Tank Cleaning" },
      {
        value: "garbage_collection_and_waste_disposal",
        label: "Garbage Collection & Waste Disposal",
      },
      {
        value: "pest_control_and_disinfection_service",
        label: "Pest Control & Disinfection",
      },
      {
        value: "office_and_commercial_space_cleaning",
        label: "Office & Commercial Space Cleaning",
      },
      {
        value: "public_toilet_maintenance_and_sanitization",
        label: "Public Toilet Maintenance",
      },
    ],
    electronics_parts: [],
    grocery_services: [],
  };

  const fetchAdditionalCalls = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...filters,
        start_date: filters.start_date
          ? format(filters.start_date, "yyyy-MM-dd")
          : "",
        end_date: filters.end_date
          ? format(filters.end_date, "yyyy-MM-dd")
          : "",
      };

      // Remove empty filter values
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL || ""}/api/additionalcall`,
        { params },
      );

      setAdditionalCalls(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching additional calls:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortConfig, filters]);

  useEffect(() => {
    fetchAdditionalCalls();
  }, [fetchAdditionalCalls]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  // Handle date range change
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      start_date: start,
      end_date: end,
    }));
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle view details
  const handleViewClick = (call) => {
    setSelectedCall(call);
    setShowModal(true);
  };

  // Handle edit
  const handleEditClick = (call) => {
    setCallToEdit(call);
    setEditForm({
      requested_date: call.requested_date ? new Date(call.requested_date) : "",
      service_type: call.service_type || "",
      additional_service_type: call.additional_service_type || "",
      visit_date: call.visit_date ? new Date(call.visit_date) : "",
      total_amount: call.total_amount || "",
      profit_amount: call.profit_amount || "",
      commission_amount: call.commission_amount || "",
      customer: call.customer?._id || call.customer || "",
      remarks: call.remarks || "",
      status: call.status || "Pending",
    });
    setShowEditModal(true);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes in edit form
  const handleSelectChange = (name, selectedOption) => {
    setEditForm((prev) => ({
      ...prev,
      [name]: selectedOption?.value || "",
    }));
  };

  // Handle date changes in edit form
  const handleDateFormChange = (name, date) => {
    setEditForm((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const formattedData = {
        ...editForm,
        requested_date: editForm.requested_date
          ? format(new Date(editForm.requested_date), "yyyy-MM-dd")
          : "",
        visit_date: editForm.visit_date
          ? format(new Date(editForm.visit_date), "yyyy-MM-dd")
          : "",
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL || ""}/api/additionalcall/${
          callToEdit._id
        }`,
        formattedData,
      );

      // Refresh the list
      fetchAdditionalCalls();
      setShowEditModal(false);
      setCallToEdit(null);
    } catch (error) {
      console.error("Error updating call:", error);
      alert("Failed to update call. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (call) => {
    setCallToDelete(call);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!callToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL || ""}/api/additionalcall/${
          callToDelete._id
        }`,
      );
      fetchAdditionalCalls();
      setShowDeletePopup(false);
      setCallToDelete(null);
    } catch (error) {
      console.error("Error deleting call:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Render sort arrow
  const renderSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />;
    }
    return <FaArrowDown />;
  };

  // Get filtered additional service options
  const getAdditionalServiceOptions = () => {
    if (!filters.service_type) {
      // Return all options flattened
      return Object.values(additionalServiceOptions).flat();
    }
    return additionalServiceOptions[filters.service_type] || [];
  };

  // Get additional service options for filter
  const getFilterAdditionalServiceOptions = () => {
    if (!filters.service_type) {
      return Object.values(additionalServiceOptions).flat();
    }
    return additionalServiceOptions[filters.service_type] || [];
  };
  // Table headers
  const headers = [
    { key: "callId", label: "Call ID", sortable: true },
    { key: "customer", label: "Customer", sortable: false },
    { key: "requested_date", label: "Requested Date", sortable: true },
    { key: "visit_date", label: "Visit Date", sortable: true },
    { key: "service_type", label: "Service Type", sortable: true },
    {
      key: "additional_service_type",
      label: "Additional Service",
      sortable: true,
    },
    { key: "status", label: "Status", sortable: true },
    { key: "total_amount", label: "Amount", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Pagination controls
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 p-4">
          {/* Header with filters */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Manage Additional Calls</h1>
              {/* <button
                onClick={() => navigate("/admin/additional-calls/add")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add New Call
              </button> */}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by Call ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  options={statusOptions}
                  isClearable
                  placeholder="Select Status"
                  value={statusOptions.find(
                    (opt) => opt.value === filters.status,
                  )}
                  onChange={(selected) =>
                    handleFilterChange("status", selected?.value || "")
                  }
                  className="basic-single"
                  classNamePrefix="select"
                />
              </div>

              {/* Service Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Service Type
                </label>
                <Select
                  options={serviceTypeOptions}
                  isClearable
                  placeholder="Select Service Type"
                  value={serviceTypeOptions.find(
                    (opt) => opt.value === filters.service_type,
                  )}
                  onChange={(selected) =>
                    handleFilterChange("service_type", selected?.value || "")
                  }
                  className="basic-single"
                  classNamePrefix="select"
                />
              </div>

              {/* Additional Service Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Service
                </label>
                <Select
                  options={getAdditionalServiceOptions()}
                  isClearable
                  placeholder="Select Additional Service"
                  value={getAdditionalServiceOptions().find(
                    (opt) => opt.value === filters.additional_service_type,
                  )}
                  onChange={(selected) =>
                    handleFilterChange(
                      "additional_service_type",
                      selected?.value || "",
                    )
                  }
                  isDisabled={!filters.service_type}
                  className="basic-single"
                  classNamePrefix="select"
                />
              </div>

              {/* Date Range Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Date Range
                </label>
                <DateRangePicker
                  selected={filters.start_date}
                  onChange={handleDateChange}
                  startDate={filters.start_date}
                  endDate={filters.end_date}
                  selectsRange
                  placeholderText="Select date range"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              {/* Items Per Page */}
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Items Per Page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div> */}

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      status: "",
                      service_type: "",
                      additional_service_type: "",
                      start_date: null,
                      end_date: null,
                      search: "",
                    });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {additionalCalls.length} of {totalItems} calls
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((header) => (
                          <th
                            key={header.key}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                              header.sortable
                                ? "cursor-pointer hover:bg-gray-100"
                                : ""
                            }`}
                            onClick={() =>
                              header.sortable && handleSort(header.key)
                            }
                          >
                            <div className="flex items-center gap-1">
                              {header.label}
                              {header.sortable && renderSortArrow(header.key)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {additionalCalls.map((call) => (
                        <tr key={call._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {call.callId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {call.customer?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(call.requested_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(call.visit_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {call.service_type?.replace(/_/g, " ") || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="max-w-xs truncate inline-block">
                              {call.additional_service_type?.replace(
                                /_/g,
                                " ",
                              ) || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                call.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : call.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {call.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(call.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewClick(call)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditClick(call)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(call)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <RiDeleteBin5Line size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty state */}
                {additionalCalls.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No additional calls found</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Previous
              </button>

              {renderPageNumbers()}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}

          {/* View Modal */}
          {showModal && selectedCall && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      Call Details - {selectedCall.callId}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {selectedCall.customer?.name || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {selectedCall.customer?.phone || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {selectedCall.customer?.email || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {selectedCall.customer?.address || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Call Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                        Call Information
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Call ID:</span>{" "}
                          {selectedCall.callId}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs ${
                              selectedCall.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : selectedCall.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedCall.status}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Requested Date:</span>{" "}
                          {formatDate(selectedCall.requested_date)}
                        </p>
                        <p>
                          <span className="font-medium">Visit Date:</span>{" "}
                          {formatDate(selectedCall.visit_date)}
                        </p>
                        <p>
                          <span className="font-medium">Created At:</span>{" "}
                          {formatDate(selectedCall.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Service Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                        Service Information
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Service Type:</span>{" "}
                          {selectedCall.service_type?.replace(/_/g, " ")}
                        </p>
                        <p>
                          <span className="font-medium">
                            Additional Service:
                          </span>{" "}
                          {selectedCall.additional_service_type?.replace(
                            /_/g,
                            " ",
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                        Financial Information
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Total Amount:</span>{" "}
                          {formatCurrency(selectedCall.total_amount)}
                        </p>
                        <p>
                          <span className="font-medium">Profit Amount:</span>{" "}
                          {formatCurrency(selectedCall.profit_amount)}
                        </p>
                        <p>
                          <span className="font-medium">
                            Commission Amount:
                          </span>{" "}
                          {formatCurrency(selectedCall.commission_amount)}
                        </p>
                      </div>
                    </div>

                    {/* Remarks */}
                    {selectedCall.remarks && (
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                          Remarks
                        </h3>
                        <p className="text-gray-700">{selectedCall.remarks}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t flex justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && callToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      Edit Call - {callToEdit.callId}
                    </h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                      disabled={editLoading}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleEditSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Status */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                          Status
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Status
                            </label>
                            <Select
                              options={statusOptions}
                              value={statusOptions.find(
                                (opt) => opt.value === editForm.status,
                              )}
                              onChange={(selected) =>
                                handleSelectChange("status", selected)
                              }
                              placeholder="Select Status"
                              className="basic-single"
                              classNamePrefix="select"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                          Dates
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Requested Date
                            </label>
                            <input
                              type="date"
                              name="requested_date"
                              value={
                                editForm.requested_date
                                  ? format(
                                      new Date(editForm.requested_date),
                                      "yyyy-MM-dd",
                                    )
                                  : ""
                              }
                              onChange={(e) =>
                                handleDateFormChange(
                                  "requested_date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Visit Date
                            </label>
                            <input
                              type="date"
                              name="visit_date"
                              value={
                                editForm.visit_date
                                  ? format(
                                      new Date(editForm.visit_date),
                                      "yyyy-MM-dd",
                                    )
                                  : ""
                              }
                              onChange={(e) =>
                                handleDateFormChange(
                                  "visit_date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Service Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                          Service Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Service Type
                            </label>
                            <Select
                              options={serviceTypeOptions}
                              value={serviceTypeOptions.find(
                                (opt) => opt.value === editForm.service_type,
                              )}
                              onChange={(selected) =>
                                handleSelectChange("service_type", selected)
                              }
                              placeholder="Select Service Type"
                              className="basic-single"
                              classNamePrefix="select"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Additional Service
                            </label>
                            <Select
                              options={getAdditionalServiceOptions()}
                              value={getAdditionalServiceOptions().find(
                                (opt) =>
                                  opt.value ===
                                  editForm.additional_service_type,
                              )}
                              onChange={(selected) =>
                                handleSelectChange(
                                  "additional_service_type",
                                  selected,
                                )
                              }
                              placeholder="Select Additional Service"
                              className="basic-single"
                              classNamePrefix="select"
                              isDisabled={!editForm.service_type}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                          Financial Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Total Amount (₹)
                            </label>
                            <input
                              type="number"
                              name="total_amount"
                              value={editForm.total_amount}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Profit Amount (₹)
                            </label>
                            <input
                              type="number"
                              name="profit_amount"
                              value={editForm.profit_amount}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Commission Amount (₹)
                            </label>
                            <input
                              type="number"
                              name="commission_amount"
                              value={editForm.commission_amount}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                          Remarks
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <textarea
                              name="remarks"
                              value={editForm.remarks}
                              onChange={handleEditFormChange}
                              rows="6"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter any remarks or notes..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={editLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        disabled={editLoading}
                      >
                        {editLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Updating...
                          </>
                        ) : (
                          "Update Call"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeletePopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete call{" "}
                  <strong>{callToDelete?.callId}</strong>? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeletePopup(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default ManageAdditionalCall;
