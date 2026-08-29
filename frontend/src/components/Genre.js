import React, { useEffect, useState } from 'react';
import FetchGenres from '../API/GetGenres';
import RemoveUnwantedGenres from '../utils/removeNonCinemaGenres';

const Genres = ({ setGenreIds }) => {
  const [genres, setGenres] = useState([]);
  const [clickedGenres, setClickedGenres] = useState([]);

  const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN || '';

  useEffect(() => {
    const fetchData = async () => {
      const fetchedGenres = await FetchGenres(ACCESS_TOKEN);
      const filteredGenres = RemoveUnwantedGenres(fetchedGenres);
      setGenres(filteredGenres);
      setClickedGenres(Array(filteredGenres.length).fill(false));
    };

    fetchData();
  }, [ACCESS_TOKEN]);

  useEffect(() => {
    const updatedGenreIds = clickedGenres
      .map((clicked, index) => (clicked ? genres[index].id : null))
      .filter((id) => id !== null);
    setGenreIds(updatedGenreIds);
  }, [clickedGenres, genres, setGenreIds]);

  const handleGenreClick = (index) => {
    setClickedGenres((prevClickedGenres) => {
      const newClickedGenres = [...prevClickedGenres];
      newClickedGenres[index] = !newClickedGenres[index];
      return newClickedGenres;
    });
  };

  const genreEmojis = {
    28: '💥', // Action
    12: '🏞️', // Adventure
    16: '📽️', // Animation
    35: '😂', // Comedy
    10751: '❤️', // Family
    14: '🧙‍♂️', // Fantasy
    9648: '🔍', // Mystery
    878: '🤖', // Science Fiction
    18: '🎭', // Drama
    27: '👻', // Horror
    53: '😱', // Thriller
    10402: '🎵', // Music
    36: '📜', // History
    10752: '⚔️', // War
    10749: '💑', // Romance
    80: '🔫', // Crime
  };

  return (
    <div className='flex flex-wrap my-4 px-2 justify-center gap-2 container mx-auto'>
      {genres.map((genre, index) => (
        <button
          key={index}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
            clickedGenres[index]
              ? 'bg-rose-600 text-white shadow-rose-900/40 ring-2 ring-rose-400/50 scale-105'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 hover:border-slate-600 hover:scale-105'
          }`}
          onClick={() => handleGenreClick(index)}
        >
          <span className='text-sm'>{genreEmojis[genre.id]}</span>
          <span>{genre.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Genres;
