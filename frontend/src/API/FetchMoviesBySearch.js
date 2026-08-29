import FilterValidMovies from '../utils/filterValidMovies';

async function FetchMoviesBySearch(token, page, searchText) {
  const API_KEY = process.env.REACT_APP_API_KEY || '';
  const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN || token || '';

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-IN&region=IN&query=${encodeURIComponent(
    searchText,
  )}&page=${page}&include_adult=false`;

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

    const filteredMovies = FilterValidMovies(data.results).filter(
      (movie) => movie.backdrop_path !== null || movie.poster_path !== null,
    );

    return { filteredMovies, totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error('Error fetching movies by search:', error);
    return { filteredMovies: [], totalPages: 1 };
  }
}

export default FetchMoviesBySearch;
