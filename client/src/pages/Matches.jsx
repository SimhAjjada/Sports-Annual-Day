import { useEffect, useState } from "react";
import API from "../api/api";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [selectedSport, setSelectedSport] = useState(null);
  const [champion, setChampion] = useState(null);

  const fetchMatches = () => {
    if (!selectedEvent) return;

    API.get(`/matches?event_id=${selectedEvent}`)
      .then((res) => setMatches(res.data));
  };

  const fetchEvents = () => {
    API.get("/events").then((res) => setEvents(res.data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
  setChampion(null);
  fetchMatches();
}, [selectedEvent]);

  useEffect(() => {
    setChampion(null);
  }, [selectedSport]);

  // Generate matches
  const generateMatches = async (sportId, sportName) => {

  if (!selectedEvent) {
    alert("Please select an event first");
    return;
  }

  // Check if matches already exist for this sport
  const sportMatches = matches.filter(
    (m) => m.sport === sportName
  );

  // If tournament already exists → just load it
  if (sportMatches.length > 0) {
    setSelectedSport(sportName);
    return;
  }

  // Otherwise generate matches
  await API.post("/matches/generate", {
    sport_id: sportId,
    event_id: selectedEvent
  });

  setSelectedSport(sportName);
  setSelectedTeamPlayers([]);
  fetchMatches();
};
  // Show cricket team players
  const showTeamPlayers = async (teamId, name) => {
    const res = await API.get(`/teams/${teamId}/players`);
    setSelectedTeamPlayers(res.data);
    setTeamName(name);
  };

  // Filter matches by selected sport
  const filteredMatches = selectedSport
    ? matches.filter((m) => m.sport === selectedSport)
    : matches;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Match Fixtures</h1>

      {/* Event Selector */}
      <div className="mb-4">
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

      {/* Buttons */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          onClick={() => generateMatches(1, "Cricket")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate Cricket Matches
        </button>

        <button
          onClick={() => generateMatches(2, "Badminton")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Generate Badminton Matches
        </button>

        <button
          onClick={() => generateMatches(3, "Table Tennis")}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Generate TT Matches
        </button>

        {/* Start Round */}
        <button
          onClick={async () => {
            if (!selectedEvent || !selectedSport) {
              alert("Select event and sport first");
              return;
            }

            const sportId =
              selectedSport === "Cricket"
                ? 1
                : selectedSport === "Badminton"
                ? 2
                : selectedSport === "Table Tennis"
                ? 3
                : null;

            await API.post("/matches/start-round", {
              event_id: selectedEvent,
              sport_id: sportId,
              round: 1,
            });

            alert("Round started");
            fetchMatches();
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          Start Round 1
        </button>

        {/* Next Round */}
        <button
          onClick={async () => {
            if (!selectedEvent) {
              alert("Please select an event first");
              return;
            }

            const sportId =
              selectedSport === "Cricket"
                ? 1
                : selectedSport === "Badminton"
                ? 2
                : selectedSport === "Table Tennis"
                ? 3
                : null;

            const res = await API.post("/matches/next-round", {
              sport_id: sportId,
              event_id: selectedEvent,
            });

            if (res.data.champion_id) {
              const finalMatch = matches.find(
                (m) =>
                  m.team1_id === res.data.champion_id ||
                  m.team2_id === res.data.champion_id
              );

              if (finalMatch) {
                const name =
                  finalMatch.team1_id === res.data.champion_id
                    ? finalMatch.player1
                    : finalMatch.player2;

                setChampion(name);
              }
            }

            fetchMatches();
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Generate Next Round
        </button>
        <button
          onClick={async () => {

            if (!selectedEvent) {
              alert("Select event first");
              return;
            }

            if (!window.confirm("Reset tournament? All matches will be deleted.")) {
              return;
            }

            const sportId =
              selectedSport === "Cricket"
                ? 1
                : selectedSport === "Badminton"
                ? 2
                : selectedSport === "Table Tennis"
                ? 3
                : null;

            await API.post("/matches/reset", {
              event_id: selectedEvent,
              sport_id: sportId
            });

            alert("Tournament reset");

            fetchMatches();

          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
        Reset Tournament
        </button>
      </div>

      {/* Champion */}
      {champion && (
        <div className="mt-4 p-4 bg-green-100 border rounded text-lg font-bold text-green-700">
          🏆 Champion: {champion}
        </div>
      )}

      {/* Matches */}
      {filteredMatches.length === 0 ? (
        <p>No matches generated yet.</p>
      ) : (
        filteredMatches.map((match) => (
          <div key={match.id} className="p-3 border rounded mb-2">
            <strong>
              {match.sport} — Round {match.round || 1}
            </strong>{" "}
            :

            {/* BYE Player */}
            {match.bye_player ? (
              <span className="text-blue-700 font-semibold ml-2">
                {match.bye_player} → BYE (Auto Qualified)
              </span>
            ) : match.sport === "Cricket" ? (
              <>
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() =>
                    showTeamPlayers(match.team1_id, match.player1)
                  }
                >
                  {match.player1}
                </span>{" "}
                vs{" "}
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() =>
                    showTeamPlayers(match.team2_id, match.player2)
                  }
                >
                  {match.player2}
                </span>
              </>
            ) : (
              <>
                <span>
                  {match.player1} vs {match.player2}
                </span>

                {match.winner_id ? (
                  <span className="ml-4 text-green-600 font-semibold">
                    Winner:{" "}
                    {match.winner_id === match.team1_id
                      ? match.player1
                      : match.player2}
                  </span>
                ) : (
                  <>
                    <button
                      className="ml-3 text-green-600"
                      onClick={() =>
                        API.post("/matches/winner", {
                          match_id: match.id,
                          winner_id: match.team1_id,
                        }).then(fetchMatches)
                      }
                    >
                      {match.player1} Won
                    </button>

                    <button
                      className="ml-2 text-green-600"
                      onClick={() =>
                        API.post("/matches/winner", {
                          match_id: match.id,
                          winner_id: match.team2_id,
                        }).then(fetchMatches)
                      }
                    >
                      {match.player2} Won
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))
      )}

      {/* Team Players */}
      {selectedTeamPlayers.length > 0 && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-bold mb-2">{teamName} Players</h2>
          <ul className="list-disc ml-5">
            {selectedTeamPlayers.map((p, i) => (
              <li key={i}>{p.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Matches;