import { useEffect, useState } from "react";
import API from "../api/api";

const Tournament = () => {
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedSport, setSelectedSport] = useState("");

  // Load events
  const loadEvents = () => {
    API.get("/events").then((res) => setEvents(res.data));
  };

  // Load matches
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

  // ✅ Filter by sport
  const filteredMatches = selectedSport
    ? matches.filter((m) => m.sport === selectedSport)
    : [];

  // ✅ Group by round
  const rounds = {};
  filteredMatches.forEach((match) => {
    const round = match.round || 1;

    if (!rounds[round]) {
      rounds[round] = [];
    }
    rounds[round].push(match);
  });

  return (
    <div>
      {/* 🔥 Dynamic Title */}
      <h1 className="text-2xl font-bold mb-4">
        {selectedSport
          ? `${selectedSport} Tournament Bracket`
          : "Tournament Bracket"}
      </h1>

      {/* 🔽 Selectors */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {/* Event */}
        <select
          className="border p-2 rounded"
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            setSelectedSport(""); // reset sport when event changes
          }}
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        {/* Sport */}
        <select
          className="border p-2 rounded"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          disabled={!selectedEvent}
        >
          <option value="">Select Sport</option>
          <option value="Cricket">Cricket</option>
          <option value="Badminton">Badminton</option>
          <option value="Table Tennis">Table Tennis</option>
        </select>
      </div>

      {/* 🧠 Empty States */}
      {!selectedEvent && (
        <p className="text-gray-500">
          Please select an event to view tournament.
        </p>
      )}

      {selectedEvent && !selectedSport && (
        <p className="text-gray-500">
          Please select a sport to view bracket.
        </p>
      )}

      {/* 🏆 Bracket */}
      {selectedEvent && selectedSport && (
        <>
          {filteredMatches.length === 0 ? (
            <p className="text-gray-500">
              No matches found for this sport.
            </p>
          ) : (
            <div className="flex gap-8 overflow-x-auto">
              {Object.keys(rounds)
                .sort((a, b) => a - b)
                .map((round) => (
                  <div key={round} className="min-w-[220px]">
                    <h2 className="font-bold mb-3 text-center text-lg">
                      Round {round}
                    </h2>

                    {rounds[round].map((match) => (
                      <div
                        key={match.id}
                        className="border rounded p-3 mb-4 bg-white shadow-sm hover:shadow-md transition"
                      >
                        {/* BYE */}
                        {match.bye_player ? (
                          <div className="text-blue-600 font-semibold text-center">
                            {match.bye_player} → BYE
                          </div>
                        ) : (
                          <>
                            {/* Player 1 */}
                            <div
                              className={`p-1 ${
                                match.winner_id === match.team1_id
                                  ? "font-bold text-green-600"
                                  : ""
                              }`}
                            >
                              {match.player1}
                            </div>

                            {/* Player 2 */}
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
        </>
      )}
    </div>
  );
};

export default Tournament; 