import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import VendorRequestsAdmin from "../components/VendorRequestsAdmin";

export default function ManageVendorRequests() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <VendorRequestsAdmin />
    </div>
  );
}
