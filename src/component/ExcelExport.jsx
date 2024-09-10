import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const ExcelExport = ({ filters, fileName = "call_details.xlsx" }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/export`,
        {
          params: filters,
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

      const dataToExport = response.data.data.map((detail) =>
        columns.reduce((obj, col) => {
          obj[col] = detail[col] || "";
          return obj;
        }, {})
      );

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
        header: columns,
      });
      XLSX.utils.book_append_sheet(workbook, worksheet, "Call Details");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([new Uint8Array(excelBuffer)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadProgress(0);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setDownloadProgress(0);
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
