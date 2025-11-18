import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Verify from "./pages/Verify";
import NewLogin from "./pages/NewLogin";
import NewSignupSelection from "./pages/NewSignupSelection";
import NewStudentSignup from "./pages/NewStudentSignup";
import NewFacultySignup from "./pages/NewFacultySignup";
import NewVendorSignup from "./pages/NewVendorSignup";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import VendorDashboard from "./pages/VendorDashboard";
import ApproveWorkshops from "./components/ApproveWorkshops";
import CreateWorkshop from "./pages/CreateWorkshop";
import EditWorkshop from "./pages/EditWorkshop";
import EventOfficerDashboard from "./pages/EventOfficerDashboard";
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProfessorWorkshopParticipants from "./pages/ProfessorWorkshopParticipants";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateGymSession from "./pages/CreateGymSession";
import GymSchedule from "./pages/GymSchedule";
import ApprovedEvents from "./components/ApprovingEvents";
import Events from "./components/Events";
import EventFormPage from "./components/EventFormPage";
import RequestEditForm from "./components/WorkshopEditRequestForm";
import TADashboard from "./pages/TADashboard";
import UpcomingEvents from "./components/UpcomingEvents";
import RegisterForEvent from "./pages/RegisterForEvent";
import MyRegisteredEvents from "./pages/MyRegisteredEvents";
import PaymentSuccess from "./pages/PaymentSuccess";
import GenerateVisitorQR from "./pages/GenerateVisitorQR.jsx";
import CreatePoll from './pages/CreatePoll.jsx';
import Voting from './components/Voting.jsx';
import ViewDocuments from './pages/ViewDocuments.jsx';
import LoyaltyVendors from "./pages/LoyaltyVendors";
import ArchivedEvents from "./pages/ArchivedEvents";
import ManageVendorRequests from "./pages/ManageVendorRequests";
import ManageAllEvents from "./pages/ManageAllEvents";
import ManageAllUsers from "./pages/ManageAllUsers";
import ManageAllComments from "./pages/ManageAllComments";
import CreateAdminOfficer from "./pages/CreateAdminOfficer";
import ManageAdminsOfficers from "./pages/ManageAdminsOfficers";
import ManagePendingUsers from "./pages/ManagePendingUsers";


import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes - New Themed UI */}
        <Route path="/login" element={<NewLogin />} />
        <Route path="/signup-selection" element={<NewSignupSelection />} />
        <Route path="/signup/student" element={<NewStudentSignup />} />
        <Route path="/signup/faculty" element={<NewFacultySignup />} />
        <Route path="/signup/vendor" element={<NewVendorSignup />} />
        
        {/* Old Routes (for backward compatibility) */}
        <Route path="/" element={<NewLogin />} />
        <Route path="/signup" element={<NewSignupSelection />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Event Registration Pages */}
        <Route path="/register-event" element={<RegisterForEvent />} />
        <Route path="/my-registered-events" element={<MyRegisteredEvents />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-admin-officer" element={<CreateAdminOfficer />} />
          <Route path="/admin/manage-admins-officers" element={<ManageAdminsOfficers />} />
          <Route path="/admin/pending-users" element={<ManagePendingUsers />} />
          <Route path="/admin/vendor-requests" element={<ManageVendorRequests />} />
          <Route path="/admin/all-events" element={<ManageAllEvents />} />
          <Route path="/admin/all-users" element={<ManageAllUsers />} />
          <Route path="/admin/all-comments" element={<ManageAllComments />} />
          <Route path="/admin/documents" element={<ViewDocuments />} />
        </Route>

        {/* Event Officer */}
        <Route element={<ProtectedRoute allowedRoles={["eventOfficer"]} />}>
          <Route path="/eventOfficer/dashboard" element={<EventOfficerDashboard />} />
          <Route path="/create-gym-session" element={<CreateGymSession />} />
          <Route path="/gym-schedule" element={<GymSchedule />} />
          <Route path="/approved-events" element={<ApprovedEvents />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create-event" element={<EventFormPage />} />
          <Route path="/eventOfficer/documents" element={<ViewDocuments />} />
          <Route path="/events/:id/edit" element={<EventFormPage />} />
          <Route path="/workshops/:id/request-edit" element={<RequestEditForm />} />
          <Route path="/events/upcoming" element={<UpcomingEvents />} />
          <Route path="/eventOfficer/approveWorkshops" element={<ApproveWorkshops />} />
          <Route path="/polls/create" element={<CreatePoll />} />
          {/* Edit route removed - polls are create-only in this build */}


          {/* NEW PAGES */}
          <Route path="/events/:id/generate-visitor-qr" element={<GenerateVisitorQR />} />
          <Route path="/eventOfficer/archived-events" element={<ArchivedEvents />} />
        </Route>

        {/* Professor */}
        <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
          <Route path="/professor/workshops/new" element={<CreateWorkshop />} />
          <Route path="/professor/workshops/:id/edit" element={<EditWorkshop />} />
          <Route path ="/voting" element={<Voting />} />
          <Route path="/professor/workshops/:id/participants" element={<ProfessorWorkshopParticipants />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} /> 
          <Route path ="/voting" element={<Voting />} />
        </Route>

        {/* Staff */}
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path ="/voting" element={<Voting />} />
        </Route>

        {/* TA */}
        <Route element={<ProtectedRoute allowedRoles={["ta"]} />}>
          <Route path="/ta/dashboard" element={<TADashboard />} />
          <Route path ="/voting" element={<Voting />} />
        </Route>

        {/* Vendor */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        </Route>
        
        {/* Loyalty Vendors Page — accessible to all roles except vendor */}
        <Route element={<ProtectedRoute allowedRoles={[ "student", "staff","ta","professor","eventOfficer","admin" ]} />}>
        <Route path="/loyalty-vendors" element={<LoyaltyVendors />} />
        </Route>


        {/* Payment Success */}
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
