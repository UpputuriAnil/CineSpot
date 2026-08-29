import React, { useState } from 'react';

function NotificationCard({ item }) {
  const { caseId, message } = item;

  const getField = (regex, fallback) => {
    const match = message.match(regex);
    return match ? match[1].trim() : fallback;
  };

  const customerName = getField(/Dear (.*?)\s*\(/, getField(/Dear (.*?),/, 'Anil Upputuri'));
  const customerEmail = getField(/Customer Email:\s*(.*)/, getField(/\((.*?@.*?)\)/, 'anil@cinespot.com'));
  const ticketId = getField(/Ticket Tracking ID:\s*(.*)/, `TCK-${caseId}`);
  const movieName = getField(/Movie Name:\s*(.*)/, 'Toxic: A Fairy Tale for Grown-ups');
  const showDateTime = getField(/Show Date & Time:\s*(.*)/, 'Today at 02:15 PM');
  const showType = getField(/Show Type:\s*(.*)/, 'Standard 2D');
  const workQueue = getField(/Routed Work Queue:\s*(.*)/, 'STANDARD_BOOKING_WORK_QUEUE');
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
        <div className='flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium'>
          <span>Customer: <strong className='text-slate-200'>{customerName}</strong></span>
          <span className='text-slate-600'>•</span>
          <span className='text-rose-400 font-mono font-semibold'>✉️ {customerEmail}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs'>
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
          <span className='font-extrabold text-rose-400 bg-rose-950/90 border border-rose-800/80 px-2 py-0.5 rounded-md inline-block shadow-sm'>
            {seatNumbers}
          </span>
        </div>

        <div>
          <span className='text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5'>
            🎥 Show Type
          </span>
          <span className='font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md inline-block'>
            {showType}
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

        <div className='col-span-2 sm:col-span-2'>
          <span className='text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5'>
            ⚙️ Work Queue Routing
          </span>
          <span className='font-mono font-bold text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded-md inline-block'>
            {workQueue}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className='text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/60'>
        <span className='flex items-center gap-1.5'>
          <span>📩</span> Correspondence rule email dispatched to <strong className='text-slate-300'>{customerEmail}</strong>
        </span>
        <span className='text-rose-400 font-bold tracking-wide uppercase'>CineSpot ✓</span>
      </div>
    </div>
  );
}

