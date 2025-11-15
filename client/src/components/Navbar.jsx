// client/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";




export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const active = (path) =>
    pathname.startsWith(path)
      ? "text-slate-900 font-semibold"
      : "text-slate-600 hover:text-slate-900";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* INNOVEX (not clickable) */}
        <span className="text-base font-bold text-slate-900 select-none cursor-default">
          Innovex
        </span>

        <div className="hidden sm:flex items-center gap-6 text-sm">
          {/* Navigate to upcoming events */}
          {/* <Link to="/events" className={active("/events")}>
            Events
          </Link> */}
         

          {token && (
            <>
              {/* ✅ Vendor Requests */}
              <Link to="/approved-events" className={active("/approved-events")}>
                Vendor Requests
              </Link>

              {/* ✅ All Events */}
              <Link to="/events" className={active("/events")}>
                Events
              </Link>
              

              {/* ✅ Event Officer Only Links */}
              {role === "eventOfficer" && (
                <>
                  <Link to="/create-event" className={active("/create-event")}>
                    Create Event
                  </Link>

                  {/* ✅ NEW Approve Workshops Link */}
                  <Link
                    to="/eventOfficer/approveWorkshops"
                    className={active("/eventOfficer/approveWorkshops")}
                  >
                    Approve Workshops
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Show notifications bell for all logged-in non-vendor roles */}
          {token && role !== "vendor" && <NotificationBell />}


          {!token ? (
            <>
              <Link
                to="/signup"
                className="hidden sm:inline-block px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
              >
                Sign up
              </Link>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm"
              >
                Log in
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
            >
              Log out
            </button>
            
          )}
        </div>
      </nav>
    </header>
  );
}
