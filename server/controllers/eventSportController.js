const db = require("../config/db");

// get sports for an event
const getEventSports = (req, res) => {
  const { event_id } = req.params;

  const query = `
    SELECT s.id, s.name
    FROM event_sports es
    JOIN sports s ON es.sport_id = s.id
    WHERE es.event_id = ?
  `;

  db.query(query, [event_id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
};


// assign sports to event
const setEventSports = (req, res) => {
  const { event_id, sports } = req.body;

  if (!event_id || !sports) {
    return res.status(400).json({ error: "event_id and sports required" });
  }

  db.query(
    "DELETE FROM event_sports WHERE event_id = ?",
    [event_id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const values = sports.map((sport_id) => [event_id, sport_id]);

      db.query(
        "INSERT INTO event_sports (event_id, sport_id) VALUES ?",
        [values],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Insert error" });

          res.json({ message: "Sports assigned to event" });
        }
      );
    }
  );
};

module.exports = {
  getEventSports,
  setEventSports
};