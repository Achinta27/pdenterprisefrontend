import React, { useState } from "react";
import AdminLogin from "../component/AdminLogin";
import EmployeeLogin from "../component/EmployeeLogin";
import AdminLoginWithOTP from "../component/AdminLoginWithOTP";
import TeamLeaderLoginWithOTP from "../component/teamleader/TeamLeaderLoginWithOTP ";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [loginMethod, setLoginMethod] = useState("password");

  const renderLoginForm = () => {
    if (selectedRole === "admin") {
      return loginMethod === "password" ? (
        <AdminLogin />
      ) : (
        <AdminLoginWithOTP />
      );
    }
    return loginMethod === "password" ? (
      <EmployeeLogin />
    ) : (
      <TeamLeaderLoginWithOTP />
    );
  };

  return (
    <div className="flex justify-center h-[100vh] overflow-y-scroll bg-no-repeat bg-cover bg-center overflow-x-hidden items-center bg-[white]">
      <div className="lg:w-[40%] xl:w-[35%] sm:w-[95%] md:w-[60%] h-fit py-5 sm:px-3 lg:px-6 xl:px-16 gap-8 flex flex-col boxsh rounded-lg text-black bg-[white]">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center items-center text-[black] text-2xl font-bold">
            REBOOTS ADVANCE CRM
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xl font-medium">
              <span className="text-[black] font-semibold">Hello, </span>let’s
              get started
            </div>
            <div className="text-base font-medium">Sign in to continue</div>
          </div>
          <div className="flex flex-row text-2xl font-semibold justify-evenly w-full">
            <button
              onClick={() => setSelectedRole("admin")}
              className={`pb-2 ${
                selectedRole === "admin" ? "border-b-2 border-[#63B263]" : ""
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setSelectedRole("telecaller")}
              className={`pb-2 ${
                selectedRole === "telecaller"
                  ? "border-b-2 border-[#63B263]"
                  : ""
              }`}
            >
              Team Leader
            </button>
          </div>
          <div className="mt-4">{renderLoginForm()}</div>
          <div className="mt-6 bg-white rounded-lg shadow-sm p-1 flex space-x-1">
            <button
              onClick={() => setLoginMethod("password")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "password"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => setLoginMethod("otp")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "otp"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              OTP Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
