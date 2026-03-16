const express = require("express");
const cors = require("cors");

const app = express();
const sportRoutes = require("./routes/sportRoutes");
const participantRoutes = require("./routes/participantRoutes");
const teamRoutes = require("./routes/teamRoutes");
const matchRoutes = require("./routes/matchRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventSportRoutes = require("./routes/eventSportRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/sports", sportRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-sports", eventSportRoutes);

module.exports = app;