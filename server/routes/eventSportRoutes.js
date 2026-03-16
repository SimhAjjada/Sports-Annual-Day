const express = require("express");
const router = express.Router();

const {
  getEventSports,
  setEventSports
} = require("../controllers/eventSportController");

router.get("/:event_id", getEventSports);

router.post("/set", setEventSports);

module.exports = router;