function UserProfileDrawer({ user, onClose, onLogout }) {
  const [activeModal, setActiveModal] = useState(null); // 'notifications' | 'orders' | 'wishlist' | 'stream' | 'support' | 'settings' | 'rewards'
  const [notificationsList, setNotificationsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Settings State
  const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
  const [userCity, setUserCity] = useState('Hyderabad');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, title: 'Toxic: A Fairy Tale for Grown-ups', genre: 'Action, Drama', rating: '6.4' },
    { id: 2, title: 'Kalki 2898 AD', genre: 'Sci-Fi, Action', rating: '8.2' },
    { id: 3, title: 'Vishwanath & Sons', genre: 'Family, Drama', rating: '7.4' },
  ]);

  // Support Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  if (!user) return null;

  const fetchNotifications = async () => {
    setLoadingData(true);
    setActiveModal('notifications');
    try {
      const response = await fetch('http://localhost:8080/api/v1/notifications');
      if (response.ok) {
        const data = await response.json();
        const logsArray = Object.entries(data)
          .map(([caseId, message]) => ({
            caseId,
            message,
          }))
          .filter((item) => {
            const msgLower = item.message.toLowerCase();
            const uName = (user && user.userName) ? user.userName.toLowerCase() : 'anil';
            const uEmail = (user && user.email) ? user.email.toLowerCase() : 'anil@cinespot.com';
            return msgLower.includes(uName) || msgLower.includes(uEmail) || msgLower.includes('anil') || msgLower.includes('customer');
          });
        setNotificationsList(logsArray);
      }
    } catch (error) {
      console.error('Error fetching correspondence notifications:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingData(true);
    setActiveModal('orders');
    try {
      const response = await fetch('http://localhost:8080/api/v1/movie-ticket-request');
      if (response.ok) {
        const data = await response.json();
        const userOrders = data.filter((order) => {
          const cName = order.customerName ? order.customerName.toLowerCase() : '';
          const cEmail = order.customerEmail ? order.customerEmail.toLowerCase() : '';
          const uName = (user && user.userName) ? user.userName.toLowerCase() : 'anil';
          const uEmail = (user && user.email) ? user.email.toLowerCase() : 'anil@cinespot.com';
          return cName.includes(uName) || cEmail.includes(uEmail) || cName.includes('anil') || cName === 'customer';
        });
        setOrdersList(userOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccessMsg('Settings updated successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn font-sans'>
      {/* -------------------- 1. NOTIFICATIONS MODAL -------------------- */}
      {activeModal === 'notifications' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-4 pr-6'>
              <div>
                <h3 className='text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-300 to-rose-500 tracking-tight flex items-center gap-2.5'>
                  <span>🔔</span> Customer Correspondence Notifications
                </h3>
                <p className='text-xs text-slate-400 font-medium mt-0.5'>
                  Official confirmation rules, ticket emails & work queue dispatch records
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer p-1.5 rounded-full hover:bg-slate-800 transition-colors'
              >
                ✕
              </button>
            </div>

            <div className='max-h-[68vh] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700'>
              {loadingData ? (
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

      {/* -------------------- 2. YOUR ORDERS & TRACKING MODAL -------------------- */}
      {activeModal === 'orders' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-4 pr-6'>
              <div>
                <h3 className='text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-300 to-rose-500 tracking-tight flex items-center gap-2.5'>
                  <span>🛍️</span> Track Your Booking Orders & Tickets
                </h3>
                <p className='text-xs text-slate-400 font-medium mt-0.5'>
                  Real-time status tracking, allocated seat numbers, work queue & ticket IDs
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer p-1.5 rounded-full hover:bg-slate-800 transition-colors'
              >
                ✕
              </button>
            </div>

            <div className='max-h-[68vh] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700'>
              {loadingData ? (
                <div className='text-center py-8 text-slate-400 space-y-2'>
                  <div className='w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-xs font-semibold'>Fetching live booking cases...</p>
                </div>
              ) : ordersList.length > 0 ? (
                ordersList.map((order) => (
                  <div
                    key={order.caseId}
                    className='bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-amber-500/50 transition-all'
                  >
                    <div className='flex items-center justify-between border-b border-slate-800 pb-2.5'>
                      <span className='text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full'>
                        {order.ticketId || `TCK-${order.caseId}`}
                      </span>
                      <span className='text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full'>
                        {order.bookingConfirmationStatus || 'CONFIRMED_AND_ALLOCATED'}
                      </span>
                    </div>

                    <div className='flex items-start justify-between'>
                      <div>
                        <h4 className='text-base font-bold text-white flex items-center gap-2'>
                          <span>🎬</span> {order.movieName}
                        </h4>
                        <p className='text-xs text-slate-400 mt-0.5'>
                          Customer: <strong className='text-slate-200'>{order.customerName || 'Anil Upputuri'}</strong> ({order.customerEmail || 'anil@cinespot.com'})
                        </p>
                      </div>
                      <span className='text-base font-black text-emerald-400'>
                        ₹{order.totalCost ? order.totalCost.toFixed(2) : '400.00'}
                      </span>
                    </div>

                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]'>
                      <div>
                        <span className='text-slate-500 block font-semibold'>Show Time</span>
                        <span className='text-slate-200 font-bold'>{order.showDate} at {order.showTime}</span>
                      </div>
                      <div>
                        <span className='text-slate-500 block font-semibold'>Seats Allocated</span>
                        <span className='text-rose-400 font-extrabold'>{order.seatNumbers || 'Seat 12, Seat 13'}</span>
                      </div>
                      <div>
                        <span className='text-slate-500 block font-semibold'>Show Type</span>
                        <span className='text-amber-400 font-bold'>{order.showType || 'Standard 2D'}</span>
                      </div>
                      <div>
                        <span className='text-slate-500 block font-semibold'>Stage</span>
                        <span className='text-indigo-300 font-bold'>{order.stage || 'Booking Execution'}</span>
                      </div>
                      <div className='col-span-2'>
                        <span className='text-slate-500 block font-semibold'>Work Queue</span>
                        <span className='text-slate-300 font-mono font-semibold'>{order.workQueue || 'STANDARD_BOOKING_WORK_QUEUE'}</span>
                      </div>
                    </div>

                    {/* US-009 Booking SLA Metrics Display */}
                    <div className='bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-2 text-xs'>
                      <div className='flex items-center justify-between border-b border-slate-800/80 pb-1.5'>
                        <span className='font-bold text-slate-300 flex items-center gap-1.5'>
                          <span>⏱️</span> US-009 Booking SLA Metrics
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${order.slaStatus === 'DEADLINE_MISSED'
                            ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                            : order.slaStatus === 'GOAL_MISSED'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          }`}>
                          {order.slaFlag || 'COMPLETED_WITHIN_RULES'}
                        </span>
                      </div>

                      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]'>
                        <div>
                          <span className='text-slate-500 block font-medium'>SLA Goal</span>
                          <span className='text-emerald-400 font-semibold'>1 Day (Goal)</span>
                        </div>
                        <div>
                          <span className='text-slate-500 block font-medium'>SLA Deadline</span>
                          <span className='text-rose-400 font-semibold'>2 Days (Deadline)</span>
                        </div>
                        <div>
                          <span className='text-slate-500 block font-medium'>SLA Status</span>
                          <span className='text-slate-200 font-bold'>{order.slaStatus || 'WITHIN_SLA'}</span>
                        </div>
                        <div>
                          <span className='text-slate-500 block font-medium'>Priority / Urgency</span>
                          <span className={`font-black ${order.priority >= 30 ? 'text-rose-400' : order.priority >= 20 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {order.priority || 10} {order.priority >= 30 ? '(Breached +20 Boost)' : order.priority >= 20 ? '(Goal Missed +10)' : '(Standard)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2'>
                  <span className='text-3xl block'>🛒</span>
                  <p className='text-sm font-bold text-slate-200'>No active orders found</p>
                  <p className='text-xs text-slate-400'>Book a movie ticket on CineSpot to view real-time tracking!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. WISHLIST MODAL -------------------- */}
      {activeModal === 'wishlist' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3 pr-6'>
              <div>
                <h3 className='text-xl font-black text-rose-400 flex items-center gap-2'>
                  <span>🖤</span> Your Saved Wishlist
                </h3>
                <p className='text-xs text-slate-400'>Movies bookmarked for future watching</p>
              </div>
              <button onClick={() => setActiveModal(null)} className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer'>
                ✕
              </button>
            </div>

            <div className='space-y-3 max-h-[60vh] overflow-y-auto'>
              {wishlistItems.length > 0 ? (
                wishlistItems.map((movie) => (
                  <div key={movie.id} className='bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between'>
                    <div>
                      <h4 className='text-sm font-bold text-white'>{movie.title}</h4>
                      <p className='text-xs text-slate-400'>{movie.genre} • ⭐ {movie.rating}</p>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(movie.id)}
                      className='text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2.5 py-1 rounded-lg cursor-pointer'
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className='text-center text-slate-400 text-xs py-8'>Your wishlist is empty!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 4. STREAM LIBRARY MODAL -------------------- */}
      {activeModal === 'stream' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3 pr-6'>
              <div>
                <h3 className='text-xl font-black text-indigo-400 flex items-center gap-2'>
                  <span>📺</span> CineSpot Stream Library
                </h3>
                <p className='text-xs text-slate-400'>Rented & purchased online digital cinema passes</p>
              </div>
              <button onClick={() => setActiveModal(null)} className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer'>
                ✕
              </button>
            </div>

            <div className='space-y-3'>
              <div className='bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between'>
                <div>
                  <span className='text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md'>PURCHASED HD</span>
                  <h4 className='text-sm font-bold text-white mt-1'>Toxic: A Fairy Tale for Grown-ups</h4>
                  <p className='text-xs text-slate-400'>Expires in 29 days</p>
                </div>
                <button className='bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer'>
                  Watch Now ▶
                </button>
              </div>

              <div className='bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between'>
                <div>
                  <span className='text-[10px] font-bold text-amber-400 uppercase bg-amber-950 border border-amber-800 px-2 py-0.5 rounded-md'>RENTED 4K</span>
                  <h4 className='text-sm font-bold text-white mt-1'>Kalki 2898 AD</h4>
                  <p className='text-xs text-slate-400'>48 Hours Access</p>
                </div>
                <button className='bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer'>
                  Watch Now ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 5. HELP & SUPPORT MODAL -------------------- */}
      {activeModal === 'support' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3 pr-6'>
              <div>
                <h3 className='text-xl font-black text-rose-400 flex items-center gap-2'>
                  <span>💬</span> Help & Customer Support
                </h3>
                <p className='text-xs text-slate-400'>Frequently asked queries & live support chat</p>
              </div>
              <button onClick={() => setActiveModal(null)} className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer'>
                ✕
              </button>
            </div>

            <div className='space-y-3 max-h-[60vh] overflow-y-auto pr-1'>
              <div className='border border-slate-800 rounded-xl overflow-hidden bg-slate-900'>
                <button
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  className='w-full p-3.5 text-xs font-bold text-slate-200 flex justify-between items-center text-left'
                >
                  <span>How do I receive my booking ticket email?</span>
                  <span>{openFaq === 1 ? '▲' : '▼'}</span>
                </button>
                {openFaq === 1 && (
                  <div className='p-3.5 border-t border-slate-800 text-xs text-slate-400 bg-slate-950'>
                    Your ticket details are automatically dispatched via our Correspondence Service rule to your registered email address right after seat allocation.
                  </div>
                )}
              </div>

              <div className='border border-slate-800 rounded-xl overflow-hidden bg-slate-900'>
                <button
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  className='w-full p-3.5 text-xs font-bold text-slate-200 flex justify-between items-center text-left'
                >
                  <span>What is the Booking Execution SLA?</span>
                  <span>{openFaq === 2 ? '▲' : '▼'}</span>
                </button>
                {openFaq === 2 && (
                  <div className='p-3.5 border-t border-slate-800 text-xs text-slate-400 bg-slate-950'>
                    Every booking case has a Goal of 1 day and a Deadline of 2 days. If unhandled past deadline, priority escalates automatically.
                  </div>
                )}
              </div>

              <div className='border border-slate-800 rounded-xl overflow-hidden bg-slate-900'>
                <button
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  className='w-full p-3.5 text-xs font-bold text-slate-200 flex justify-between items-center text-left'
                >
                  <span>Can I request a ticket cancellation or refund?</span>
                  <span>{openFaq === 3 ? '▲' : '▼'}</span>
                </button>
                {openFaq === 3 && (
                  <div className='p-3.5 border-t border-slate-800 text-xs text-slate-400 bg-slate-950'>
                    Cancellations can be made up to 2 hours prior to showtime through the Approval stage decision workflow.
                  </div>
                )}
              </div>

              <div className='pt-2 text-center'>
                <button className='bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer w-full flex items-center justify-center gap-2'>
                  <span>🎧</span> Connect with Live Support Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 6. ACCOUNTS & SETTINGS MODAL -------------------- */}
      {activeModal === 'settings' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3 pr-6'>
              <div>
                <h3 className='text-xl font-black text-slate-200 flex items-center gap-2'>
                  <span>⚙️</span> Accounts & Preferences Settings
                </h3>
                <p className='text-xs text-slate-400'>Manage profile credentials, location & alerts</p>
              </div>
              <button onClick={() => setActiveModal(null)} className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer'>
                ✕
              </button>
            </div>

            {savedSuccessMsg && (
              <div className='bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs p-3 rounded-xl font-bold text-center animate-fadeIn'>
                ✓ {savedSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className='space-y-4 text-xs'>
              <div>
                <label className='block font-semibold text-slate-300 mb-1'>Mobile Number (WhatsApp & SMS Tickets)</label>
                <input
                  type='text'
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className='w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-rose-500'
                />
              </div>

              <div>
                <label className='block font-semibold text-slate-300 mb-1'>Preferred City / Location</label>
                <select
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className='w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-rose-500'
                >
                  <option value='Hyderabad'>Hyderabad</option>
                  <option value='Mumbai'>Mumbai</option>
                  <option value='Bengaluru'>Bengaluru</option>
                  <option value='Chennai'>Chennai</option>
                  <option value='Delhi NCR'>Delhi NCR</option>
                </select>
              </div>

              <div className='flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800'>
                <div>
                  <h4 className='font-bold text-white'>Email Correspondence Alerts</h4>
                  <p className='text-[10px] text-slate-400'>Receive ticket confirmation PDFs</p>
                </div>
                <input
                  type='checkbox'
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className='w-4 h-4 accent-rose-500 cursor-pointer'
                />
              </div>

              <button
                type='submit'
                className='w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer'
              >
                Save Updated Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- 7. REWARDS MODAL -------------------- */}
      {activeModal === 'rewards' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn'>
          <div className='bg-slate-950 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative border border-slate-800 space-y-5 text-left'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3 pr-6'>
              <div>
                <h3 className='text-xl font-black text-amber-400 flex items-center gap-2'>
                  <span>🎁</span> CineSpot Club Rewards
                </h3>
                <p className='text-xs text-slate-400'>Your points, badges & active discount coupons</p>
              </div>
              <button onClick={() => setActiveModal(null)} className='text-slate-400 hover:text-white text-xl font-bold cursor-pointer'>
                ✕
              </button>
            </div>

            <div className='bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 border border-amber-800/80 rounded-2xl p-5 text-center space-y-1 shadow-inner'>
              <span className='text-[10px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-950 border border-amber-800 px-2.5 py-0.5 rounded-full'>
                👑 GOLD CINEMA MEMBER
              </span>
              <h2 className='text-3xl font-black text-white pt-1'>450 PTS</h2>
              <p className='text-xs text-slate-300 font-medium'>Earn 50 pts on your next movie booking!</p>
            </div>

            <div className='space-y-3 text-xs'>
              <div className='bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between'>
                <div>
                  <span className='font-bold text-white block'>Coupon: CINESPOT50</span>
                  <span className='text-[11px] text-slate-400'>Flat 50% OFF on weekend popcorn combo</span>
                </div>
                <span className='bg-emerald-950 text-emerald-400 font-mono font-bold px-2.5 py-1 border border-emerald-800 rounded-lg'>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PROFILE SIDE DRAWER MENU -------------------- */}
      <div className='bg-white text-gray-800 w-full max-w-sm h-full shadow-2xl flex flex-col justify-between overflow-y-auto relative transition-transform transform translate-x-0'>
        {/* Top Header Section */}
        <div className='p-6 border-b border-gray-100 relative'>
          <button
            onClick={onClose}
            className='absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer leading-none p-1'
          >
            ✕
          </button>

          <div className='flex items-center justify-between pr-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 leading-tight'>
                Hey, {user.userName || 'Anil'}!
              </h2>
              <button
                onClick={() => setActiveModal('settings')}
                className='text-xs font-semibold text-gray-500 hover:text-rose-600 flex items-center gap-1 mt-0.5 cursor-pointer'
              >
                Edit Profile <span className='text-[10px]'>›</span>
              </button>
            </div>
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
          <div
            onClick={() => setActiveModal('settings')}
            className='bg-amber-50/80 border-y border-amber-200/60 p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors'
          >
            <div className='flex items-start space-x-3'>
              <span className='text-amber-600 text-lg leading-none mt-0.5'>ⓘ</span>
              <div>
                <h4 className='text-xs sm:text-sm font-bold text-gray-900'>
                  Get tickets on Whatsapp/SMS!
                </h4>
                <p className='text-[11px] text-gray-500 font-medium'>
                  Mobile: {mobileNumber}
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
                  <p className='text-[11px] text-rose-500 font-medium'>View email booking confirmation messages</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 2. Your Orders & Tracking */}
            <div
              onClick={fetchOrders}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>🛍️</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Your Orders & Track</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>View all your bookings, work queues & tracking</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 3. Your Wishlist */}
            <div
              onClick={() => setActiveModal('wishlist')}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
              <div className='flex items-center space-x-3.5'>
                <span className='text-gray-600 text-lg group-hover:scale-110 transition-transform'>🖤</span>
                <div>
                  <h4 className='text-sm font-semibold text-gray-800'>Your Wishlist</h4>
                  <p className='text-[11px] text-gray-400 font-medium'>Saved favorite movie titles</p>
                </div>
              </div>
              <span className='text-gray-400 font-bold text-sm'>›</span>
            </div>

            {/* 4. Stream Library */}
            <div
              onClick={() => setActiveModal('stream')}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
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
            <div
              onClick={() => setActiveModal('support')}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
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
            <div
              onClick={() => setActiveModal('settings')}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
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
            <div
              onClick={() => setActiveModal('rewards')}
              className='p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group'
            >
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
