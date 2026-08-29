import React, { useState, useRef, useEffect } from 'react';
import Login from '../API/Login';
import SendOtp from '../API/SendOtp';
import VerifyOtp from '../API/VerifyOtp';
import GoogleCloudAuth from '../API/GoogleCloudAuth';
import { auth } from '../firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function LoginForm({ onClose, onLogin }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api/v1';
  const [authMode, setAuthMode] = useState('mobile'); // 'mobile' | 'email' | 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const formRef = useRef(null);

  // Helper to parse Google JWT ID Token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = parseJwt(response.credential);
      if (!payload) throw new Error('Could not parse Google ID token.');

      const googleUserPayload = {
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        googleId: payload.sub,
        photoURL: payload.picture,
      };

      const backendUser = await GoogleCloudAuth(BASE_URL, googleUserPayload);
      const userSession = {
        userName: backendUser && backendUser.userName ? backendUser.userName : googleUserPayload.name,
        userId: backendUser && backendUser.userId ? backendUser.userId : Math.floor(Math.random() * 1000000),
        email: googleUserPayload.email,
        photoURL: googleUserPayload.photoURL,
      };

      setInfoMsg(`Signed in as ${userSession.userName}!`);
      setTimeout(() => {
        onClose();
        onLogin(userSession);
      }, 600);
    } catch (error) {
      console.error('Google One-Tap error:', error);
      setErrorMsg('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Triggers Google's OFFICIAL One-Tap & Account Choice Overlay
  const handleGoogleClick = () => {
    setErrorMsg('');
    setInfoMsg('');

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('Google One-Tap reason:', notification.getNotDisplayedReason() || notification.getSkippedReason());
        }
      });
    } else {
      setErrorMsg('Google Identity Services script loading. Please try again in a moment.');
    }
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const userData = await Login(BASE_URL, formData.email, formData.password);
      if (userData) {
        onClose();
        onLogin(userData);
      } else {
        setErrorMsg('Invalid email or password credentials.');
      }
    } catch (error) {
      setErrorMsg('Login failed. Please check backend connection.');
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          window.recaptchaVerifier = null;
        }
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = '+91' + mobileNumber;

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;

      setOtpSent(true);
      setAuthMode('otp');
      setInfoMsg(`Real SMS OTP sent via Firebase to +91 ${mobileNumber}! Check your phone.`);
    } catch (firebaseError) {
      console.warn('Firebase SMS warning/fallback:', firebaseError);

      const res = await SendOtp(BASE_URL, mobileNumber);
      if (res && res.otp) {
        setOtpSent(true);
        setAuthMode('otp');
        setInfoMsg(`OTP sent to +91 ${mobileNumber}. (Test OTP: ${res.otp})`);
      } else {
        setErrorMsg('Failed to generate OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp || otp.length < 4) {
      setErrorMsg('Please enter the valid OTP code.');
      return;
    }

    setLoading(true);

    try {
      if (window.confirmationResult) {
        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;
        const userSession = {
          userName: user.phoneNumber || ('User ' + mobileNumber.substring(6)),
          userId: user.uid || Math.floor(Math.random() * 1000000),
        };
        onClose();
        onLogin(userSession);
        return;
      }
    } catch (fbVerifyError) {
      console.warn('Firebase OTP verification fallback:', fbVerifyError);
    }

    const res = await VerifyOtp(BASE_URL, mobileNumber, otp);
    if (res && res.userName) {
      onClose();
      onLogin(res);
    } else {
      setErrorMsg('Invalid OTP code. Please enter the correct OTP.');
    }
    setLoading(false);
  };

  return (
    <div className='bg-white text-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative mx-auto text-center font-sans' ref={formRef}>
      {/* Invisible Recaptcha Container for Firebase */}
      <div id='recaptcha-container'></div>

      {/* Top Close Button */}
      <button
        onClick={onClose}
        className='absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full text-xl font-bold cursor-pointer leading-none'
        aria-label='Close'
      >
        ✕
      </button>

      {/* Modal Header */}
      <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6 tracking-tight'>
        Get Started
      </h2>

      {/* Social Login Options */}
      <div className='space-y-3 mb-6'>
        <button
          type='button'
          onClick={handleGoogleClick}
          className='w-full border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm'
        >
          <svg className='w-5 h-5' viewBox='0 0 24 24'>
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
          <span>Continue with Google</span>
        </button>

        <button
          type='button'
          onClick={() => setAuthMode('email')}
          className='w-full border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm'
        >
          <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
          </svg>
          <span>Continue with Email</span>
        </button>

        <button
          type='button'
          onClick={() => setAuthMode('apple')}
          className='w-full border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm'
        >
          <svg className='w-5 h-5 fill-current text-black' viewBox='0 0 170 170'>
            <path d='M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.83.13-9.67-1.92-14.52-6.14-3.23-2.76-7.15-7.46-11.77-14.1-6.73-9.76-12.01-20.94-15.86-33.54-3.84-12.61-5.77-24.89-5.77-36.85 0-15.42 3.96-28.53 11.89-39.31 7.93-10.79 17.84-16.3 29.74-16.54 4.58 0 9.77 1.18 15.57 3.55 5.81 2.37 9.87 3.56 12.19 3.56 2.12 0 6.13-1.14 12.03-3.43 5.9-2.28 10.97-3.37 15.22-3.26 11.45.63 21.05 4.96 28.8 13.01-10.27 6.23-15.3 14.97-15.08 26.2.22 8.76 3.65 16.14 10.29 22.13 6.64 5.99 14.61 9.4 23.91 10.23-2.58 7.74-6.08 15.65-10.51 23.72zm-28.32-108.5c0 6.64-2.45 13.06-7.36 19.26-5.87 7.37-12.97 11.66-21.29 11.02-.13-.98-.2-1.83-.2-2.55 0-6.64 2.58-13.23 7.75-19.78 5.17-6.55 12.18-10.79 21.03-11.49.07 1.13.07 2.31.07 3.54z' />
          </svg>
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* Divider */}
      <div className='relative flex items-center justify-center mb-6'>
        <div className='border-t border-gray-200 w-full'></div>
        <span className='bg-white px-3 text-xs font-semibold text-gray-400 tracking-wider uppercase absolute'>
          OR
        </span>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className='mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold'>
          ⚠️ {errorMsg}
        </div>
      )}
      {infoMsg && (
        <div className='mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold animate-pulse'>
          📲 {infoMsg}
        </div>
      )}

      {/* Mobile Number Entry View */}
      {authMode !== 'email' && !otpSent && (
        <form onSubmit={handleSendOtp} className='space-y-4'>
          <div className='flex items-center border-b border-gray-300 focus-within:border-red-500 py-2 transition-colors'>
            <div className='flex items-center space-x-1 pr-3 text-sm font-semibold text-gray-700 border-r border-gray-300'>
              <span className='text-lg'>🇮🇳</span>
              <span>+91</span>
              <span className='text-xs text-gray-400'>∨</span>
            </div>
            <input
              type='tel'
              maxLength={10}
              placeholder='Continue with mobile number'
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              className='w-full pl-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent font-medium'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] text-sm disabled:opacity-50'
          >
            {loading ? 'Sending OTP...' : 'Generate OTP'}
          </button>
        </form>
      )}

      {/* OTP Verification View */}
      {authMode === 'otp' && otpSent && (
        <form onSubmit={handleVerifyOtp} className='space-y-4'>
          <div className='text-left text-xs text-gray-600 mb-2'>
            Enter the 6-digit OTP sent to <span className='font-bold text-gray-900'>+91 {mobileNumber}</span>:
          </div>
          <input
            type='text'
            maxLength={6}
            placeholder='Enter 6-digit OTP'
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-center text-lg font-bold tracking-widest text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/50'
            required
            autoFocus
          />

          <div className='flex items-center justify-between text-xs pt-1'>
            <button
              type='button'
              onClick={() => {
                setOtpSent(false);
                setAuthMode('mobile');
              }}
              className='text-rose-600 font-semibold hover:underline cursor-pointer'
            >
              Change Mobile Number
            </button>
            <button
              type='button'
              onClick={handleSendOtp}
              className='text-gray-500 font-medium hover:text-gray-800 cursor-pointer'
            >
              Resend OTP
            </button>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] text-sm disabled:opacity-50'
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      )}

      {/* Standard Email View Option */}
      {authMode === 'email' && (
        <form onSubmit={handleEmailSubmit} className='space-y-3 text-left'>
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1'>Email Address</label>
            <input
              type='email'
              name='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={handleEmailChange}
              className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/50'
              required
            />
          </div>
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1'>Password</label>
            <input
              type='password'
              name='password'
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleEmailChange}
              className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/50'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] text-sm mt-2'
          >
            Login with Email
          </button>
          <div className='text-center pt-2'>
            <button
              type='button'
              onClick={() => setAuthMode('mobile')}
              className='text-xs text-rose-600 font-semibold hover:underline cursor-pointer'
            >
              ← Back to Mobile OTP Login
            </button>
          </div>
        </form>
      )}

      {/* Footer Legal Terms */}
      <p className='text-[11px] text-gray-400 mt-6 leading-relaxed'>
        By continuing, you agree to our{' '}
        <a href='#' className='underline hover:text-gray-600 transition-colors'>
          Terms & Conditions
        </a>{' '}
        and{' '}
        <a href='#' className='underline hover:text-gray-600 transition-colors'>
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

export default LoginForm;
