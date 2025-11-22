import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminAllComments from "../components/AdminAllComments";

export default function ManageAllComments() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      <AdminAllComments />
    </div>
  );
}
