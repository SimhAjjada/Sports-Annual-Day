

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

  // 🔥 NEW STATES
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState({
    match_id: "",
    score1: "",
    score2: "",
    notes: ""
  });

  const fetchMatches = async () => {
  if (!selectedEvent) return;

  try {
    const res = await API.get(`/matches?event_id=${selectedEvent}`);
    setMatches(res.data);
  } catch (err) {
    console.error(err);
  }
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

  // 🔥 MATCH CONTROL FUNCTIONS
  const startMatch = async (id) => {
    await API.post("/matches/start", { match_id: id });
    fetchMatches();
  };

  const pauseMatch = async (id) => {
    try {
      await API.post("/matches/pause", { match_id: id });

      console.log("Paused match:", id); // ✅ DEBUG

      fetchMatches(); // 🔥 IMPORTANT (without this UI won’t update)

    } catch (err) {
      console.error("Pause error:", err);
    }
  };

  const resumeMatch = async (id) => {
    await API.post("/matches/resume", { match_id: id });
    fetchMatches();
  };

  // REPORT
  const openReportModal = (match) => {
    setReportData({
      match_id: match.id,
      score1: "",
      score2: "",
      notes: ""
    });
    setShowModal(true);
  };

  const submitReport = async () => {
    await API.post("/matches/report", reportData);
    setShowModal(false);
    fetchMatches();
  };

  // Generate matches
 const generateMatches = async (sportId, sportName) => {
  console.log("generateMatches function started");
  if (!selectedEvent) {
    alert("Please select an event first");
    console.log("Selected Event:", selectedEvent);
    return;
  }

  try {
    const sportMatches = matches.filter(
      (m) => m.sport === sportName
    );

    // 🔥 Handle existing matches
    if (sportMatches.length > 0) {
      const confirmReset = window.confirm(
        "Matches already exist. Do you want to regenerate?"
      );

      if (!confirmReset) {
        setSelectedSport(sportName);
        return;
      }

      await API.post("/matches/reset", {
        event_id: selectedEvent,
        sport_id: sportId
      });
    }

    // 🔥 Generate matches
    console.log("Calling API...");
    const res = await API.post("/matches/generate", {
  sport_id: sportId,
  event_id: selectedEvent
});

console.log("API RESPONSE:", res);

    // 🔥 IMPORTANT: wait for updated data
    setSelectedSport(sportName);
    setSelectedTeamPlayers([]);
    await fetchMatches(); // 🔥 ensure refresh

  } catch (err) {
    console.error("Error generating matches:", err);
  }
};



  const showTeamPlayers = async (teamId, name) => {
    const res = await API.get(`/teams/${teamId}/players`);
    setSelectedTeamPlayers(res.data);
    setTeamName(name);
  };


  // ✅ FIRST define filteredMatches
  const filteredMatches = selectedSport
    ? matches.filter((m) => m.sport === selectedSport)
    : matches;

  // ✅ THEN define currentRound
  const currentRound = filteredMatches.length
    ? Math.max(...filteredMatches.map((m) => m.round || 1))
    : 1;


    // 🔥 ADD THIS BLOCK (DO NOT MISS)
  const currentRoundMatches = filteredMatches.filter(
    (m) => m.round === currentRound
  );

  const hasMatches = filteredMatches.length > 0;

  // 🔥 FIX: only check ongoing (ignore completed BYE)
  const isCurrentRoundStarted = currentRoundMatches.some(
    (m) => m.status === "ongoing"
  );

  // 🔥 FIX: ignore BYE matches
  const playableMatches = currentRoundMatches.filter(
    (m) => !m.bye_player
  );

  const isCurrentRoundCompleted =
    playableMatches.length > 0 &&
    playableMatches.every((m) => m.status === "completed");
  

  const groupedMatches = filteredMatches.reduce((acc, match) => {
  const round = match.round || 1;

  if (!acc[round]) acc[round] = [];
  acc[round].push(match);

  return acc;
  }, {});
  
return (
  <div>
    <h1 className="text-2xl font-bold mb-4">Match Fixtures</h1>

    {/* Event Selector */}
    <select
      className="border p-2 rounded mb-4"
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

    {/* Sport Selector */}
    <select
      className="border p-2 rounded mb-4 ml-2"
      value={selectedSport || ""}
      onChange={(e) => setSelectedSport(e.target.value)}
    >
      <option value="">Select Sport</option>
      <option value="Cricket">Cricket</option>
      <option value="Badminton">Badminton</option>
      <option value="Table Tennis">Table Tennis</option>
    </select>

    {/* 🔥 SMART BUTTON LOGIC */}
    <div className="mb-6 p-4 bg-white shadow-md rounded-xl flex flex-wrap gap-3 items-center">

  {/* ✅ Generate */}
  {!hasMatches && (
    <button
      onClick={() => {
        if (!selectedEvent || !selectedSport) {
          alert("Select event & sport first");
          return;
        }

        const sportId =
          selectedSport === "Cricket"
            ? 1
            : selectedSport === "Badminton"
            ? 2
            : 3;

        generateMatches(sportId, selectedSport);
      }}
      className="bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transition text-white px-5 py-2 rounded-lg shadow"
    >
      ⚡ Generate Tournament
    </button>
  )}

  {/* ✅ Start Round */}
  {hasMatches && !isCurrentRoundStarted && (
    <button
      onClick={async () => {
        const sportId =
          selectedSport === "Cricket"
            ? 1
            : selectedSport === "Badminton"
            ? 2
            : 3;

        await API.post("/matches/start-round", {
          event_id: selectedEvent,
          sport_id: sportId,
          round: currentRound,
        });

        fetchMatches();
      }}
      className="bg-gradient-to-r from-orange-500 to-orange-700 hover:scale-105 transition text-white px-5 py-2 rounded-lg shadow"
    >
      ▶ Start Round {currentRound}
    </button>
  )}

  {/* ✅ Next Round */}
  {isCurrentRoundCompleted && (
    <button
      onClick={async () => {
        const sportId =
          selectedSport === "Cricket"
            ? 1
            : selectedSport === "Badminton"
            ? 2
            : 3;

        await API.post("/matches/next-round", {
          sport_id: sportId,
          event_id: selectedEvent,
        });

        fetchMatches();
      }}
      className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:scale-105 transition text-white px-5 py-2 rounded-lg shadow"
    >
      ⏭ Next Round
    </button>
  )}

  {/* ✅ Reset */}
  {hasMatches && (
    <button
      onClick={async () => {
        if (!window.confirm("Reset tournament?")) return;

        const sportId =
          selectedSport === "Cricket"
            ? 1
            : selectedSport === "Badminton"
            ? 2
            : 3;

        await API.post("/matches/reset", {
          event_id: selectedEvent,
          sport_id: sportId,
        });

        fetchMatches();
      }}
      className="bg-gradient-to-r from-red-500 to-red-700 hover:scale-105 transition text-white px-5 py-2 rounded-lg shadow"
    >
      🔄 Reset
    </button>
  )}

</div>

    {/* Champion */}
    {champion && (
      <div className="bg-green-100 p-3 rounded mb-4">
        🏆 Champion: {champion}
      </div>
    )}

    {/* Matches */}
    {filteredMatches.length === 0 ? (
      <p>No matches generated yet.</p>
    ) : (
      Object.keys(groupedMatches).map((round) => (
        <div key={round} className="mb-4">
          <h2 className="font-bold text-lg mb-2">
            🔵 Round {round}
          </h2>

          {groupedMatches[round].map((match) => (
            <div key={match.id} className="p-3 border rounded mb-2">

              <strong>{match.sport}</strong> :

              {match.bye_player ? (
                <span className="text-blue-600 ml-2">
                  {match.bye_player} → BYE
                </span>
              ) : (
                <>
                  <span className="ml-2">
                    {match.player1} vs {match.player2}
                  </span>

                  {match.status === "pending" && (
                    <p className="text-gray-500 ml-2">
                      ⛔ Round not started
                    </p>
                  )}

                  {match.status === "completed" && (
                    <span className="ml-3 text-green-600">
                      Winner: {
                        match.winner_id === match.team1_id
                          ? match.player1
                          : match.player2
                      }
                    </span>
                  )}

                  <div className="flex gap-2 mt-2">

                    {match.status === "ready" && (
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => startMatch(match.id)}
                      >
                        Start
                      </button>
                    )}

                    {match.status === "ongoing" && (
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                        onClick={() => pauseMatch(match.id)}
                      >
                        Pause
                      </button>
                    )}

                    {match.status === "paused" && (
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => resumeMatch(match.id)}
                      >
                        Resume
                      </button>
                    )}

                    {(match.status === "ongoing" || match.status === "paused") && (
                      <button
                        className="bg-purple-600 text-white px-2 py-1 rounded"
                        onClick={() => openReportModal(match)}
                      >
                        Add Report
                      </button>
                    )}

                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      ))
    )}

    {/* REPORT MODAL (UNCHANGED) */}
    {showModal && (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-5 rounded w-80">

          <h2 className="font-bold mb-2">Match Report</h2>

          <input
            type="number"
            placeholder="Score 1"
            className="border p-1 w-full mb-2"
            onChange={(e) => setReportData({ ...reportData, score1: e.target.value })}
          />

          <input
            type="number"
            placeholder="Score 2"
            className="border p-1 w-full mb-2"
            onChange={(e) => setReportData({ ...reportData, score2: e.target.value })}
          />

          <textarea
            placeholder="Notes"
            className="border p-1 w-full mb-2"
            onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
          />

          <button
            className="bg-green-600 text-white px-3 py-1 rounded mr-2"
            onClick={submitReport}
          >
            Submit
          </button>

          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

        </div>
      </div>
    )}
  </div>
)
};

export default Matches;