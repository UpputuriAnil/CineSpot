

function MovieSessions(movie, hallNumber) {
  const langCode = movie.original_language ? movie.original_language.toUpperCase() : 'IN';
  const language = '🔊 ' + (langCode === 'HI' ? 'HINDI' : langCode === 'TE' ? 'TELUGU' : langCode === 'TA' ? 'TAMIL' : langCode);

  // Standard Indian Theater Daily 4 Show Timings
  const indianShowTimes = [
    '10:30 AM',
    '02:15 PM',
    '06:00 PM',
    '09:30 PM',
  ];

  return indianShowTimes.map((time) => ({
    time,
    language,
  }));
}

export default MovieSessions;
