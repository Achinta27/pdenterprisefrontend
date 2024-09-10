import React, { useState } from "react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

const ExcelImport = ({ onImportSuccess, onDuplicateFound }) => {
  const [loading, setLoading] = useState(false);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    const allowedExtensions = /(\.csv)$/i;

    if (!file) {
      console.error("No file selected");
      return;
    }

    if (!allowedExtensions.exec(file.name)) {
      alert("Please upload a valid CSV file");
      event.target.value = ""; // Reset file input
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true); // Set loading to true when uploading starts

    try {
      console.log("Sending form data to API...");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/calldetails/uploadexcel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response received: ", response.data);

      // Safely handling duplicates in file and DB by defaulting to empty arrays if undefined
      const duplicatesInFile = response.data.duplicatesInFile || [];
      const duplicatesInDB = response.data.duplicatesInDB || [];

      const allDuplicates = [...duplicatesInFile, ...duplicatesInDB];

      if (allDuplicates.length > 0) {
        onDuplicateFound(allDuplicates); // Pass duplicates to parent
      }

      const newBusinesses = response.data.createdBusinesses || [];
      if (newBusinesses.length > 0) {
        onImportSuccess(newBusinesses); // Notify parent of new data
      }
    } catch (error) {
      console.error(
        "Error importing call details:",
        error.response?.data || error.message
      );
      alert(
        "Failed to import call details. Please check the file and try again."
      );
    } finally {
      setLoading(false); // Set loading to false when upload is done
      event.target.value = ""; // Reset the file input
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Loading spinner */}
      {loading && <LoadingSpinner />}

      {/* Upload Button */}
      <label
        htmlFor="fileUpload"
        className={`form-submit font-semibold ${loading ? "opacity-50" : ""}`}
      >
        {loading ? "Uploading..." : "Import Excel"}
      </label>
      <input
        type="file"
        id="fileUpload"
        accept=".csv"
        onChange={handleImport}
        disabled={loading} // Disable input when loading
        className="hidden"
      />
    </div>
  );
};

export default ExcelImport;
