import React from 'react';

function GoogleAccountSelectorModal({ onClose, onSelectAccount }) {
  // Configured accounts list matching Google Identity Services selection dialog
  const accounts = [
    {
      id: 'acc_1',
      name: 'ANIL UPPUTURI',
      email: 'anilupputuri00@gmail.com',
      avatarBg: 'bg-purple-700 text-white font-extrabold',
      initial: 'A',
    },
    {
      id: 'acc_2',
      name: 'Abcd Efgh',
      email: 'anilupputuri000@gmail.com',
      avatarBg: 'bg-amber-600 text-white font-extrabold',
      initial: 'A',
    },
    {
      id: 'acc_3',
      name: 'RUPENAGUNTLA',
      email: 'rupenaguntla42@gmail.com',
      avatarBg: 'bg-teal-600 text-white font-extrabold',
      initial: 'R',
    },
    {
      id: 'acc_4',
      name: 'ANIL UPPUTURI',
      email: 'anil.upputuri@cinespot.com',
      avatarBg: 'bg-rose-600 text-white font-extrabold',
      initial: 'A',
    },
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn font-sans'>
      <div className='bg-[#1e1e24] text-slate-100 rounded-3xl border border-stone-800 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-left relative'>
        {/* Top Centered Google Badge */}
        <div className='flex justify-center -mt-2 mb-1'>
          <div className='w-14 h-14 rounded-full bg-[#2a2a32] border border-stone-700/80 flex items-center justify-center shadow-lg'>
            <svg className='w-7 h-7' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
              />
            </svg>
          </div>
        </div>

        {/* Modal Titles */}
        <div className='text-left space-y-1 border-b border-stone-800 pb-4'>
          <h3 className='text-lg sm:text-xl font-bold text-white tracking-tight'>
            Sign in to cinespot.com with google.com
          </h3>
          <p className='text-xs text-gray-400 font-medium'>
            Choose an account to continue
          </p>
        </div>

        {/* Account Choice List */}
        <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc)}
              className='w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-800/80 transition-all cursor-pointer group border border-transparent hover:border-stone-700/60'
            >
              <div className='flex items-center space-x-3.5'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm ${acc.avatarBg}`}
                >
                  {acc.initial}
                </div>
                <div className='text-left leading-tight'>
                  <h4 className='text-sm font-bold text-slate-100 group-hover:text-white'>
                    {acc.name}
                  </h4>
                  <p className='text-xs text-gray-400 font-medium'>
                    {acc.email}
                  </p>
                </div>
              </div>
              <span className='text-gray-500 group-hover:text-slate-300 text-xs font-bold transition-colors'>
                ▶
              </span>
            </button>
          ))}
        </div>

        {/* Bottom Action Buttons */}
        <div className='flex items-center justify-between pt-3 border-t border-stone-800/80 gap-3'>
          <button
            onClick={() => onSelectAccount(accounts[0])}
            className='border border-stone-700 hover:border-stone-500 bg-stone-800/60 hover:bg-stone-800 text-rose-300 hover:text-rose-200 font-semibold px-4 py-2 rounded-full text-xs transition-all cursor-pointer'
          >
            Use a different account
          </button>
          <button
            onClick={onClose}
            className='border border-stone-700 hover:border-stone-500 bg-stone-800/60 hover:bg-stone-800 text-gray-300 hover:text-white font-semibold px-5 py-2 rounded-full text-xs transition-all cursor-pointer'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoogleAccountSelectorModal;
