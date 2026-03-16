import { useEffect, useState } from "react";
import API from "../api/api";

const Teams = () => {
  const [teams, setTeams] = useState([]);

  const fetchTeams = () => {
    API.get("/teams")
      .then((res) => setTeams(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const generateTeams = async () => {
    await API.post("/teams/generate", { numberOfTeams: 2 });
    fetchTeams(); // refresh teams
  };

  const groupedTeams = teams.reduce((acc, player) => {
    if (!acc[player.team_name]) acc[player.team_name] = [];
    acc[player.team_name].push(player.player_name);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cricket Teams</h1>

      <button
        onClick={generateTeams}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Teams
      </button>

      {Object.keys(groupedTeams).length === 0 ? (
        <p>No teams generated yet.</p>
      ) : (
        Object.entries(groupedTeams).map(([team, players]) => (
          <div key={team} className="mb-4 p-4 border rounded">
            <h2 className="font-semibold text-lg mb-2">{team}</h2>
            <ul className="list-disc ml-5">
              {players.map((player, index) => (
                <li key={index}>{player}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Teams;