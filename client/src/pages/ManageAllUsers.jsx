import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AllUsers from "./AllUsers";

export default function ManageAllUsers() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <AllUsers />
    </div>
  );
}
