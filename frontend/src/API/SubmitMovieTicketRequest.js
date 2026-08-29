async function SubmitMovieTicketRequest(BASE_URL, ticketRequest) {
  try {
    // Client-side Validation before submission
    if (!ticketRequest.movieName || ticketRequest.movieName.trim() === '') {
      console.error('Validation Failed: Movie Name is required.');
      return false;
    }
    if (!ticketRequest.showDate || ticketRequest.showDate.trim() === '') {
      console.error('Validation Failed: Show Date is required.');
      return false;
    }
    if (!ticketRequest.showTime || ticketRequest.showTime.trim() === '') {
      console.error('Validation Failed: Show Time is required.');
      return false;
    }
    if (!ticketRequest.numberOfTickets || ticketRequest.numberOfTickets <= 0) {
      console.error('Validation Failed: Number of tickets must be at least 1.');
      return false;
    }

    const response = await fetch(`${BASE_URL}/movie-ticket-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketRequest),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Movie Ticket Request Case submitted successfully:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('Movie Ticket Request Case submission failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Error occurred while submitting Movie Ticket Request case:', error);
    return false;
  }
}

export default SubmitMovieTicketRequest;
