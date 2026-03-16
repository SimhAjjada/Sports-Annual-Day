import { useEffect, useState } from "react";
import API from "../api/api";

const Tournament = () => {
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  const loadEvents = () => {
    API.get("/events").then((res) => setEvents(res.data));
  };

  const loadMatches = () => {
    if (!selectedEvent) return;

    API.get(`/matches?event_id=${selectedEvent}`).then((res) => {
      setMatches(res.data);
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedEvent]);

  // Group matches by round
  const rounds = {};

  matches.forEach((match) => {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tournament Bracket</h1>

      {/* Event selector */}
      <div className="mb-6">
        <select
          className="border p-2 rounded"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedEvent && <p>Select an event to view bracket.</p>}

      {selectedEvent && (
        <div className="flex gap-10 overflow-x-auto">
          {Object.keys(rounds)
            .sort((a, b) => a - b)
            .map((round) => (
              <div key={round} className="min-w-[200px]">
                <h2 className="font-bold mb-3 text-center">
                  Round {round}
                </h2>

                {rounds[round].map((match) => (
                  <div
                    key={match.id}
                    className="border rounded p-2 mb-4 bg-white shadow"
                  >
                    {match.bye_player ? (
                      <div className="text-blue-600 font-semibold text-center">
                        {match.bye_player} → BYE
                      </div>
                    ) : (
                      <>
                        <div
                          className={`p-1 ${
                            match.winner_id === match.team1_id
                              ? "font-bold text-green-600"
                              : ""
                          }`}
                        >
                          {match.player1}
                        </div>

                        <div
                          className={`p-1 ${
                            match.winner_id === match.team2_id
                              ? "font-bold text-green-600"
                              : ""
                          }`}
                        >
                          {match.player2}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Tournament;