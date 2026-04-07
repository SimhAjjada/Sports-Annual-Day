const express = require("express");
const router = express.Router();

const {
  generateMatches,
  getMatches,
  markWinner,
  generateNextRound,
  startRound,
  resetTournament,

  startMatch,
  pauseMatch,
  resumeMatch,
  submitReport,
  getReport

} = require("../controllers/matchController");

// generate matches
router.post("/generate", generateMatches);

// get matches
router.get("/", getMatches);

// mark winner
router.post("/winner", markWinner);

// generate next round
router.post("/next-round", generateNextRound);

router.post("/start-round", startRound);

router.post("/reset", resetTournament);


router.post("/start", startMatch);
router.post("/pause", pauseMatch);
router.post("/resume", resumeMatch);
router.post("/report", submitReport);
router.get("/:id/report", getReport);

module.exports = router;