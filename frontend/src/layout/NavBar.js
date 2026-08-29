import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';
import UserProfileDrawer from '../components/UserProfileDrawer';
import Search from '../components/Search';
import { logout } from '../utils/Auth';

function NavBar({ user, onSearch, onLogin, onLogout }) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div>
      <div className='navbar flex flex-col lg:flex-row items-center container mx-auto py-3 px-4 bg-slate-900/95 backdrop-blur-md border border-slate-800/80 shadow-2xl rounded-2xl relative z-10 my-2'>
        <div className='mx-2 mb-3 lg:mb-0 flex items-center'>
          <a
            className='flex items-center space-x-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2 transition-all group shadow-sm'
            href='/'
          >
            <img
              src={`${process.env.PUBLIC_URL}/CineSpot.png`}
              alt='CineSpot Logo'
              className='h-9 w-auto rounded-md object-contain group-hover:scale-105 transition-transform'
            />
            <div className='flex flex-col text-left leading-none'>
              <span className='text-2xl font-black tracking-tight text-white'>
                Cine<span className='text-rose-500'>Spot</span>
              </span>
              <span className='text-[10px] uppercase font-semibold text-rose-400/90 tracking-widest mt-0.5'>
                Your Next Show Awaits
              </span>
            </div>
          </a>
        </div>
        <div className='flex-grow w-full lg:w-auto flex justify-center lg:justify-end items-center my-2 lg:my-0'>
          <Search onSearch={onSearch} />
        </div>
        <div className='flex flex-col lg:flex-row justify-center items-center ml-0 lg:ml-4'>
          <div className='flex items-center space-x-3'>
            {user ? (
              <button
                onClick={() => setShowProfileDrawer(true)}
                className='flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl px-3.5 py-1.5 text-white font-semibold cursor-pointer transition-all shadow-sm group'
              >
                <div className='w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center border border-rose-400/50 shadow-sm'>
                  {user.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className='text-sm text-slate-200 group-hover:text-white font-bold max-w-[120px] truncate'>
                  Hi, {user.userName || 'User'}
                </span>
                <span className='text-xs text-slate-400'>▾</span>
              </button>
            ) : (
              <>
                <button
                  className='bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-all shadow-sm'
                  onClick={() => setShowLoginForm(true)}
                >
                  Login
                </button>
                <button
                  className='bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-all shadow-md shadow-rose-900/30 hover:scale-105'
                  onClick={() => setShowRegistrationForm(true)}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Side Drawer */}
      {showProfileDrawer && user && (
        <UserProfileDrawer
          user={user}
          onClose={() => setShowProfileDrawer(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Authentication Popups */}
      {(showLoginForm || showRegistrationForm) && (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-50'>
          <div className='bg-white p-6 rounded-lg popup'>
            {showLoginForm && (
              <LoginForm
                onClose={() => setShowLoginForm(false)}
                onLogin={onLogin}
              />
            )}
            {showRegistrationForm && (
              <RegistrationForm
                onClose={() => setShowRegistrationForm(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NavBar;
