import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const AdminSideHeader = ({ isMobileSidebarOpen, closeMobileSidebar }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const location = useLocation();

  const sideheader = [
    {
      icon: "/images/dashboard.svg",
      name: "Dashboard",
      link: "/admin/dashboard",
    },
    {
      icon: "/images/lead.svg",
      name: "Call Entry",

      links: [
        {
          name: "Add Call Details",
          link: "/admin/add-calldetails",
        },
        {
          name: "Manage Call Details",
          link: "/admin/manage-calldetails",
        },
        {
          name: "Add/Manage Brand",
          link: "/admin/add-and-manage-brand",
        },
        {
          name: "Add/Manage Engineer",
          link: "/admin/add-and-manage-engineer",
        },
        {
          name: "Add/Manage Product",
          link: "/admin/add-and-manage-product",
        },
        {
          name: "Add/Manage Warranty",
          link: "/admin/add-and-manage-warranty",
        },
        {
          name: "Add/Mng Service Type",
          link: "/admin/add-and-manage-servicetype",
        },
        { name: "Add/Mng Job Status", link: "/admin/add-and-manage-jobstatus" },
      ],
    },
    {
      icon: "/images/broadcast.svg",
      name: "WA Broadcast",
      link: "/admin/wa-brodcast",
    },
    {
      icon: "/images/user.svg",
      name: "Add & Manage User",
      link: "/admin/add-and-manage-user",
    },
  ];

  const handleIconClick = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // Collapse if clicked again
    } else {
      setActiveIndex(index);
    }
  };

  // Reset active index when the sidebar is closed
  useEffect(() => {
    if (!isMobileSidebarOpen) {
      setActiveIndex(null);
    }
  }, [isMobileSidebarOpen]);

  // Handle mouse leave for the entire sidebar
  useEffect(() => {
    const handleMouseLeave = () => {
      setHoveredIndex(null);
      setActiveIndex(null);
      setIsSidebarHovered(false);
    };

    const sidebarElement = document.getElementById("admin-sidebar");
    sidebarElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebarElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      id="admin-sidebar"
      className={`absolute flex flex-col gap-4 h-full bg-[#000000] transition-all duration-300 z-50 ${
        isMobileSidebarOpen ? "block" : "hidden"
      } md:flex ${
        isSidebarHovered || activeIndex !== null ? "w-64" : "w-[4.5rem]"
      }`}
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      {sideheader.map((item, index) => (
        <div
          key={index}
          className="relative flex flex-col items-start"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleIconClick(index)}
        >
          <div
            className={`flex items-center p-2 rounded-lg w-full `}
            style={{
              transition: "background-color 0.5s ease, width 0.5s ease",
            }}
          >
            <span
              className={`p-2 rounded-md  ${
                hoveredIndex === index || location.pathname === item.link
                  ? "bg-gray-300"
                  : "bg-transparent"
              }`}
            >
              <img
                src={item.icon}
                alt={item.name}
                className={`h-[1.4rem] w-[1.4rem]  `}
              />
            </span>
            {(isSidebarHovered || activeIndex !== null) && (
              <>
                {item.link ? (
                  <Link
                    to={item.link}
                    className={`text-[#777777] cursor-pointer ml-2 ${
                      location.pathname === item.link
                        ? "text-[white]"
                        : "text-[#777777]"
                    }`}
                    onClick={closeMobileSidebar}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={`text-[#777777] cursor-pointer ml-2 ${
                      location.pathname === item.link
                        ? "text-[white]"
                        : "text-[#777777]"
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Render Dropdown Links if available */}
          {item.links?.length > 0 && (
            <div
              className={`flex flex-col w-full ml-4 overflow-hidden ease-in-out ${
                activeIndex === index ? "max-h-screen" : "max-h-0"
              }`}
              style={{
                transform: activeIndex === index ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "top",
                transition: "transform 0.5s ease, max-height 0.9s ease",
              }}
            >
              {item.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  to={link.link}
                  className={`pl-10 py-2 transition-all duration-1000 ease-in-out ${
                    location.pathname === link.link
                      ? "text-[#BDBDBD]"
                      : "text-[#777777]"
                  }`}
                  style={{
                    transform:
                      activeIndex === index
                        ? "translateY(0)"
                        : "translateY(-10px)",
                    opacity: activeIndex === index ? 1 : 0,
                    transition:
                      "transform 0.5s ease, opacity 0.5s ease, color 0.3s ease",
                  }}
                  onClick={closeMobileSidebar} // Close sidebar on link click
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminSideHeader;
