const express = require("express");
const router = express.Router();
const { getSports } = require("../controllers/sportController");

router.get("/", getSports);

module.exports = router;