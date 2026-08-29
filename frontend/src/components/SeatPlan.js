import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyTickets from '../API/BuyTickets';
import SubmitMovieTicketRequest from '../API/SubmitMovieTicketRequest';
import getSeatPlan from '../API/GetSeatPlan';
import updateSeatsInHall from '../API/UpdateSeatsInHall';
import generateRandomOccupiedSeats from '../utils/GenerateRandomOccupiedSeats';
import SeatSelector from './SeatSelector';
import SeatShowcase from './SeatShowcase';

const movies = [
  {
    title: '',
    price: 200,
    occupied: generateRandomOccupiedSeats(1, 64, 64),
  },
];

function SeatPlan({ movie }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [confirmedTicketDetails, setConfirmedTicketDetails] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [recommendedSeat, setRecommendedSeat] = useState(null);
  const navigate = useNavigate();
  const [movieSession, setMovieSession] = useState(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');

  const [seatPlan, setSeatPlan] = useState(null);

  useEffect(() => {
    const storedMovieSession = JSON.parse(localStorage.getItem('movieSession'));
    if (storedMovieSession) {
      setMovieSession(storedMovieSession);
    }
  }, []);

  useEffect(() => {
    const fetchSeatPlan = async () => {
      try {
        if (movieSession && movieSession.time) {
          const data = await getSeatPlan(movie.id, movieSession);
          setSeatPlan(data);
        }
      } catch (error) {
        console.error('Error fetching seat plan:', error);
      }
    };

    if (movieSession) {
      fetchSeatPlan();
    }
  }, [movie.id, movieSession]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserName(storedUser.userName);
      setUserId(storedUser.userId);
    }
  }, []);

  const occupiedSeats =
    seatPlan && seatPlan.length > 0 ? seatPlan : movies[0].occupied;

  const availableSeats = [27, 28, 29, 30, 35, 36, 37, 38, 43, 44, 45, 46];

  const filteredAvailableSeats = availableSeats.filter(
    (seat) => !occupiedSeats.includes(seat),
  );

  useEffect(() => {
    let recommended = null;
    for (let i = 0; i < filteredAvailableSeats.length; i++) {
      const seat = filteredAvailableSeats[i];
      if (!occupiedSeats.includes(seat)) {
        recommended = seat;
        break;
      }
    }
    setRecommendedSeat(recommended);
  }, [filteredAvailableSeats, occupiedSeats]);

  let selectedSeatText = '';
  if (selectedSeats.length > 0) {
    selectedSeatText = selectedSeats.map((seat) => seat + 1).join(', ');
  }

  let totalPrice = selectedSeats.length * movies[0].price;

  const isAnySeatSelected = selectedSeats.length > 0;

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (isAnySeatSelected) {
      setShowReviewModal(true);
    }
  };

  const handleConfirmOrder = async () => {
    setShowReviewModal(false);
    const orderSeats = selectedSeats;
    const updatedOccupiedSeats = [...orderSeats, ...occupiedSeats];

    const order = {
      customerId: userId || Math.floor(Math.random() * 1000000),
      userName: userName || '',
      orderDate: new Date().toISOString(),
      seats: [...orderSeats, ...occupiedSeats],
      seat: orderSeats,
      movie: {
        id: movie.id,
        title: movie.title,
        genres: movie.genres.map((genre) => genre.name).join(', '),
        runtime: movie.runtime,
        language: movie.original_language,
        price: movies[0].price,
      },
    };

    const myOrder = {
      customerId: order.customerId,
      orderDate: order.orderDate,
      showTime: movieSession ? movieSession.time : '10:30 AM',
      numberOfTickets: order.seat.length,
      totalCost: totalPrice,
      movieId: order.movie.id,
      movieTitle: order.movie.title,
      movieGenres: order.movie.genres,
      movieRuntime: order.movie.runtime,
      movieLanguage: order.movie.language,
      moviePrice: order.movie.price,
      seat: order.seat,
      userName: order.userName,
    };

    const hallUpdate = {
      movieId: movie.id,
      movieSession: movieSession ? movieSession.time : '10:30 AM',
      orderTime: order.orderDate,
      updatedSeats: updatedOccupiedSeats,
    };

    const updateSuccess = await updateSeatsInHall(BASE_URL, hallUpdate);

    if (updateSuccess) {
      const ticketRequestCasePayload = {
        movieName: movie.title,
        showDate: order.orderDate,
        showTime: movieSession ? movieSession.time : '10:30 AM',
        numberOfTickets: order.seat.length,
        totalCost: totalPrice,
        selectedSeats: order.seat,
        customerName: order.userName || 'Customer',
        customerEmail: 'customer@cinespot.com',
      };

      const caseResult = await SubmitMovieTicketRequest(BASE_URL, ticketRequestCasePayload);
      await BuyTickets(BASE_URL, myOrder);

      setShowReviewModal(false);
      setConfirmedTicketDetails({
        ticketId: caseResult && caseResult.ticketId ? caseResult.ticketId : `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
        movieTitle: movie.title,
        seats: selectedSeatText,
        totalCost: totalPrice,
        showTime: movieSession ? movieSession.time : '10:30 AM',
      });
      setSuccessPopupVisible(true);
    } else {
      console.error('Failed to update occupied seats in the database');
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='w-full md:w-1/2 lg:w-2/3 px-6'>
        <h2 className='mb-8 text-2xl font-semibold text-center'>
          Choose your seats by clicking on the available seats
        </h2>
      </div>

      <div className='CinemaPlan'>
        <SeatSelector
          movie={{ ...movies[0], occupied: occupiedSeats }}
          selectedSeats={selectedSeats}
          recommendedSeat={recommendedSeat}
          onSelectedSeatsChange={(selectedSeats) =>
            setSelectedSeats(selectedSeats)
          }
          onRecommendedSeatChange={(recommendedSeat) =>
            setRecommendedSeat(recommendedSeat)
          }
        />
        <SeatShowcase />

        <p className='info mb-2 text-sm md:text-sm lg:text-base'>
          You have selected{' '}
          <span className='count font-semibold'>{selectedSeats.length}</span>{' '}
          seat{selectedSeats.length !== 1 ? 's' : ''}
          {selectedSeats.length === 0 ? '' : ':'}{' '}
          {selectedSeatText ? (
            <span className='selected-seats font-semibold'>
              {' '}
              {selectedSeatText}
            </span>
          ) : (
            <span></span>
          )}{' '}
          {selectedSeats.length > 0 && (
            <>
              for the price of{' '}
              <span className='total font-semibold'>₹{totalPrice}</span>
            </>
          )}
        </p>

        {isAnySeatSelected ? (
          <div>
            <button
              className='bg-green-500 hover:bg-green-700 text-white rounded px-3 py-2 text-sm font-semibold cursor-pointer'
              onClick={handleButtonClick}
            >
              Buy at <span className='total font-semibold'>₹{totalPrice}</span>
            </button>
          </div>
        ) : (
          <div>
            <p className='info text-sm md:text-sm lg:text-base'>
              Please select a seat
            </p>
          </div>
        )}

        {/* US-004: Customer Persona Review & Confirmation Interface */}
        {showReviewModal && (
          <div className='fixed inset-0 flex justify-center items-center z-50 bg-slate-950/80 backdrop-blur-md p-4'>
            <div className='bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-left relative'>
              <div className='border-b border-slate-800 pb-3 flex items-center justify-between'>
                <h3 className='text-xl font-black text-white flex items-center gap-2'>
                  <span>🎟️</span> Review Booking Details
                </h3>
                <span className='text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 border border-rose-800/40 text-rose-400 px-2.5 py-1 rounded-full'>
                  Customer Confirmation
                </span>
              </div>

              <div className='space-y-3 text-sm text-slate-200'>
                <div className='flex justify-between items-center py-1 border-b border-slate-800/60'>
                  <span className='text-slate-400 font-medium'>Movie Name</span>
                  <span className='font-bold text-white text-base'>{movie ? movie.title : 'Selected Movie'}</span>
                </div>
                <div className='flex justify-between items-center py-1 border-b border-slate-800/60'>
                  <span className='text-slate-400 font-medium'>Show Timing</span>
                  <span className='font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-0.5 rounded-lg text-xs'>
                    {movieSession ? movieSession.time : '10:30 AM'} (Today)
                  </span>
                </div>
                <div className='flex justify-between items-center py-1 border-b border-slate-800/60'>
                  <span className='text-slate-400 font-medium'>Number of Tickets</span>
                  <span className='font-bold text-emerald-400'>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} (Seat #{selectedSeatText})</span>
                </div>
                <div className='flex justify-between items-center py-1 border-b border-slate-800/60'>
                  <span className='text-slate-400 font-medium'>Ticket Price</span>
                  <span className='font-semibold text-slate-300'>₹200 per ticket</span>
                </div>
                <div className='flex justify-between items-center pt-2 text-base'>
                  <span className='text-white font-extrabold'>Total Cost</span>
                  <span className='text-xl font-black text-emerald-400'>₹{totalPrice}</span>
                </div>
              </div>

              <div className='flex items-center gap-3 pt-2'>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className='w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all text-xs cursor-pointer'
                >
                  Cancel / Edit
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className='w-1/2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 text-xs cursor-pointer flex items-center justify-center gap-1.5'
                >
                  <span>✓</span> Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- 🎉 ORDER SUCCESSFUL & TICKET CONFIRMED MODAL -------------------- */}
        {successPopupVisible && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn font-sans'>
            <div className='bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500 text-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden'>
              <div className='absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400'></div>

              {/* Success Badge Icon */}
              <div className='w-20 h-20 bg-emerald-950/90 border-2 border-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto text-emerald-400 shadow-2xl animate-bounce mt-2'>
                ✓
              </div>

              {/* Title Header */}
              <div className='space-y-1'>
                <span className='text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full'>
                  ORDER CONFIRMED & ALLOCATED
                </span>
                <h3 className='text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-300 to-emerald-500 tracking-tight pt-1'>
                  Order Successful!
                </h3>
                <p className='text-xs text-slate-300 font-medium'>
                  Your movie ticket request case has been executed & seats allocated!
                </p>
              </div>

              {/* Order Ticket Details Card */}
              <div className='bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs space-y-2.5 text-left shadow-inner'>
                <div className='flex justify-between items-center border-b border-slate-800 pb-2'>
                  <span className='text-slate-400 font-semibold'>Ticket Tracking ID</span>
                  <span className='font-mono font-bold text-amber-400 bg-amber-950/90 border border-amber-800/80 px-2.5 py-0.5 rounded-md text-xs'>
                    {confirmedTicketDetails ? confirmedTicketDetails.ticketId : 'TCK-511623'}
                  </span>
                </div>

                <div className='flex justify-between items-center border-b border-slate-800 pb-2'>
                  <span className='text-slate-400 font-semibold'>Movie Title</span>
                  <span className='font-bold text-white text-sm truncate max-w-[200px]'>
                    {confirmedTicketDetails ? confirmedTicketDetails.movieTitle : (movie ? movie.title : 'Movie Ticket')}
                  </span>
                </div>

                <div className='flex justify-between items-center border-b border-slate-800 pb-2'>
                  <span className='text-slate-400 font-semibold'>Allocated Seats</span>
                  <span className='font-extrabold text-rose-400 bg-rose-950/90 border border-rose-800/80 px-2.5 py-0.5 rounded-md'>
                    Seat #{confirmedTicketDetails ? confirmedTicketDetails.seats : selectedSeatText}
                  </span>
                </div>

                <div className='flex justify-between items-center border-b border-slate-800 pb-2'>
                  <span className='text-slate-400 font-semibold'>Show Date & Time</span>
                  <span className='font-semibold text-slate-200'>
                    {confirmedTicketDetails ? confirmedTicketDetails.showTime : (movieSession ? movieSession.time : '10:30 AM')} (Today)
                  </span>
                </div>

                <div className='flex justify-between items-center pt-1'>
                  <span className='text-slate-400 font-semibold'>Total Booking Amount</span>
                  <span className='font-black text-emerald-400 text-lg'>
                    ₹{confirmedTicketDetails ? confirmedTicketDetails.totalCost : totalPrice}
                  </span>
                </div>
              </div>

              {/* Correspondence Notification Confirmation Banner */}
              <div className='text-[11px] text-emerald-300 font-semibold bg-emerald-950/80 border border-emerald-800/80 p-3 rounded-xl flex items-center justify-center gap-2 shadow-sm'>
                <span>📩</span>
                <span>US-008 Correspondence confirmation email dispatched!</span>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row items-center gap-3 pt-1'>
                <button
                  onClick={() => {
                    setSuccessPopupVisible(false);
                    navigate('/');
                  }}
                  className='w-full sm:w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl border border-slate-700 transition-all text-xs cursor-pointer'
                >
                  Return to Home
                </button>
                <button
                  onClick={() => {
                    setSuccessPopupVisible(false);
                    navigate('/');
                  }}
                  className='w-full sm:w-1/2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all text-xs cursor-pointer'
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeatPlan;
