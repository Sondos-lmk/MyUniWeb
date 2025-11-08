import React, { useState } from "react";
import { addFavorite, removeFavorite } from "../services/api";
import { Heart } from "lucide-react"; // or use FontAwesome / any other

export default function FavoriteButton({ eventId, isFavorited, onChange }) {
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(eventId);
        onChange?.(false);
      } else {
        await addFavorite(eventId);
        onChange?.(true);
      }
    } catch (e) {
      console.error("Favorite toggle failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="transition hover:scale-110"
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 ${
          isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
}
