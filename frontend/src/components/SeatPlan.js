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

      await SubmitMovieTicketRequest(BASE_URL, ticketRequestCasePayload);
      const buyTickets = await BuyTickets(BASE_URL, myOrder);

      if (buyTickets) {
        setSuccessPopupVisible(true);
        setTimeout(() => {
          setSuccessPopupVisible(false);
          navigate('/');
        }, 2000);
      }
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

        {successPopupVisible && (
          <div className='bg-green-500 text-white px-4 py-2 text-sm md:text-sm lg:text-base rounded absolute bottom-1/2 mb-8 mr-8 flex justify-center'>
            Order Successful
          </div>
        )}
      </div>
    </div>
  );
}

export default SeatPlan;
