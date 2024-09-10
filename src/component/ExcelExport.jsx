import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library to create Excel files

const ExcelExport = ({ filters, fileName = "call_details.xlsx" }) => {
  const [downloadProgress, setDownloadProgress] = useState(0); // State to track progress

  const handleExport = async () => {
    try {
      // Fetch filtered data from the backend
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/export`,
        {
          params: filters, // Pass the filters to the backend
          onDownloadProgress: (progressEvent) => {
            const total =
              progressEvent.total ||
              progressEvent.srcElement?.getResponseHeader("content-length");
            if (total) {
              setDownloadProgress(
                Math.round((progressEvent.loaded * 100) / total)
              );
            }
          },
        }
      );

      // Columns for the Excel export
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

      // Prepare the data for Excel, ensuring each row contains only the relevant columns
      const dataToExport = response.data.data.map((detail) =>
        columns.reduce((obj, col) => {
          obj[col] = detail[col] || ""; // Use empty string if the field is missing
          return obj;
        }, {})
      );

      // Create a new workbook and add a worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
        header: columns,
      });
      XLSX.utils.book_append_sheet(workbook, worksheet, "Call Details");

      // Generate the Excel file in memory and trigger download
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([new Uint8Array(excelBuffer)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a link element, trigger the download, and remove the link element
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Reset download progress after the download is complete
      setDownloadProgress(0);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setDownloadProgress(0); // Reset progress on error
    }
  };

  return (
    <div>
      <button onClick={handleExport} className="form-submit">
        Export to Excel
      </button>
      {downloadProgress > 0 && (
        <div>
          <p>Download Progress: {downloadProgress}%</p>
          <progress value={downloadProgress} max="100">
            {downloadProgress}%
          </progress>
        </div>
      )}
    </div>
  );
};

export default ExcelExport;
