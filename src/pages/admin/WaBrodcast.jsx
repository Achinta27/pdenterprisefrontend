import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboardTemplate from "../../templates/AdminDashboardTemplate";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { RxCross2 } from "react-icons/rx";

const WaBrodcast = () => {
  const [phoneNumber, setPhoneNumber] = useState(""); // Phone number field
  const [templates, setTemplates] = useState([]); // Templates
  const [selectedTemplate, setSelectedTemplate] = useState(null); // Selected template
  const [headerFileUrls, setHeaderFileUrls] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false); // Show/Hide date picker
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          "https://web.wabridge.com/api/gettemplate",
          {
            params: {
              "auth-key": "c883746a389b81b6a89da7be6301772df6c0ef9dce547ca182",
              "app-key": "9e89e696-1186-4d22-ab16-9be64ef24b51",
              limit: 20,
              device_id: "66e29657a464dfbbac039219",
            },
          }
        );
        const templatesData = response.data.data;
        setTemplates(templatesData);

        const urls = {};
        templatesData.forEach((template) => {
          const headerComponent = template.components.find(
            (component) =>
              component.type === "HEADER" &&
              (component.format === "IMAGE" || component.format === "DOCUMENT")
          );
          if (headerComponent?.example?.header_handle?.length > 0) {
            urls[template.id] = headerComponent.example.header_handle[0];
          }
        });

        setHeaderFileUrls(urls);
      } catch (error) {
        console.error("There was an error fetching the templates!", error);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch mobile numbers for a selected date range
  const fetchMobileNumbers = async (startDate, endDate) => {
    try {
      let params = {};

      if (startDate && endDate) {
        params = {
          chooseFollowupstartdate: startDate,
          chooseFollowupenddate: endDate,
        };
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/get`,
        { params }
      );

      const mobileNumbers = response.data.data.map(
        (item) => item.contactNumber
      );

      if (Array.isArray(mobileNumbers) && mobileNumbers.length > 0) {
        setPhoneNumber(mobileNumbers.join(","));
      } else {
        toast.warn("No mobile numbers found for the selected date range.");
        setPhoneNumber("");
      }
    } catch (error) {
      console.error("Error fetching mobile numbers:", error);
      toast.error("Error fetching mobile numbers.");
    }
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const handleFetchNumbers = () => {
    const startDate = dateRange[0]?.startDate;
    const endDate = dateRange[0]?.endDate;

    if (startDate && endDate) {
      const formattedStartDate = `${startDate.getFullYear()}-${(
        startDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}`;
      const formattedEndDate = `${endDate.getFullYear()}-${(
        endDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`;

      // Fetch mobile numbers for the selected range
      fetchMobileNumbers(formattedStartDate, formattedEndDate);

      // Hide the date picker after fetching numbers
      setShowDatePicker(false);
    } else {
      toast.error("Please select a valid date range.");
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const clearFilters = () => {
    setDateRange([
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ]);
    setPhoneNumber("");
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedTemplate) {
        toast.error("No template selected");
        return;
      }

      const formattedPhoneNumber = phoneNumber.startsWith("91")
        ? phoneNumber
        : "91" + phoneNumber;

      const payload = {
        "auth-key": "c883746a389b81b6a89da7be6301772df6c0ef9dce547ca182",
        "app-key": "9e89e696-1186-4d22-ab16-9be64ef24b51",
        destination_number: formattedPhoneNumber,
        template_id: selectedTemplate,
        device_id: "66e29657a464dfbbac039219",
        variables: [],
        media: "",
      };

      const response = await axios.post(
        "https://web.wabridge.com/api/createmessage",
        payload
      );

      if (response.data.status === true) {
        toast.success("Message sent successfully!", {
          position: "bottom-center",
          icon: "✅",
        });

        setPhoneNumber("");
        setSelectedTemplate(null);
      } else {
        toast.error("Failed to send message.", {
          position: "bottom-center",
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("There was an error sending the message!", error);
      toast.error("An error occurred while sending the message.", {
        position: "bottom-center",
        icon: "❌",
      });
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-8 mt-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="dateRange">Choose Followup Date</label>
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-sm border border-[#CCCCCC]"
              >
                {dateRange[0].startDate && dateRange[0].endDate
                  ? `${dateRange[0].startDate.toDateString()} to ${dateRange[0].endDate.toDateString()}`
                  : "Select Date Range"}
              </button>

              <button
                onClick={clearFilters}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
              >
                <RxCross2 className="w-5 h-5" />
              </button>
            </div>

            {showDatePicker && (
              <div className="absolute z-10 top-16 bg-white shadow-lg">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  rangeColors={["#3b82f6"]}
                />
                <button
                  onClick={handleFetchNumbers}
                  className="w-full mt-2 p-2 bg-blue-500 text-white rounded-sm"
                >
                  Fetch Numbers
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone">Enter Mobile number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-sm border border-[#CCCCCC]"
              id="phone"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Template selection */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border flex flex-col gap-4 rounded-sm cursor-pointer ${
                selectedTemplate === template.id
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="text-xl font-semibold text-[#000000]">
                {template.name}
              </div>
              {/* Render Header (Image or Document) */}
              <div className="flex flex-row gap-4">
                <div className="w-[30%]">
                  {template.components.find(
                    (c) =>
                      c.type === "HEADER" &&
                      (c.format === "IMAGE" || c.format === "DOCUMENT")
                  ) ? (
                    template.components.find((c) => c.format === "IMAGE") ? (
                      <img
                        src={headerFileUrls[template.id]}
                        alt="Header Image"
                        className="w-full h-auto"
                      />
                    ) : (
                      <iframe
                        src={headerFileUrls[template.id]}
                        title="PDF Preview"
                        width="100%"
                        height="100px"
                      ></iframe>
                    )
                  ) : null}
                </div>

                {/* Render Body Content */}
                <div className="flex-1">
                  {template.components.map((component, index) => {
                    switch (component.type) {
                      case "HEADER":
                        if (component.format === "TEXT") {
                          return (
                            <div key={index}>
                              <h3 className="font-bold text-lg">
                                {component.text}
                              </h3>
                            </div>
                          );
                        }
                        break;
                      case "BODY":
                        return (
                          <div key={index} className="mt-2">
                            <p className="text-sm">{component.text}</p>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>

              {/* Footer and Buttons */}
              <div className="mt-4 flex flex-col gap-3">
                {template.components.map((component, index) => {
                  if (component.type === "FOOTER") {
                    return (
                      <div key={index} className="mt-4">
                        <p className="text-gray-500">{component.text}</p>
                      </div>
                    );
                  }

                  // Render buttons below the footer
                  if (component.type === "BUTTONS") {
                    return (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        {component.buttons.map((button, btnIndex) => (
                          <button
                            key={btnIndex}
                            className="bg-[#3562991a] rounded-sm text-sm text-[#0f2b3c] p-2 "
                          >
                            {button.text}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="xl:w-[15%] lg:w-[25%] sm:w-[30%] h-[3.5rem] text-black  bg-[#EEEEEE] font-medium px-4 py-2 rounded-md shadow-custom"
        >
          Submit
        </button>

        <ToastContainer />
      </div>
    </AdminDashboardTemplate>
  );
};

export default WaBrodcast;
