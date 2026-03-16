import { useState, useEffect } from "react";
import API from "../api/api";

const Register = () => {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [sportId, setSportId] = useState("");

  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);

  // Load events
  useEffect(() => {
    API.get("/events").then((res) => {
      setEvents(res.data);
    });
  }, []);

  // When event changes → load sports for that event
  const handleEventChange = async (id) => {
  setEventId(id);
  setSportId("");

  if (!id) {
    setSports([]);
    return;
  }

  try {
    const res = await API.get(`/events/${id}/sports`);
    console.log("Sports response:", res.data);
    setSports(res.data);
  } catch (err) {
    console.error("Error loading sports:", err);
    setSports([]);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !eventId || !sportId) {
      alert("Please fill all fields");
      return;
    }

    await API.post("/participants", {
      name,
      sport_id: sportId,
      event_id: eventId,
    });

    alert("Player registered!");

    setName("");
    setEventId("");
    setSportId("");
    setSports([]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Register Player</h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          type="text"
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />

        {/* Event Dropdown */}
        <select
          value={eventId}
          onChange={(e) => handleEventChange(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select Event</option>

          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        {/* Sports Dropdown */}
        <select
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select Sport</option>

          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Register
        </button>

      </form>
    </div>
  );
};

export default Register;