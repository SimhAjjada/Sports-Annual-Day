const db = require("../config/db");

//
// 🟢 Generate Matches
//
const generateMatches = (req, res) => {
  const { sport_id, event_id } = req.body;

  if (!sport_id || !event_id) {
    return res.status(400).json({ error: "sport_id and event_id required" });
  }

  // Always clear old matches for this event + sport
  db.query(
    "DELETE FROM matches WHERE sport_id=? AND event_id=?",
    [sport_id, event_id],
    (err) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error clearing matches" });
      }

      // continue existing logic
      // 🏏 Cricket → Team vs Team
      // 🏏 Cricket → Team vs Team
if (sport_id === 1) {

  db.query(
    "SELECT id FROM teams WHERE sport_id = 1 AND event_id = ?", // ✅ FIXED
    [event_id],
    (err2, teams) => {

      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "DB error" });
      }

      if (teams.length < 2) {
        return res.json({ message: "Not enough teams" });
      }

      // 🔥 NO NEED TO SHUFFLE FOR 2 TEAMS
      const matches = [];
      let byeTeam = null;

      // Handle odd teams
      if (teams.length % 2 === 1) {
        byeTeam = teams.pop();
      }

      // 🔥 MAIN FIX: STRICT PAIRING
      for (let i = 0; i < teams.length; i += 2) {

        if (!teams[i + 1]) break;

        const t1 = teams[i].id;
        const t2 = teams[i + 1].id;

        matches.push([
          event_id,
          sport_id,
          t1,
          t2,
          1,
          "pending"
        ]);
      }

      console.log("Generated matches:", matches);

      // ❗ SAFETY CHECK
      if (matches.length === 0) {
        return res.json({ message: "No matches generated" });
      }

      db.query(
        "INSERT INTO matches (event_id, sport_id, team1_id, team2_id, round, status) VALUES ?",
        [matches],
        (err3) => {

          if (err3) {
            console.error(err3);
            return res.status(500).json({ error: "Insert error" });
          }

          // Handle BYE
          if (byeTeam) {
            db.query(
              "INSERT INTO matches (event_id, sport_id, bye_player_id, round, status, winner_id) VALUES (?, ?, ?, 1, 'completed', ?)",
              [event_id, sport_id, byeTeam.id, byeTeam.id]
            );
          }

          res.json({ message: "Cricket matches generated" });

        }
      );
    }
  );
}

      // 🏸 Badminton / 🏓 TT
      else {

        db.query(
          "SELECT id FROM participants WHERE sport_id=? AND event_id=?",
          [sport_id, event_id],
          (err4, players) => {

            if (err4) return res.status(500).json({ error: "DB error" });

            if (players.length < 2) {
              return res.json({ message: "Not enough players" });
            }

            players.sort(() => Math.random() - 0.5);

            const matches = [];
            let byePlayer = null;

            if (players.length % 2 === 1) {
              byePlayer = players.pop();
            }

            for (let i = 0; i < players.length; i += 2) {
              matches.push([
                event_id,
                sport_id,
                players[i].id,
                players[i + 1].id,
                1,
                "pending"
              ]);
            }

            db.query(
              "INSERT INTO matches (event_id, sport_id, team1_id, team2_id, round, status) VALUES ?",
              [matches],
              (err5) => {

                if (err5) return res.status(500).json({ error: "Insert error" });

                if (byePlayer) {
                  db.query(
                    "INSERT INTO matches (event_id, sport_id, bye_player_id, round, status, winner_id) VALUES (?, ?, ?, 1, 'completed', ?)",
                    [event_id, sport_id, byePlayer.id, byePlayer.id]
                  );
                }

                res.json({ message: "Matches generated" });

              }
            );
          }
        );
      }

    }
  );
};


//
// 🟢 Get Matches
//
const getMatches = (req, res) => {
  const { event_id } = req.query;

  let query = `
    SELECT 
      m.id,
      m.event_id,
      s.name AS sport,
      m.round,
      m.status,
      m.team1_id,
      m.team2_id,
      m.winner_id,
      m.bye_player_id,

      CASE 
        WHEN m.sport_id = 1 THEN t1.name
        ELSE p1.name
      END AS player1,

      CASE 
        WHEN m.sport_id = 1 THEN t2.name
        ELSE p2.name
      END AS player2,

      pbye.name AS bye_player

    FROM matches m
    JOIN sports s ON m.sport_id = s.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    LEFT JOIN participants p1 ON m.team1_id = p1.id
    LEFT JOIN participants p2 ON m.team2_id = p2.id
    LEFT JOIN participants pbye ON m.bye_player_id = pbye.id
  `;

  const params = [];

  if (event_id) {
    query += " WHERE m.event_id = ?";
    params.push(event_id);
  }

  query += " ORDER BY m.round ASC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
};


