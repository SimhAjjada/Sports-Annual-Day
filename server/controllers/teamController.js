const db = require("../config/db");
const generateTeams = require("../services/teamGenerator");

// Generate cricket teams
exports.createTeams = (req, res) => {
  const { numberOfTeams } = req.body;

  if (!numberOfTeams) {
    return res.status(400).json({ error: "Number of teams required" });
  }

  // Step 1: Clear old data safely
  db.query("DELETE FROM matches WHERE sport_id = 1", (err) => {
    if (err) return res.status(500).json({ error: "Error clearing matches" });

    db.query("DELETE FROM team_players", (err) => {
      if (err) return res.status(500).json({ error: "Error clearing team players" });

      db.query("DELETE FROM teams WHERE sport_id = 1", (err) => {
        if (err) return res.status(500).json({ error: "Error clearing teams" });

        // Step 2: Get cricket players
        const query = "SELECT * FROM participants WHERE sport_id = 1";

        db.query(query, (err, players) => {
          if (err) return res.status(500).json({ error: "Database error" });

          if (players.length === 0) {
            return res.status(400).json({ error: "No cricket players found" });
          }

          const teams = generateTeams(players, numberOfTeams);

          // Step 3: Insert new teams
          teams.forEach((team, index) => {
            const teamName = `Team ${index + 1}`;

            db.query(
              "INSERT INTO teams (name, sport_id) VALUES (?, 1)",
              [teamName],
              (err, result) => {
                if (err) {
                  console.error(err);
                  return;
                }

                const teamId = result.insertId;

                // Step 4: Assign players to teams
                team.forEach((player) => {
                  db.query(
                    "INSERT INTO team_players (team_id, participant_id) VALUES (?, ?)",
                    [teamId, player.id],
                    (err) => {
                      if (err) console.error(err);
                    }
                  );
                });
              }
            );
          });

          res.json({ message: "Teams regenerated successfully" });
        });
      });
    });
  });
};

// Get all teams with players
exports.getTeams = (req, res) => {
  const query = `
    SELECT teams.id AS team_id, teams.name AS team_name, participants.name AS player_name
    FROM teams
    JOIN team_players ON teams.id = team_players.team_id
    JOIN participants ON participants.id = team_players.participant_id
    WHERE teams.sport_id = 1
    ORDER BY teams.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};

// Get players of a specific team
exports.getTeamPlayers = (req, res) => {
  const teamId = req.params.id;

  const query = `
    SELECT participants.name
    FROM team_players
    JOIN participants ON team_players.participant_id = participants.id
    WHERE team_players.team_id = ?
  `;

  db.query(query, [teamId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    res.json(results);
  });
};