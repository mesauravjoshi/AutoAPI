import Home from "@/components/Home";
import SignUp from "@/components/Auth/SignUp";
import LogIn from "@/components/Auth/LogIn";
import Request from "@/pages/Request";
import History from "@/pages/History";
import Collection from "@/pages/Collection";
import Workspace from "@/pages/Workspace";
import WorkspaceList from "@/pages/WorkspaceList";
import MainLayout from "@/layout/MainLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";

function Index() {
  return (
    <Router>
      <Routes>
        {/* pages without layout */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />

        {/* pages WITH layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/request" element={<Request />} />
            <Route path="/history" element={<History />} />
            <Route path="/environments" element={<History />} />
            <Route path="/collections" element={<Collection />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/workspace/list" element={<WorkspaceList />} />
          </Route>
        </Route>

        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </Router>
  );
}

export default Index;
