const express = require("express");
const router = express.Router();
const { createTeams, getTeams } = require("../controllers/teamController");
const { getTeamPlayers } = require("../controllers/teamController");


router.post("/generate", createTeams);
router.get("/", getTeams);
router.get("/:id/players", getTeamPlayers);

module.exports = router;