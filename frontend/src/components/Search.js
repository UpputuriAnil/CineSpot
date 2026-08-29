import React, { useState } from 'react';

const Search = ({ onSearch }) => {
  const [search, setSearch] = useState('');

  const handleChange = (event) => {
    const searchText = event.target.value;
    setSearch(searchText);
    onSearch(searchText); 
  };

  return (
    <div className='relative w-full max-w-sm mx-2'>
      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
        </svg>
      </div>
      <input
        type='text'
        placeholder='Search movies, genres...'
        className='w-full bg-slate-800/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-inner'
        value={search}
        onChange={handleChange}
      />
    </div>
  );
};

export default Search;
