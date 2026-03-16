import { useState, useEffect } from "react";
import API from "../api/api";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedSport, setSelectedSport] = useState("");

  const loadPlayers = () => {
    API.get("/participants").then((res) => setPlayers(res.data));
  };

  useEffect(() => {
    loadPlayers();
    API.get("/events").then((res) => setEvents(res.data));
    API.get("/sports").then((res) => setSports(res.data));
  }, []);

  const deletePlayer = async (id) => {
    await API.delete(`/participants/${id}`);
    loadPlayers();
  };

  const updatePlayer = async (id, name) => {
    const newName = prompt("Enter new name:", name);
    if (newName) {
      await API.put(`/participants/${id}`, { name: newName });
      loadPlayers();
    }
  };

  const filteredPlayers = players.filter((p) => {
    return (
      (!selectedEvent || p.event === selectedEvent) &&
      (!selectedSport || p.sport === selectedSport)
    );
  });

  return (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Players</h2>

    {/* Filters */}
    <div className="flex gap-4 mb-4">
      <select
        className="border p-2 rounded"
        onChange={(e) => setSelectedEvent(e.target.value)}
      >
        <option value="">All Events</option>
        {events.map((e) => (
          <option key={e.id}>{e.name}</option>
        ))}
      </select>

      <select
        className="border p-2 rounded"
        onChange={(e) => setSelectedSport(e.target.value)}
      >
        <option value="">All Sports</option>
        {sports.map((s) => (
          <option key={s.id}>{s.name}</option>
        ))}
      </select>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Event</th>
            <th className="p-3 border">Sport</th>
            <th className="p-3 border w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredPlayers.map((p) => (
            <tr key={p.id} className="border">
              <td className="p-3 border">{p.name}</td>
              <td className="p-3 border">{p.event || "-"}</td>
              <td className="p-3 border">{p.sport}</td>
              <td className="p-3 border">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => updatePlayer(p.id, p.name)}
                >
                  Edit
                </button>
                <button
                  className="ml-3 text-red-600 hover:underline"
                  onClick={() => deletePlayer(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default Players;