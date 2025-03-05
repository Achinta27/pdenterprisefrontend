import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      setLoading(false);
      return;
    }

    try {
      let response;
      let teamleaderId = localStorage.getItem("teamleaderId");
      console.log(teamleaderId);

      if (role === "admin") {
        response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser({ ...response.data, role });
        navigate("/admin/dashboard");
      } else if (role === "TeamLeader") {
        response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/teamleader`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.teamleaderId) {
          teamleaderId = response.data.teamleaderId;
          localStorage.setItem("teamleaderId", teamleaderId);
        }

        if (!teamleaderId) {
          console.error("Error: teamleaderId is undefined after API call");
          return;
        }

        setUser({ ...response.data, role });
        navigate(`/teamleader/dashboard/${teamleaderId}`);
      }
    } catch (error) {
      console.error("Failed to fetch current user", error);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("teamleaderId");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
