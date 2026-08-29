async function SendOtp(BASE_URL, mobileNumber) {
  try {
    const response = await fetch(`${BASE_URL}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobileNumber }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      console.error('Send OTP failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
}

export default SendOtp;
