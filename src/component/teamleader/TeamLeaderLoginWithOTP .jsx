import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeamLeaderLoginWithOTP = () => {
  const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter OTP
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");

  const navigate = useNavigate();
  const otpInputRefs = useRef([]);
  const timerRef = useRef(null);

  // Initialize OTP input refs
  useEffect(() => {
    otpInputRefs.current = otpInputRefs.current.slice(0, 6);
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && step === 2) {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, step]);

  // Validate mobile number
  const validateMobileNumber = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobile) {
      return "Mobile number is required";
    }
    if (!mobileRegex.test(mobile)) {
      return "Please enter a valid 10-digit mobile number";
    }
    return "";
  };

  // Handle mobile submission to send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate mobile
    const mobileValidationError = validateMobileNumber(mobileNumber);
    if (mobileValidationError) {
      setMobileError(mobileValidationError);
      return;
    }

    setMobileError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/otp/send`,
        {
          phone: mobileNumber,
          type: "login",
        },
      );

      if (response.status === 201) {
        setStep(2);
        setCountdown(30); // 30 seconds countdown
        setCanResend(false);
        setSuccessMessage("OTP sent successfully to your mobile");
        // Focus first OTP input
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if last digit is entered
    if (value && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        handleVerifyOTP();
      }
    }
  };

  // Handle OTP input key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const pastedOtp = pastedData.split("");
      setOtp(pastedOtp);

      // Focus last input
      setTimeout(() => {
        otpInputRefs.current[5]?.focus();
      }, 0);
    }
  };

  // Verify OTP and login
  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setOtpError("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setOtpError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/teamleader/login-with-otp`,
        {
          emailOrPhone: mobileNumber,
          otp: otpString,
        },
      );

      const { token, name, role, teamleaderId, teamleader } = response.data;

      if (!teamleaderId) {
        throw new Error("Team Leader ID not received");
      }

      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("teamleaderId", teamleaderId);
      localStorage.setItem("user", JSON.stringify(teamleader));

      console.log("Team Leader login successful with OTP");

      // Redirect to dashboard
      navigate(`/teamleader/dashboard/${teamleaderId}`);
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response?.status === 400) {
        if (error.response.data.message.includes("Invalid OTP")) {
          setOtpError("Invalid OTP. Please try again.");
        } else {
          setError(error.response.data.message);
        }
      } else if (error.response?.status === 403) {
        setError("Your account is disabled. Please contact support.");
      } else {
        setError("Login failed. Please try again.");
      }

      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/otp/resend`,
        {
          phone: mobileNumber,
          type: "login",
        },
      );

      if (response.status === 200) {
        setCountdown(30);
        setCanResend(false);
        setSuccessMessage("OTP resent successfully");
        setOtp(["", "", "", "", "", ""]);

        // Focus first OTP input
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);

      if (error.response?.data?.waitTime) {
        setCountdown(error.response.data.waitTime);
        setCanResend(false);
        setError(
          `Please wait ${error.response.data.waitTime} seconds before resending`,
        );
      } else {
        setError(error.response?.data?.message || "Failed to resend OTP");
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Handle change mobile number
  const handleChangeMobile = () => {
    setStep(1);
    setMobileNumber("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccessMessage("");
    setCountdown(0);
    setCanResend(false);
  };

  // Format mobile number for display
  const formatMobileNumber = (mobile) => {
    if (mobile.length === 10) {
      return `${mobile.substring(0, 5)} ${mobile.substring(5)}`;
    }
    return mobile;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        Team Leader Login with OTP
      </h2>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Step 1: Enter Mobile Number */}
      {step === 1 && (
        <form
          onSubmit={handleSendOTP}
          className="flex flex-col sm:gap-5 lg:gap-2 xl:gap-8"
        >
          <div className="flex flex-col gap-2 font-semibold text-black">
            <label className="text-sm">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                setMobileError("");
              }}
              placeholder="Enter 10-digit mobile number"
              className={`bg-[white] text-[black] rounded-sm sm:h-[2.5rem] xl:h-[3.5rem] border p-2 text-lg focus:outline-[black] focus:outline-none ${
                mobileError ? "border-red-500" : "border-[#cccccc]"
              }`}
              maxLength="10"
            />
            {mobileError && (
              <div className="text-red-500 text-sm mt-1">{mobileError}</div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              We'll send a 6-digit OTP to this number
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
          </button>

          {/* <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/teamleader/login")}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Password Login
            </button>
          </div> */}
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-black">Enter OTP</h3>
            <button
              onClick={handleChangeMobile}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Number
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            OTP sent to {formatMobileNumber(mobileNumber)}
          </p>

          {/* OTP Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-3">
              Enter 6-digit OTP
            </label>
            <div
              className="flex justify-between space-x-2 mb-6"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-2xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    otpError ? "border-red-500" : "border-[#cccccc]"
                  }`}
                />
              ))}
            </div>
            {otpError && (
              <p className="text-sm text-red-600 mb-4">{otpError}</p>
            )}
          </div>

          {/* Resend OTP Section */}
          <div className="mb-6">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600 text-center">
                Resend OTP in{" "}
                <span className="font-semibold text-blue-600">
                  {countdown} seconds
                </span>
              </p>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendLoading || !canResend}
                  className={`text-sm ${
                    resendLoading || !canResend
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  {resendLoading ? "Resending OTP..." : "Resend OTP"}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join("").length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading || otp.join("").length !== 6
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify & Login"
              )}
            </button>

            <button
              onClick={handleChangeMobile}
              className="w-full py-3 px-4 border border-[#cccccc] rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Use Different Number
            </button>
          </div>
        </div>
      )}

      {/* Login Options Footer */}
      {/* <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col text-black gap-1">
          <span className="cursor-pointer hover:text-blue-600 text-sm">
            Forgot my password
          </span>
          <button
            onClick={() => navigate("/teamleader/login")}
            className="text-blue-600 hover:text-blue-800 text-sm text-left"
          >
            Try password login instead
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default TeamLeaderLoginWithOTP;
