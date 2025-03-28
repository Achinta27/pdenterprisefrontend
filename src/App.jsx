import { useContext, useEffect, useState } from "react";

import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddAndManageBrand from "./pages/admin/AddAndManageBrand";
import AddAndManageProduct from "./pages/admin/AddAndManageProduct";
import AddAndManageEngineer from "./pages/admin/AddAndManageEngineer";
import AddAndManageWarranty from "./pages/admin/AddAndManageWarranty";
import AddAndManageServiceType from "./pages/admin/AddAndManageServiceType";
import AddCallDetails from "./pages/admin/AddCallDetails";
import ManageCallDetails from "./pages/admin/ManageCallDetails";
import CallDetailsPartii from "./pages/admin/CallDetailsPartii";
import EditCallDetails from "./pages/admin/EditCallDetails";
import AddAndManageJobstatus from "./pages/admin/AddAndManageJobstatus";
import AddAndManageUser from "./pages/admin/AddAndManageUser";
import LoginPage from "./pages/LoginPage";
import TeamleaderDashboard from "./pages/teamleader/TeamleaderDashboard";
import TeamLeaderCallEntry from "./pages/teamleader/TeamLeaderCallEntry";
import TeamLeaderEditCallDetails from "./pages/teamleader/TeamLeaderEditCallDetails";
import WaBrodcast from "./pages/admin/WaBrodcast";
import { AuthContext } from "./context/AuthContext";

const ProtectedRoute = ({ element, allowedRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return element;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute element={<ManageCallDetails />} allowedRole="admin" />
        }
      />
      <Route path="/admin/add-calldetails" element={<AddCallDetails />} />
      <Route path="/admin/manage-calldetails" element={<ManageCallDetails />} />
      <Route
        path="/admin/call-details/part2/:calldetailsId"
        element={<CallDetailsPartii />}
      />
      <Route
        path="/admin/calldetails/edit-calldetails/:calldetailsId"
        element={<EditCallDetails />}
      />

      <Route
        path="/admin/add-and-manage-brand"
        element={<AddAndManageBrand />}
      />
      <Route
        path="/admin/add-and-manage-product"
        element={<AddAndManageProduct />}
      />
      <Route
        path="/admin/add-and-manage-engineer"
        element={<AddAndManageEngineer />}
      />
      <Route
        path="/admin/add-and-manage-warranty"
        element={<AddAndManageWarranty />}
      />
      <Route
        path="/admin/add-and-manage-servicetype"
        element={<AddAndManageServiceType />}
      />
      <Route
        path="/admin/add-and-manage-jobstatus"
        element={<AddAndManageJobstatus />}
      />
      <Route path="/admin/add-and-manage-user" element={<AddAndManageUser />} />
      <Route path="/admin/wa-brodcast" element={<WaBrodcast />} />

      {/* teamleader */}
      <Route
        path="/teamleader/dashboard/:teamleaderId"
        element={
          <ProtectedRoute
            element={<TeamleaderDashboard />}
            allowedRole="TeamLeader"
          />
        }
      />
      <Route
        path="/teamleader/add-calldetails/:teamleaderId"
        element={<TeamLeaderCallEntry />}
      />
      <Route
        path="/teamleader/edit-calldetails/:teamleaderId/:calldetailsId"
        element={<TeamLeaderEditCallDetails />}
      />
    </Routes>
  );
}

export default App;
