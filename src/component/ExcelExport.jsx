import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const ExcelExport = ({ filters, fileName = "call_details" }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const batchSize = 40000;

  const handleExport = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      let currentBatch = 0;
      let totalRecords = 0;

      // Fetch the total number of records first
      const initialResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/export`,
        { params: { ...filters, skip: 0, limit: 1 } }
      );
      totalRecords = initialResponse.data.totalRecords;
      const totalBatches = Math.ceil(totalRecords / batchSize);

      // Process each batch sequentially
      for (let i = 0; i < totalBatches; i++) {
        const skip = i * batchSize;
        currentBatch++;

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/calldetails/export`,
          {
            params: { ...filters, skip, limit: batchSize },
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

        // Name the file with the current batch and date
        const currentDate = new Date().toISOString().split("T")[0];
        link.href = url;
        link.setAttribute(
          "download",
          `${fileName}_${currentDate}_Batch${currentBatch}.xlsx`
        );

        document.body.appendChild(link);
        link.click();
        link.remove();

        // Update progress (if needed)
        setDownloadProgress((currentBatch / totalBatches) * 100);
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      {isDownloading && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="text-white text-2xl font-bold">
            Downloading {Math.round(downloadProgress)}%
          </div>
        </div>
      )}
      <button
        onClick={handleExport}
        className={`text-black w-fit bg-[#EEEEEE] font-medium px-4 py-2 text-sm rounded-md shadow-custom ${
          isDownloading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isDownloading}
      >
        {isDownloading
          ? `Downloading ${Math.round(downloadProgress)}%`
          : "Export to Excel"}
      </button>
    </div>
  );
};

export default ExcelExport;
