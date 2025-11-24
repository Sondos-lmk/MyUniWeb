import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminAllComments from "../components/AdminAllComments";

export default function ManageAllComments() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <AdminAllComments />
    </div>
  );
}
