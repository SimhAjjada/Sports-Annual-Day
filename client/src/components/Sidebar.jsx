import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4">
      <nav className="flex flex-col gap-3">
        <Link to="/" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/register" className="hover:text-blue-600">Register</Link>
        <Link to="/teams" className="hover:text-blue-600">Teams</Link>
        <Link to="/matches" className="hover:text-blue-600">Matches</Link>
        <Link to="/events" className="hover:text-blue-600">Events</Link>
        <Link to="/players" className="hover:text-blue-600">Players</Link>
        <Link to="/tournament" className="hover:text-blue-600">Tournament</Link>
        <Link to="/chat" className="hover:text-blue-600">AI Chat</Link>
      </nav>
    </div>
  );
};

export default Sidebar;