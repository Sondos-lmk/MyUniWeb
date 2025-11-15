import { Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import VendorDashboard from "./pages/VendorDashboard";
import SignupSelection from "./pages/SignupSelection";
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
import Favorites from "./pages/Favorites.jsx";

import "./App.css";
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
import LoyaltyVendors from "./pages/LoyaltyVendors";
import ArchivedEvents from "./pages/ArchivedEvents";
import AttendedEvents from "./pages/AttendedEvents.jsx";




import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignupSelection />} />
        <Route path="/signup/student" element={<Signup role="student" />} />
        <Route path="/signup/faculty" element={<Signup role="faculty" />} />
        <Route path="/signup/vendor" element={<Signup role="vendor" />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Event Registration Pages */}
        <Route path="/register-event" element={<RegisterForEvent />} />
        <Route path="/my-registered-events" element={<MyRegisteredEvents />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Event Officer */}
        <Route element={<ProtectedRoute allowedRoles={["eventOfficer"]} />}>
          <Route path="/eventOfficer/dashboard" element={<EventOfficerDashboard />} />
          <Route path="/create-gym-session" element={<CreateGymSession />} />
          <Route path="/gym-schedule" element={<GymSchedule />} />
          <Route path="/approved-events" element={<ApprovedEvents />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create-event" element={<EventFormPage />} />
          <Route path="/events/:id/edit" element={<EventFormPage />} />
          <Route path="/workshops/:id/request-edit" element={<RequestEditForm />} />
          <Route path="/events/upcoming" element={<UpcomingEvents />} />
          <Route path="/eventOfficer/approveWorkshops" element={<ApproveWorkshops />} />

          {/* NEW PAGES */}
          <Route path="/events/:id/generate-visitor-qr" element={<GenerateVisitorQR />} />
          <Route path="/eventOfficer/archived-events" element={<ArchivedEvents />} />
        </Route>

        {/* Professor */}
        <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
          <Route path="/professor/workshops/new" element={<CreateWorkshop />} />
          <Route path="/professor/workshops/:id/edit" element={<EditWorkshop />} />
          <Route path="/professor/workshops/:id/participants" element={<ProfessorWorkshopParticipants />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Staff */}
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          
        </Route>

        {/* TA */}
        <Route element={<ProtectedRoute allowedRoles={["ta"]} />}>
          <Route path="/ta/dashboard" element={<TADashboard />} />
          
        </Route>
        <Route
  path="/favorites"
  element={
    <ProtectedRoute roles={['student','staff','ta','professor']}>
      <Favorites />
    </ProtectedRoute>
  }
/>


        <Route element={<ProtectedRoute allowedRoles={["student", "staff", "ta", "professor"]} />}>
  <Route path="/attended-events" element={<AttendedEvents />} />
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
