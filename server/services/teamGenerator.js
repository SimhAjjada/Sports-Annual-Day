// Shuffle array helper
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Generate teams
function generateTeams(players, numberOfTeams) {
  const shuffled = shuffleArray(players);
  const teams = Array.from({ length: numberOfTeams }, () => []);

  shuffled.forEach((player, index) => {
    teams[index % numberOfTeams].push(player);
  });

  return teams;
}

module.exports = generateTeams;