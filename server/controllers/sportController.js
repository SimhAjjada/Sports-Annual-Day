const db = require("../config/db");

exports.getSports = (req, res) => {
  db.query("SELECT * FROM sports", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};