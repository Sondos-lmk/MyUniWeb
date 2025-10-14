// client/src/pages/TestEventCard.jsx
import EventCard from "../components/EventCard";

export default function TestEventCard() {
  const sampleEvent = {
    _id: "12345",
    title: "Sinai Hiking Trip",
    desc: "Join us for a thrilling 2-day hiking and camping adventure through the Sinai mountains!",
    type: "trip",
    location: "Sinai",
    startDate: "2025-12-20T08:00:00.000Z",
    endDate: "2025-12-21T18:00:00.000Z",
    registrationDeadline: "2025-12-15T23:59:59.000Z",
    price: 1200,
    capacity: 25,
    registeredStudents: Array(12).fill("studentId"),
    status: "approved",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <EventCard event={sampleEvent} />
      </div>
    </div>
  );
}
