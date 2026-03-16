// Create knockout matches
function createMatches(teams) {
  const matches = [];

  for (let i = 0; i < teams.length; i += 2) {
    if (teams[i + 1]) {
      matches.push({
        team1: teams[i],
        team2: teams[i + 1],
      });
    }
  }

  return matches;
}

module.exports = createMatches;