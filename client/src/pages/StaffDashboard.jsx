import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import AttendedEvents from "./AttendedEvents";
import Voting from "../components/Voting";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Calendar, CheckCircle, Star, Clock, Dumbbell, Store, Heart } from "lucide-react";




const StaffDashboard = () => {
	const [activeTab, setActiveTab] = useState("events");
	const [upcomingEvents, setUpcomingEvents] = useState([]);
	const [favorites, setFavorites] = useState([]);
	const [favSet, setFavSet] = useState(new Set());
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					navigate("/login");
					return;
				}

				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
				const res = await axios.get(`${apiUrl}/api/events/upcoming`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setUpcomingEvents(res.data.events || []);

				const favs = await fetchMyFavorites();
				setFavorites(favs);
				setFavSet(new Set(favs.map((e) => e._id || e.id)));
			} catch (err) {
				console.error("Error fetching staff dashboard data:", err);
				if (err.response?.status === 401) {
					localStorage.removeItem("token");
					navigate("/login");
				}
			}
		};

		fetchEvents();
	}, [navigate]);

	const handleToggleFavorite = (eventId, willBeFav, eventObj) => {
		setFavSet((prev) => {
			const s = new Set(prev);
			if (willBeFav) s.add(eventId);
			else s.delete(eventId);
			return s;
		});

		setFavorites((prev) => {
			if (willBeFav) {
				return prev.some((e) => (e._id || e.id) === eventId)
					? prev
					: [...prev, eventObj];
			}
			return prev.filter((e) => (e._id || e.id) !== eventId);
		});
	};

	const sidebarItems = [
		{ key: "events", label: "Upcoming Events", icon: Calendar, onClick: () => setActiveTab("events") },
		{ key: "registered", label: "My Registered Events", icon: CheckCircle, onClick: () => setActiveTab("registered") },
		{ key: "favorites", label: "Favorites", icon: Star, onClick: () => setActiveTab("favorites") },
		{ key: "attended", label: "Attended Events", icon: Clock, onClick: () => setActiveTab("attended") },
		{ key: "register", label: "Register for Event", icon: Calendar, onClick: () => setActiveTab("register") },
		{ key: "gym", label: "Gym Schedule", icon: Dumbbell, onClick: () => setActiveTab("gym") },
		{ key: "vendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveTab("vendors") },
	  ];
	  

	return (
		<DashboardLayout
			dashboardTitle="Staff Dashboard"
			roleLabel="Staff Member"
			roleColor="bg-green-500"
			sidebarItems={sidebarItems}
			activeKey={activeTab}
		>
			<div className="mt-6">

            {/* ⭐ QUICK ACTIONS (Styled like Event Officer) */}
<Card className="mb-8 shadow-lg">
  <CardHeader>
    <CardTitle className="text-xl">Quick Actions</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

{/* Register for Event */}
<button
      onClick={() => setActiveTab("register")}
      className="p-6 rounded-xl shadow-md bg-blue-400 hover:bg-blue-500 transition flex flex-col items-center gap-3 text-white"
    >
      <Calendar className="w-10 h-10 text-white" />
      <span className="text-lg font-semibold">Register for Event</span>
    </button>

    {/* Gym Sessions */}
    <button
      onClick={() => setActiveTab("gym")}
      className="p-6 rounded-xl shadow-md bg-blue-400 hover:bg-blue-500 transition flex flex-col items-center gap-3 text-white"
    >
      <Dumbbell className="w-10 h-10 text-white" />
      <span className="text-lg font-semibold">Gym Sessions</span>
    </button>

    {/* Loyalty Vendors */}
    <button
      onClick={() => setActiveTab("vendors")}
      className="p-6 rounded-xl shadow-md bg-blue-400 hover:bg-blue-500 transition flex flex-col items-center gap-3 text-white"
    >
      <Store className="w-10 h-10 text-white" />
      <span className="text-lg font-semibold">Loyalty Vendors</span>
    </button>

    </div>
  </CardContent>
</Card>



				{activeTab === "events" && (
					<>
						<UpcomingEvents favoritesSet={favSet} onToggleFavorite={handleToggleFavorite} userRole="student" />
						<Voting />
					</>
				)}

				{activeTab === "registered" && (
					<div className="mt-6"><MyRegisteredEvents /></div>
				)}

				{activeTab === "favorites" && (
					<div className="mt-6">
						<h2 className="text-2xl font-bold text-center mb-4">My Favorites</h2>
						{favorites.length === 0 ? (
							<p className="text-center text-gray-600">No favorite events yet.</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{favorites.map((ev) => {
									const id = ev._id || ev.id;
									return <EventCard key={id} event={ev} userRole="student" isFavorite={favSet.has(id)} onToggleFavorite={handleToggleFavorite} />;
								})}
							</div>
						)}
					</div>
				)}

				{activeTab === "attended" && (
					<div className="mt-6"><AttendedEvents /></div>
				)}

				{activeTab === "register" && (
					<div className="mt-6"><RegisterForEvent /></div>
				)}

				{activeTab === "gym" && (
					<div className="mt-6"><GymSchedule /></div>
				)}

				{activeTab === "vendors" && (
					<div className="mt-6"><a href="/loyalty-vendors" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">View Loyalty Vendors</a></div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default StaffDashboard;
