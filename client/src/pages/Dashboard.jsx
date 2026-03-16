import { useEffect, useState } from "react";
import API from "../api/api";

const Dashboard = () => {
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    API.get("/participants").then((res) => setParticipants(res.data));
    API.get("/teams").then((res) => setTeams(res.data));
    API.get("/matches").then((res) => setMatches(res.data));
  }, []);

  const teamCount = new Set(teams.map((t) => t.team_id)).size;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Participants</h2>
          <p className="text-2xl">{participants.length}</p>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Teams</h2>
          <p className="text-2xl">{teamCount}</p>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Matches</h2>
          <p className="text-2xl">{matches.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;