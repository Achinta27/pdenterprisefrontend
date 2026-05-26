import React, { useEffect, useState, useContext } from "react";
import AdminHeader from "../component/AdminHeader";
import AdminSideHeader from "../component/AdminSideHeader";
import TeamleaderHeader from "../component/teamleader/TeamleaderHeader";
import TeamleaderSideHeader from "../component/teamleader/TeamleaderSideHeader";
import { AuthContext } from "../context/AuthContext";

const AdminDashboardTemplate = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsTokenVerified(false);
      setTimeout(() => {
        alert("You are not logged in");
        window.location.href = "/";
      }, 0);
      return;
    }
    setIsTokenVerified(true);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (!isTokenVerified) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden">
      <div>
        {user?.role === "TeamLeader" ? (
          <TeamleaderHeader
            toggleMobileSidebar={toggleMobileSidebar}
            isMobileSidebarOpen={isMobileSidebarOpen}
            hideHeader={hideHeader}
          />
        ) : (
          <AdminHeader
            toggleMobileSidebar={toggleMobileSidebar}
            isMobileSidebarOpen={isMobileSidebarOpen}
            hideHeader={hideHeader}
          />
        )}
      </div>

      <div className="flex flex-row h-screen sm:w-full relative">
        {user?.role === "TeamLeader" ? (
          <TeamleaderSideHeader
            isMobileSidebarOpen={isMobileSidebarOpen}
            closeMobileSidebar={closeMobileSidebar}
          />
        ) : (
          <AdminSideHeader
            isMobileSidebarOpen={isMobileSidebarOpen}
            closeMobileSidebar={closeMobileSidebar}
          />
        )}
        <div className="w-full p-4 overflow-auto no-scrollbar xlg:ml-[8rem] ml-[5rem] xl:ml-[10rem]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTemplate;
