const express = require("express");
const router = express.Router();
const db = require("../config/db");


// Get all events
router.get("/", (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});


// Get sports for an event
router.get("/:id/sports", (req, res) => {
  const eventId = req.params.id;

  const query = `
    SELECT sports.id, sports.name
    FROM event_sports
    JOIN sports ON event_sports.sport_id = sports.id
    WHERE event_sports.event_id = ?
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});


// Create new event
router.post("/", (req, res) => {
  const { name, description, event_date } = req.body;

  const query =
    "INSERT INTO events (name, description, event_date) VALUES (?, ?, ?)";

  db.query(query, [name, description, event_date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json({
      message: "Event created successfully",
      id: result.insertId
    });
  });
});


// Save sports for event
router.post("/:id/sports", (req, res) => {
  const eventId = req.params.id;
  const { sports } = req.body;

  if (!sports || sports.length === 0) {
    return res.status(400).json({ error: "No sports selected" });
  }

  const values = sports.map((sportId) => [eventId, sportId]);

  const query = "INSERT INTO event_sports (event_id, sport_id) VALUES ?";

  db.query(query, [values], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error inserting sports" });
    }

    res.json({ message: "Sports added to event" });
  });
});


// Delete event safely
router.delete("/:id", (req, res) => {
  const eventId = req.params.id;

  db.query("DELETE FROM event_sports WHERE event_id = ?", [eventId], (err) => {
    if (err) return res.status(500).json({ error: "DB error event_sports" });

    db.query("DELETE FROM matches WHERE event_id = ?", [eventId], (err2) => {
      if (err2) return res.status(500).json({ error: "DB error matches" });

      db.query("DELETE FROM participants WHERE event_id = ?", [eventId], (err3) => {
        if (err3) return res.status(500).json({ error: "DB error participants" });

        db.query("DELETE FROM events WHERE id = ?", [eventId], (err4) => {
          if (err4) return res.status(500).json({ error: "DB error events" });

          res.json({ message: "Event deleted successfully" });
        });
      });
    });
  });
});


module.exports = router;