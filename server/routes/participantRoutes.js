const express = require("express");
const router = express.Router();
const {
  addParticipant,
  getParticipants,
  updateParticipant,
  deleteParticipant,

} = require("../controllers/participantController");

router.post("/", addParticipant);
router.get("/", getParticipants);
// router.get("/", getParticipants);
router.put("/:id", updateParticipant);
router.delete("/:id", deleteParticipant);

module.exports = router;