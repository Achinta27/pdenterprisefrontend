import React from "react";
import axios from "axios";

const ExcelExport = ({ filters, fileName = "call_details.xlsx" }) => {
  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/export`,
        {
          params: filters, // Send the same filters used for fetching the data
          responseType: "blob", // Ensure response is in blob format for file download
        }
      );

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Specify the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <button onClick={handleExport} className="form-submit">
      Export to Excel
    </button>
  );
};

export default ExcelExport;
