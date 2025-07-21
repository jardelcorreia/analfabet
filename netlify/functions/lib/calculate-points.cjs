const calculatePoints = (bet, match) => {
  if (match.status !== 'finished') {
    return 0;
  }

  const betHomeScore = parseInt(bet.home_score, 10);
  const betAwayScore = parseInt(bet.away_score, 10);
  const matchHomeScore = parseInt(match.home_score, 10);
  const matchAwayScore = parseInt(match.away_score, 10);

  if (isNaN(betHomeScore) || isNaN(betAwayScore) || isNaN(matchHomeScore) || isNaN(matchAwayScore)) {
    return 0;
  }

  const isExactScore = betHomeScore === matchHomeScore && betAwayScore === matchAwayScore;
  if (isExactScore) {
    return 5; // 5 points for exact score
  }

  const betResult = betHomeScore > betAwayScore ? 'win' : betHomeScore < betAwayScore ? 'loss' : 'draw';
  const matchResult = matchHomeScore > matchAwayScore ? 'win' : matchHomeScore < matchAwayScore ? 'loss' : 'draw';

  if (betResult === matchResult) {
    return 2; // 2 points for correct result
  }

  return 0;
};

module.exports = { calculatePoints };
