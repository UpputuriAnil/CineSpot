async function GoogleCloudAuth(BASE_URL, googleUserPayload) {
  try {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleUserPayload),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      console.error('Google Cloud Auth failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Error with Google Cloud Auth:', error);
    return false;
  }
}

export default GoogleCloudAuth;
