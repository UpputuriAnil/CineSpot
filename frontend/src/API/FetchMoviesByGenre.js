async function FetchMoviesByGenre(token, page, genreIds) {
  const API_KEY = process.env.REACT_APP_API_KEY || '';
  const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN || token || '';

  const genreIdsURL = genreIds && genreIds.length > 0 ? genreIds.join(',') : '';
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-IN&region=IN&with_origin_country=IN&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genreIdsURL}`;

  try {
    const headers = { accept: 'application/json' };
    if (ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    const data = await response.json();

    if (!data || !data.results) {
      return { filteredMovies: [], totalPages: 1 };
    }

    const filteredMovies = data.results.filter(
      (movie) => movie.backdrop_path !== null || movie.poster_path !== null,
    );

    return { filteredMovies, totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return { filteredMovies: [], totalPages: 1 };
  }
}

export default FetchMoviesByGenre;
