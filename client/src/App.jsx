import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import ApproveWorkshops from "./components/ApproveWorkshops";

import CreateWorkshop from "./pages/CreateWorkshop";
import EditWorkshop from "./pages/EditWorkshop";
import EventOfficerDashboard from "./pages/EventOfficerDashboard";
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from "./components/ProtectedRoute";
import CreateGymSession from "./pages/CreateGymSession";
import GymSchedule from "./pages/GymSchedule";
import Favorites from "./pages/Favorites.jsx";

import "./App.css";
import ApprovedEvents from "./components/ApprovingEvents";
import Events from "./components/Events"
import EventFormPage from "./components/EventFormPage";
import RequestEditForm from './components/WorkshopEditRequestForm';
import TADashboard from './pages/TADashboard';
import UpcomingEvents from './components/UpcomingEvents';
import AttendedEvents from "./pages/AttendedEvents.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Event Officer routes */}
        <Route element={<ProtectedRoute allowedRoles={["eventOfficer"]} />}>
          <Route path="/eventOfficer/dashboard" element={<EventOfficerDashboard />} />
          <Route path="/create-gym-session" element={<CreateGymSession />} />
          <Route path="/gym-schedule" element={<GymSchedule />} /> 
          <Route path="/approved-events" element={<ApprovedEvents />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create-event" element={<EventFormPage />} />
          <Route path="/events/:id/edit" element={<EventFormPage />} />
          <Route path="/workshops/:id/request-edit" element={<RequestEditForm />}/>
          <Route path="/events/upcoming" element={<UpcomingEvents />}/>
          <Route path="/eventOfficer/approveWorkshops" element={<ApproveWorkshops />} />
        </Route>
      
        {/* Professor-only routes (your feature) */}
        <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
          <Route path="/professor/workshops/new" element={<CreateWorkshop />} />
          <Route path="/professor/workshops/:id/edit" element={<EditWorkshop />} />
          
        </Route>

        {/*Student-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} /> 
          
        </Route>

        {/*Staff-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          
        </Route>

        {/*TA-only routes */}
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


        {/* General user dashboard (vendors, TAs, professors) */}
        <Route element={<ProtectedRoute allowedRoles={["vendor", "professor"]} />}> {/*you removed student from here */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes> 

    </div>
  );
}

export default App;
