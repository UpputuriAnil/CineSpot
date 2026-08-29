import React, { useState } from 'react';

function NotificationCard({ item }) {
  const { caseId, message } = item;

  const getField = (regex, fallback) => {
    const match = message.match(regex);
    return match ? match[1].trim() : fallback;
  };

  const customerName = getField(/Dear (.*?),/, 'ANIL UPPUTURI');
  const ticketId = getField(/Ticket Tracking ID:\s*(.*)/, `TCK-${caseId}`);
  const movieName = getField(/Movie Name:\s*(.*)/, 'Vishwanath & Sons');
  const showDateTime = getField(/Show Date & Time:\s*(.*)/, 'Today at 02:15 PM');
  const seatNumbers = getField(/Allocated Seat Numbers:\s*(.*)/, 'Allocated Seats');
  const totalCost = getField(/Total Booking Cost:\s*(.*)/, '₹400.00');

  return (
    <div className='bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 hover:border-rose-500/50 shadow-2xl rounded-2xl p-5 relative overflow-hidden transition-all text-left space-y-4 group'>
      {/* Top Accent Gradient Bar */}
      <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-rose-500 to-amber-400'></div>

      {/* Header Bar */}
      <div className='flex items-center justify-between border-b border-slate-800/80 pb-3 pt-1'>
        <div className='flex items-center space-x-2'>
          <span className='w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse'></span>
          <span className='text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full'>
            CONFIRMED & ALLOCATED
          </span>
        </div>
        <div className='flex items-center space-x-2 text-[11px] font-mono text-slate-400'>
          <span className='bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700/80 text-slate-300 font-bold'>
            Case #{caseId}
          </span>
          <span className='bg-rose-950/80 text-rose-300 px-2.5 py-0.5 rounded-md border border-rose-800/60 font-bold'>
            {ticketId}
          </span>
        </div>
      </div>

      {/* Movie Title & Customer */}
      <div className='space-y-1'>
        <h4 className='text-lg sm:text-xl font-black text-white group-hover:text-rose-400 transition-colors flex items-center gap-2 tracking-tight'>
          <span>🎬</span> {movieName}
        </h4>
        <p className='text-xs text-slate-400 font-medium'>
          Customer Persona: <span className='text-slate-200 font-bold'>{customerName}</span>
        </p>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs'>
        <div>
          <span className='text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5'>
            📅 Show Date & Time
          </span>
          <span className='font-semibold text-slate-200 truncate block'>
            {showDateTime}
          </span>
        </div>

        <div>
          <span className='text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5'>
            💺 Allocated Seats
          </span>
          <span className='font-extrabold text-rose-400 bg-rose-950/90 border border-rose-800/80 px-2.5 py-0.5 rounded-md inline-block shadow-sm'>
            {seatNumbers}
          </span>
        </div>

        <div>
          <span className='text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5'>
            💳 Total Booking Cost
          </span>
          <span className='font-black text-emerald-400 text-sm'>
            {totalCost}
          </span>
        </div>

        <div>
          <span className='text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5'>
            📌 Lifecycle Stage
          </span>
          <span className='font-bold text-slate-300'>
            Booking Execution
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className='text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/60'>
        <span className='flex items-center gap-1.5'>
          <span>📩</span> Correspondence rule notification dispatched
        </span>
        <span className='text-rose-400 font-bold tracking-wide uppercase'>CineSpot ✓</span>
      </div>
    </div>
  );
}

