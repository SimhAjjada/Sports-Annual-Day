const db = require("../config/db");

//
// 🟢 Register participant (NOW SAVES event_id)
//
exports.addParticipant = (req, res) => {
  const { name, sport_id, event_id } = req.body;

  if (!name || !sport_id) {
    return res.status(400).json({ error: "Name and sport are required" });
  }

  const query =
    "INSERT INTO participants (name, sport_id, event_id) VALUES (?, ?, ?)";

  db.query(query, [name, sport_id, event_id || null], (err) => {
    if (err) {
      console.error("Error adding participant:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "Participant registered successfully" });
  });
};

//
// 🟢 Get all participants (WITH event & sport)
//
exports.getParticipants = (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      s.name AS sport,
      e.name AS event
    FROM participants p
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN events e ON p.event_id = e.id
    ORDER BY p.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching participants:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

//
// 🟢 Update participant name
//
exports.updateParticipant = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  db.query(
    "UPDATE participants SET name = ? WHERE id = ?",
    [name, id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "Participant updated" });
    }
  );
};

//
// 🟢 Delete participant (FIXED for cricket players)
//
exports.deleteParticipant = (req, res) => {
  const { id } = req.params;

  // Step 1: remove player from team_players (if exists)
  db.query(
    "DELETE FROM team_players WHERE participant_id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Error deleting from team_players:", err);
        return res.status(500).json({ error: "DB error (team_players)" });
      }

      // Step 2: remove participant
      db.query(
        "DELETE FROM participants WHERE id = ?",
        [id],
        (err2) => {
          if (err2) {
            console.error("Error deleting participant:", err2);
            return res.status(500).json({ error: "DB error (participants)" });
          }

          res.json({ message: "Participant deleted successfully" });
        }
      );
    }
  );
};