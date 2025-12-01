import React, { useEffect, useState } from "react";
import API from "../services/api";
import ModernAlert from "./ui/ModernAlert";

const AdminAllComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [confirmAction, setConfirmAction] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const fetchComments = async () => {
    try {
      const res = await API.get("/events/all-comments");
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, commentId) => {
    setConfirmAction({
      message: "Delete this comment?",
      onConfirm: async () => {
        try {
          await API.delete(`/events/${eventId}/comments/${commentId}`);
          setComments((prev) =>
            prev.filter((c) => c.commentId !== commentId)
          );
        } catch (err) {
          console.error("Delete error:", err);
          showAlert("Failed to delete comment", "error");
        }
        setConfirmAction(null);
      }
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  if (loading) return <p>Loading comments...</p>;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Events Reviews</h2>

      {comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Event</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Comment</th>
                <th className="p-2 border">Rating</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.commentId} className="text-center">
                  <td className="p-2 border">{c.eventTitle}</td>
                  <td className="p-2 border">
                    {c.eventType
                      ? c.eventType.charAt(0).toUpperCase() + c.eventType.slice(1)
                      : "—"}
                  </td>
                  <td className="p-2 border">
                    {c.user?.name || "Unknown"} ({c.user?.email})
                  </td>
                  <td className="p-2 border text-left">{c.text}</td>
                  <td className="p-2 border">
                    {typeof c.rating === "number" ? `${c.rating} / 5` : "—"}
                  </td>
                  <td className="p-2 border">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDelete(c.eventId, c.commentId)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete Comment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {alertMessage && (
        <ModernAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ModernAlert
          message={confirmAction.message}
          type="error"
          isConfirm={true}
          onConfirm={confirmAction.onConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default AdminAllComments;
