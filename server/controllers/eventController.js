const db = require("../config/db");


// Create Event
exports.createEvent = (req, res) => {
  const { name, description, event_date } = req.body;

  const query =
    "INSERT INTO events (name, description, event_date) VALUES (?, ?, ?)";

  db.query(query, [name, description, event_date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      id: result.insertId,
      name,
      description,
      event_date,
    });
  });
};


// Get all events
exports.getEvents = (req, res) => {
  const query = "SELECT * FROM events ORDER BY event_date DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};


// Delete event
exports.deleteEvent = (req, res) => {
  const eventId = req.params.id;

  // delete related data first
  db.query(
    "DELETE FROM event_sports WHERE event_id = ?",
    [eventId],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error event_sports" });

      db.query(
        "DELETE FROM matches WHERE event_id = ?",
        [eventId],
        (err2) => {
          if (err2) return res.status(500).json({ error: "DB error matches" });

          db.query(
            "DELETE FROM participants WHERE event_id = ?",
            [eventId],
            (err3) => {
              if (err3)
                return res
                  .status(500)
                  .json({ error: "DB error participants" });

              db.query(
                "DELETE FROM events WHERE id = ?",
                [eventId],
                (err4) => {
                  if (err4)
                    return res.status(500).json({ error: "DB error events" });

                  res.json({ message: "Event deleted successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
};