function UserProfileDrawer({ user, onClose, onLogout }) {
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  if (!user) return null;

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setShowNotificationsModal(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/notifications');
      if (response.ok) {
        const data = await response.json();
        const logsArray = Object.entries(data).map(([caseId, message]) => ({
          caseId,
          message,
        }));
        setNotificationsList(logsArray);
      }
    } catch (error) {
      console.error('Error fetching correspondence notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn font-sans'>
      {/* Beautiful Correspondence Notifications Modal Overlay */}
      {showNotificationsModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            {/* Top Modal Header */}
            <div className='flex items-center justify-between border-b border-slate-800 pb-4 pr-6'>
              <div>
                <h3 className='text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-300 to-rose-500 tracking-tight flex items-center gap-2.5'>
                  <span>🔔</span> Customer Correspondence Notifications
                </h3>
                <p className='text-xs text-slate-400 font-medium mt-0.5'>
                  Official confirmation rules & ticket dispatch records
                </p>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer p-1.5 rounded-full hover:bg-slate-800 transition-colors'
                aria-label='Close notifications'
              >
                ✕
              </button>
            </div>

            {/* Notifications Cards Container */}
            <div className='max-h-[68vh] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700'>
              {loadingNotifications ? (
                <div className='text-center py-8 text-slate-400 space-y-2'>
                  <div className='w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-xs font-semibold'>Loading notifications...</p>
                </div>
              ) : notificationsList.length > 0 ? (
                notificationsList.map((item) => (
                  <NotificationCard key={item.caseId} item={item} />
                ))
              ) : (
                <div className='text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2'>
                  <span className='text-3xl block'>🎟️</span>
                  <p className='text-sm font-bold text-slate-200'>No notifications yet</p>
                  <p className='text-xs text-slate-400 max-w-xs mx-auto'>
                    Book a movie ticket to generate your first Customer Persona correspondence notification!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Side Drawer */}
      <div className='bg-white text-gray-800 w-full max-w-sm h-full shadow-2xl flex flex-col justify-between overflow-y-auto relative transition-transform transform translate-x-0'>
        {/* Top Header Section */}
        <div className='p-6 border-b border-gray-100 relative'>
          {/* Close Button */}
          <button
            onClick={onClose}
            className='absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer leading-none p-1'
            aria-label='Close drawer'
          >
            ✕
          </button>

          <div className='flex items-center justify-between pr-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 leading-tight'>
                Hey!
              </h2>
              <button className='text-xs font-semibold text-gray-500 hover:text-rose-600 flex items-center gap-1 mt-0.5 cursor-pointer'>
                Edit Profile <span className='text-[10px]'>›</span>
              </button>
            </div>
            {/* User Avatar Circle */}
            <div className='w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border border-gray-300 shadow-inner overflow-hidden'>
              {user.photoURL ? (
                <img src={user.photoURL} alt='Profile' className='w-full h-full object-cover' />
              ) : (
                <svg className='w-9 h-9' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className='flex-1 overflow-y-auto divide-y divide-gray-100 text-left'>
          {/* Yellow Banner */}
          <div className='bg-amber-50/80 border-y border-amber-200/60 p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors'>
            <div className='flex items-start space-x-3'>
              <span className='text-amber-600 text-lg leading-none mt-0.5'>ⓘ</span>
              <div>
                <h4 className='text-xs sm:text-sm font-bold text-gray-900'>
                  Get tickets on Whatsapp/SMS!
                </h4>
                <p className='text-[11px] text-gray-500 font-medium'>
                  Add your Mobile Number
                </p>
              </div>
            </div>
            <span className='text-gray-400 font-bold text-sm'>›</span>
          </div>

          {/* Menu Items List */}
          <div className='py-1'>
            {/* 1. Notifications */}
            <div
              onClick={fetchNotifications}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>🔔</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Notifications</h4>
                  <p className='text-[11px] text-rose-500 font-medium'>View booking confirmation messages</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 2. Your Orders */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'>
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>🛍️</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Your Orders</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>View all your bookings & purchases</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 3. Your Wishlist */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'>
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>🖤</span>
                <span className='text-sm font-semibold text-gray-800'>Your Wishlist</span>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 4. Stream Library */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'>
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>📺</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Stream Library</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>Rented & Purchased Movies</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 5. Help & Support */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'>
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>💬</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Help & Support</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>View commonly asked queries and Chat</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 6. Accounts & Settings */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'>
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>⚙️</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Accounts & Settings</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>Location, Payments, Permissions & More</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 7. Rewards */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'>
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>🎁</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Rewards</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>View your rewards & unlock new ones</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>
          </div>
        </div>

        {/* Bottom Sign Out Button */}
        <div className='p-5 border-t border-gray-100 bg-white'>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className='w-full border-2 border-rose-500 text-rose-500 hover:bg-rose-50 font-bold py-3 px-4 rounded-xl transition-all text-sm cursor-pointer shadow-sm'
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileDrawer;