//
// 🟢 Start Round
//
const startRound = (req, res) => {

  const { event_id, sport_id, round } = req.body;

  console.log("START ROUND:", event_id, sport_id, round); // DEBUG

  if (!event_id || !sport_id || !round) {
    return res.status(400).json({ error: "Missing params" });
  }

  db.query(
    `UPDATE matches 
     SET status = 'ready' 
     WHERE event_id = ? AND sport_id = ? AND round = ?`,
    [event_id, sport_id, round],
    (err, result) => {

      if (err) {
        console.error("START ROUND ERROR:", err); // 🔥 IMPORTANT
        return res.status(500).json(err);
      }

      console.log("Rows updated:", result.affectedRows); // DEBUG

      res.json({ message: "Round started successfully" });
    }
  );
};

//
// 🟢 Mark Winner
//
const markWinner = (req, res) => {

  const { match_id, winner_id } = req.body;

  db.query(
    "UPDATE matches SET winner_id=?, status='completed' WHERE id=?",
    [winner_id, match_id],
    (err) => {

      if (err) return res.status(500).json({ error: "DB error" });

      res.json({ message: "Winner recorded" });

    }
  );
};


//
// 🟢 Generate Next Round
//
const generateNextRound = (req, res) => {

  const { sport_id, event_id } = req.body;

  db.query(
    "SELECT MAX(round) AS currentRound FROM matches WHERE sport_id=? AND event_id=?",
    [sport_id, event_id],
    (err, result) => {

      const currentRound = result[0].currentRound;

      db.query(
        `SELECT winner_id FROM matches
         WHERE sport_id=? AND event_id=? AND round=? 
         AND winner_id IS NOT NULL`,
        [sport_id, event_id, currentRound],
        (err2, winners) => {

          const players = winners.map(w => w.winner_id);

          if (players.length === 1) {
            return res.json({
              message: "Tournament completed",
              champion_id: players[0]
            });
          }

          players.sort(() => Math.random() - 0.5);

          let byePlayer = null;

          if (players.length % 2 === 1) {
            byePlayer = players.pop();
          }

          const nextRound = currentRound + 1;
          const matches = [];

          for (let i = 0; i < players.length; i += 2) {
            matches.push([
              event_id,
              sport_id,
              players[i],
              players[i + 1],
              nextRound,
              "pending"
            ]);
          }

          db.query(
            "INSERT INTO matches (event_id, sport_id, team1_id, team2_id, round, status) VALUES ?",
            [matches],
            () => {

              if (byePlayer) {
                db.query(
                  "INSERT INTO matches (event_id, sport_id, bye_player_id, round, status, winner_id) VALUES (?, ?, ?, ?, 'completed', ?)",
                  [event_id, sport_id, byePlayer, nextRound, byePlayer]
                );
              }

              res.json({ message: `Round ${nextRound} generated` });

            }
          );

        }
      );

    }
  );
};


//
// 🟢 Reset Tournament (PER SPORT)
//
const resetTournament = (req, res) => {

  const { event_id, sport_id } = req.body;

  console.log("RESET API:", event_id, sport_id); // DEBUG

  if (!event_id || !sport_id) {
    return res.status(400).json({ error: "Missing params" });
  }

  db.query(
    "DELETE FROM matches WHERE event_id=? AND sport_id=?",
    [event_id, sport_id],
    (err, result) => {

      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json(err);
      }

      console.log("Deleted rows:", result.affectedRows); // DEBUG

      res.json({ message: "Reset successful" });
    }
  );
};

const startMatch = (req, res) => {
  const { match_id } = req.body;

  db.query(
    `UPDATE matches 
     SET status='ongoing', started_at=NOW() 
     WHERE id=?`,
    [match_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Match started" });
    }
  );
};

const pauseMatch = (req, res) => {
  const { match_id } = req.body;

  db.query(
    `UPDATE matches SET status='paused' WHERE id=?`,
    [match_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Match paused" });
    }
  );
};


const resumeMatch = (req, res) => {
  const { match_id } = req.body;

  db.query(
    `UPDATE matches SET status='ongoing' WHERE id=?`,
    [match_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Match resumed" });
    }
  );
};


const submitReport = (req, res) => {
  const { match_id, score1, score2, notes } = req.body;

  db.query(
    `UPDATE matches 
     SET score1=?, score2=?, match_notes=?,
         status='completed',
         ended_at=NOW(),
         winner_id = CASE 
           WHEN ? > ? THEN team1_id 
           ELSE team2_id 
         END
     WHERE id=?`,
    [score1, score2, notes, score1, score2, match_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Match completed with report" });
    }
  );
};


const getReport = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT * FROM matches WHERE id=?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
};


module.exports = {
  generateMatches,
  getMatches,
  startRound,
  markWinner,
  generateNextRound,
  resetTournament,
  startMatch,
  pauseMatch,
  resumeMatch,
  submitReport,
  getReport
};