// client/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";

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
        <Link to="/events" className="text-base font-bold text-slate-900">
          Innovex
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link to="/events" className={active("/events")}>Events</Link>
          {token && (
            <>
              <Link to="/my-applications" className={active("/my-applications")}>
                My Applications
              </Link>
              <Link to="/my-events" className={active("/my-events")}>
                My Events
              </Link>
              {role === "eventOfficer" && (
                <Link to="/create-trip" className={active("/create-trip")}>
                  Create Trip
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
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
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm"
            >
              Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
