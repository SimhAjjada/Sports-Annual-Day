const db = require("../config/db");
const generateTeams = require("../services/teamGenerator");

// ✅ Generate cricket teams (event-based)
exports.createTeams = (req, res) => {
  const { numberOfTeams, event_id } = req.body;

  if (!numberOfTeams || !event_id) {
    return res.status(400).json({ error: "numberOfTeams & event_id required" });
  }

  // 🔥 STEP 1: Delete matches
  db.query(
    "DELETE FROM matches WHERE sport_id = 1 AND event_id=?",
    [event_id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error clearing matches" });
      }

      // 🔥 STEP 2: Get existing teams
      db.query(
        "SELECT id FROM teams WHERE sport_id = 1 AND event_id=?",
        [event_id],
        (err2, teamRows) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: "Error fetching teams" });
          }

          const teamIds = teamRows.map((t) => t.id);

          // 🔥 STEP 3: Delete team_players
          const deleteTeamPlayers = (callback) => {
            if (teamIds.length === 0) return callback();

            db.query(
              "DELETE FROM team_players WHERE team_id IN (?)",
              [teamIds],
              (err3) => {
                if (err3) {
                  console.error(err3);
                  return res.status(500).json({ error: "Error clearing team players" });
                }
                callback();
              }
            );
          };

          // 🔥 STEP 4: Delete teams
          const deleteTeams = (callback) => {
            if (teamIds.length === 0) return callback();

            db.query(
              "DELETE FROM teams WHERE id IN (?)",
              [teamIds],
              (err4) => {
                if (err4) {
                  console.error(err4);
                  return res.status(500).json({ error: "Error clearing teams" });
                }
                callback();
              }
            );
          };

          // 🔥 FINAL: Generate new teams
          deleteTeamPlayers(() => {
            deleteTeams(() => {
              generateNewTeams();
            });
          });

          // 🔥 TEAM GENERATION LOGIC
          function generateNewTeams() {
            const query =
              "SELECT * FROM participants WHERE sport_id = 1 AND event_id = ?";

            db.query(query, [event_id], (err5, players) => {
              if (err5) {
                console.error(err5);
                return res.status(500).json({ error: "Database error" });
              }

              if (players.length === 0) {
                return res.status(400).json({ error: "No cricket players found" });
              }

              const teams = generateTeams(players, numberOfTeams);

              let insertedTeams = 0;

              teams.forEach((team, index) => {
                const teamName = `Team ${index + 1}`;

                db.query(
                  "INSERT INTO teams (name, sport_id, event_id) VALUES (?, 1, ?)",
                  [teamName, event_id],
                  (err6, result) => {
                    if (err6) {
                      console.error(err6);
                      return;
                    }

                    const teamId = result.insertId;

                    // insert players
                    team.forEach((player) => {
                      db.query(
                        "INSERT INTO team_players (team_id, participant_id) VALUES (?, ?)",
                        [teamId, player.id],
                        (err7) => {
                          if (err7) console.error(err7);
                        }
                      );
                    });

                    insertedTeams++;

                    // ✅ send response only after all teams inserted
                    if (insertedTeams === teams.length) {
                      res.json({ message: "Teams generated successfully" });
                    }
                  }
                );
              });
            });
          }
        }
      );
    }
  );
};

// ✅ Get all teams (event-based)
exports.getTeams = (req, res) => {
  const { event_id } = req.query;

  if (!event_id) {
    return res.status(400).json({ error: "event_id required" });
  }

  const query = `
    SELECT teams.id AS team_id, teams.name AS team_name, participants.name AS player_name
    FROM teams
    JOIN team_players ON teams.id = team_players.team_id
    JOIN participants ON participants.id = team_players.participant_id
    WHERE teams.sport_id = 1 AND teams.event_id = ?
    ORDER BY teams.id
  `;

  db.query(query, [event_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};

// ✅ Get players of a specific team
exports.getTeamPlayers = (req, res) => {
  const teamId = req.params.id;

  const query = `
    SELECT participants.name
    FROM team_players
    JOIN participants ON team_players.participant_id = participants.id
    WHERE team_players.team_id = ?
  `;

  db.query(query, [teamId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json(results);
  });
};

exports.getAllTeams = (req, res) => {
  const query = `
    SELECT teams.id AS team_id
    FROM teams
    WHERE teams.sport_id = 1
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};