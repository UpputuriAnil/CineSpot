async function VerifyOtp(BASE_URL, mobileNumber, otp) {
  try {
    const response = await fetch(`${BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobileNumber, otp }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      console.error('Verify OTP failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

export default VerifyOtp;
