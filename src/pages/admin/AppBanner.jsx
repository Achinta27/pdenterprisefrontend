import { useCallback, useEffect, useState } from "react";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import axios from "axios";
import { RiDeleteBin5Line } from "react-icons/ri";
import { TiCancel } from "react-icons/ti";
import { FaCheck } from "react-icons/fa";
import LoadingAnimation from "../../component/LoadingAnimation";
import { DateRangePicker } from "react-date-range";

export default function AppBanner() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [showDateFilterButtons, setShowDateFilterButtons] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [bannerName, setBannerName] = useState("");
  const [bannerImage, setBannerImage] = useState(null);

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

  async function handleSave() {
    try {
      if (!bannerName || !bannerImage) {
        alert("Please fill all the fields");
        return;
      }
      if (bannerImage.size > 10000000) {
        alert("Image size should be less than 10MB");
        return;
      }
      const data = new FormData();
      data.append("banner_name", bannerName);
      data.append("banner_img", bannerImage);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/customer-banner`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 201) {
        alert("Banner created successfully");
        getAppBanners();
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

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

  const isDateFilterApplied = () => {
    return (
      appliedDateRange !== null &&
      appliedDateRange[0].startDate !== undefined &&
      appliedDateRange[0].endDate !== undefined
    );
  };

  const getAppBanners = useCallback(async () => {
    try {
      setLoading(true);
      let params = {
        page: currentPage,
        name: "",
        start_date: "",
        end_date: "",
      };
      if (search.trim()) {
        params.name = search;
      }
      if (appliedDateRange) {
        params.start_date =
          appliedDateRange[0].startDate.toISOString().split("T")[0] ?? "";
        params.end_date =
          appliedDateRange[0].endDate.toISOString().split("T")[0] ?? "";
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/customer-banner`,
        { params }
      );
      setCustomers(response.data.banners);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, appliedDateRange]);

  useEffect(() => {
    getAppBanners();
  }, [getAppBanners]);

  const headers = [
    { name: "Name" },
    { name: "Active Status" },
    { name: "Image" },
    { name: "Created At" },
    { name: "Action" },
  ];

  async function handelDelete(id) {
    if (!confirm("Are you sure you want to delete this banner?")) {
      return;
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/customer-banner/${id}`
      );
      if (response.status === 200) {
        alert("Banner deleted successfully");
        getAppBanners();
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

  async function handelUpdate(id, status) {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/customer-banner/${id}`,
        {
          status: status,
        }
      );
      if (response.status === 200) {
        alert("Banner updated successfully");
        getAppBanners();
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
              placeholder="Name"
              value={bannerName}
              onChange={(e) => setBannerName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              Banner Image
            </label>
            <input
              type="file"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
              placeholder="Banner"
              accept="image/*"
              onChange={(e) => setBannerImage(e.target.files[0])}
            />
          </div>
          <button
            className="px-4 py-1 mx-1 text-lg font-medium bg-[#63B263] text-white rounded"
            type="button"
            onClick={handleSave}
          >
            Add
          </button>
        </div>
        <div className="w-full h-[1px] bg-[#cccccc]" />
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search Banner
            </label>
            <input
              type="search"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">Created Date:</h1>
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
        </div>
        <div className="w-full h-[1px] bg-[#cccccc]" />
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
                {customers.map((detail) => (
                  <div
                    className="flex flex-row px-2 py-4 border-b border-[#BBBBBB] group hover:bg-sky-500 hover:text-white transition-colors duration-300 gap-4 font-medium text-base w-full"
                    key={detail.bannerId}
                  >
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.banner_name}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.status ? "Active" : "Deactive"}
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      <img
                        src={detail.banner_img.secure_url}
                        alt="banner"
                        className="h-10"
                      />
                    </div>
                    <div className="xlg:text-sm sm:text-xs font-semibold flex-1 twolinelimit">
                      {detail.createdAt
                        ? new Date(detail.createdAt).toDateString()
                        : ""}
                    </div>
                    <div className="flex flex-row flex-1 items-center font-semibold gap-5 text-xl">
                      <button
                        type="button"
                        title={
                          detail.status
                            ? "Deactivate Banner"
                            : "Activate Banner"
                        }
                        onClick={() => handelUpdate(detail._id, !detail.status)}
                      >
                        {detail.status ? (
                          <TiCancel className="text-red-500 group-hover:text-red-200" />
                        ) : (
                          <FaCheck className="text-green-500 group-hover:text-green-200" />
                        )}
                      </button>
                      <button
                        className="text-[#D53F3A] group-hover:text-red-200"
                        onClick={() => handelDelete(detail._id)}
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
        <div className="w-full h-[1px] bg-[#cccccc]" />
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
    </AdminDashboardTemplate>
  );
}
