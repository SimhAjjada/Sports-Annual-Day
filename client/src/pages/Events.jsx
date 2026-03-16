import { useState, useEffect } from "react";
import API from "../api/api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);

  const loadEvents = () => {
    API.get("/events").then((res) => setEvents(res.data));
  };

  const loadSports = () => {
    API.get("/sports").then((res) => setSports(res.data));
  };

  useEffect(() => {
    loadEvents();
    loadSports();
  }, []);

  const handleSportToggle = (sportId) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter((id) => id !== sportId));
    } else {
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSports.length === 0) {
      alert("Please select at least one sport");
      return;
    }

    try {
      // 1️⃣ create event
      const res = await API.post("/events", {
        name,
        description,
        event_date: eventDate,
      });

      const eventId = res.data.id;

      // 2️⃣ add sports to event
      await API.post(`/events/${eventId}/sports`, {
        sports: selectedSports,
      });

      alert("Event created successfully");

      setName("");
      setDescription("");
      setEventDate("");
      setSelectedSports([]);

      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    await API.delete(`/events/${id}`);
    loadEvents();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Events</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="border p-2 w-full"
          required
        />

        <div>
          <p className="font-semibold mb-1">Select Sports</p>

          {sports.map((sport) => (
            <label key={sport.id} className="block">
              <input
                type="checkbox"
                checked={selectedSports.includes(sport.id)}
                onChange={() => handleSportToggle(sport.id)}
              />{" "}
              {sport.name}
            </label>
          ))}
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Event
        </button>
      </form>

      <h3 className="font-semibold mb-2">Past Events</h3>

      <ul className="space-y-1">
        {events.map((event) => (
          <li key={event.id} className="border p-2 flex justify-between">
            <span>
              <strong>{event.name}</strong> — {event.event_date}
            </span>

            <button
              onClick={() => deleteEvent(event.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;