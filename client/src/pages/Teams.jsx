import { useEffect, useState } from "react";
import API from "../api/api";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);

  // 🔥 Fetch events
  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Fetch teams (event-based)
  const fetchTeams = async () => {
    if (!selectedEvent) return;

    try {
      const res = await API.get(`/teams?event_id=${selectedEvent}`);
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Load events on page load
  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔥 Load teams when event changes
  useEffect(() => {
    fetchTeams();
  }, [selectedEvent]);

  // 🔥 Generate teams
  const generateTeams = async () => {
    if (!selectedEvent) {
      alert("Please select an event first");
      return;
    }

    try {
      await API.post("/teams/generate", {
        numberOfTeams: 2,
        event_id: selectedEvent,
      });

      fetchTeams(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Group teams
  const groupedTeams = teams.reduce((acc, player) => {
    if (!acc[player.team_name]) acc[player.team_name] = [];
    acc[player.team_name].push(player.player_name);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cricket Teams</h1>

      {/* 🔥 Event Dropdown */}
      <div className="mb-4">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 Generate Button */}
      <button
        onClick={generateTeams}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Teams
      </button>

      {/* 🔥 Teams Display */}
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