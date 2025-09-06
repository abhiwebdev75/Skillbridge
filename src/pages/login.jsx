import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, sendPasswordResetEmail, getIdToken } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAa1lNKQPgt6f0dd6TZ4VtgOiLYb7ukzE",
  authDomain: "skillbridge-81d5e.firebaseapp.com",
  projectId: "skillbridge-81d5e",
  storageBucket: "skillbridge-81d5e.firebasestorage.app",
  messagingSenderId: "854363859288",
  appId: "1:854363859288:web:c04fb725eebb0b52f35d2d",
  measurementId: "G-E78EQCCY5R"
};

// Initialize Firebase app and authentication outside of the component
// to ensure it's done only once.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Login = () => {
  // State to manage the active authentication tab
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'phone'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Create a Google Auth provider instance
  const googleProvider = new GoogleAuthProvider();

  // A new state to manage the authentication loading status
  const [authLoading, setAuthLoading] = useState(true);

  // State for password reset modal
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // onAuthStateChanged listener to track authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirect to  on successful login only if not loading
        navigate('/');
      }
      setAuthLoading(false); // Set authLoading to false once the check is complete
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [auth, navigate]);

  // Initialize RecaptchaVerifier only when switching to phone tab and container exists
  useEffect(() => {
    if (activeTab === 'phone' && !window.recaptchaVerifier) {
      setTimeout(() => {
        if (document.getElementById('recaptcha-container')) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
          });
          window.recaptchaVerifier.render();
        }
      }, 0);
    }
    // Clean up on unmount or tab switch
    return () => {
      if (window.recaptchaVerifier && activeTab !== 'phone') {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, [activeTab, auth]);

  // Example function to upload data to backend after login
  const uploadDataExample = async (userData) => {
    try {
      // Get the ID token for the authenticated user
      const idToken = await userData.getIdToken(true); 

      // Send the token in the Authorization header
      const response = await fetch('http://your-backend-url.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ title: 'New task from React', description: 'This is a test task.' })
      });

      if (response.ok) {
        console.log("Data uploaded to Firestore successfully.");
      } else {
        console.error("Failed to upload data:", await response.text());
      }
    } catch (err) {
      console.error("Error getting ID token or uploading data:", err);
    }
  };

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // userCredential.user contains the user object
      await uploadDataExample(userCredential.user); // Example: Upload data right after login
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError('Failed to log in. Please try again.');
        console.error("Firebase Login Error:", err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await uploadDataExample(userCredential.user); // Example: Upload data right after login
      navigate('/');
    } catch (err) {
      setError('Failed to log in with Google. Please try again.');
      console.error("Google Login Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone number login (step 1: send code)
  const handlePhoneLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setIsLoading(false);
      setError('Verification code sent! Please enter it below.');
    } catch (err) {
      setIsLoading(false);
      setError('Failed to send verification code. Please check the phone number and try again.');
      console.error("Phone Login Error:", err.message);
    }
  };

  // Handle phone number login (step 2: verify code)
  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      await uploadDataExample(userCredential.user); // Example: Upload data right after login
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      setError('Invalid verification code. Please try again.');
      console.error("Code Verification Error:", err.message);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email to reset the password.');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError('A password reset email has been sent. Please check your inbox.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('The email address is not registered.');
      } else {
        setError('Failed to send password reset email. Please try again.');
        console.error("Password Reset Error:", err.message);
      }
    } finally {
      setIsLoading(false);
      setShowPasswordResetModal(false); // Close the modal after sending the email
    }
  };

  // Render a loading state while Firebase checks auth status
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 z-10 pt-24 md:pt-32">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full backdrop-blur-md bg-opacity-80">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Login to your account</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-4 rounded-l-xl text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-2 px-4 rounded-r-xl text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'phone' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Phone Number
          </button>
        </div>

        {/* Email/Password form */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-between items-center text-sm">
              <a href="#" onClick={() => setShowPasswordResetModal(true)} className="text-blue-500 hover:underline">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* Phone Number form */}
        {activeTab === 'phone' && (
          <div className="space-y-4">
            {confirmationResult ? (
              <form onSubmit={verifyCode} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="verificationCode">
                    Verification Code
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    id="verificationCode"
                    type="text"
                    placeholder="Enter code from SMS"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phoneNumber">
                    Phone Number
                  </label>
                  <input
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 98000 99999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                  onClick={handlePhoneLogin}
                  className="w-full bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending code..." : "Sign in with Phone"}
                </button>
                <div id="recaptcha-container"></div>
              </div>
            )}
          </div>
        )}

        {/* Social Login options (always visible) */}
        <div className="mt-6 space-y-4">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold transition-colors duration-200 hover:bg-gray-100"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0006 4.96572C14.0041 4.96572 15.6586 5.67285 16.9749 6.96349L21.5794 2.35899C19.1251 -0.0768018 15.8239 -0.965725 12.0006 -0.965725C7.26521 -0.965725 3.12469 1.45524 0.90625 5.09349L5.43859 8.66572C6.44754 6.10398 9.00693 4.96572 12.0006 4.96572Z" fill="#EA4335"/><path d="M11.9994 23.9657C15.8228 23.9657 19.1244 23.0769 21.5779 20.6416L16.9734 16.0371C15.657 17.3277 14.0025 18.0348 11.9994 18.0348C9.00631 18.0348 6.44692 16.8966 5.43859 14.3348L0.90625 17.9071C3.12469 21.5453 7.26521 23.9657 11.9994 23.9657Z" fill="#34A853"/><path d="M11.9994 4.96572C13.5684 4.96572 14.9754 5.50348 16.0694 6.48545L20.6698 1.88506C19.1174 0.443916 17.1517 -0.198335 14.9452 -0.224856H14.9431C14.1611 -0.219803 13.3831 -0.169165 12.6133 -0.0638531L12.0003 4.96572H11.9994Z" fill="#4285F4"/><path d="M0.90625 5.09349L5.43859 8.66572C5.00083 9.77334 4.77196 11.0063 4.77196 12.2514C4.77196 13.4965 5.00083 14.7295 5.43859 15.8371L0.90625 19.4094C-0.302192 17.1129 -0.965725 14.7292 -0.965725 12.2514C-0.965725 9.77364 -0.302192 7.39003 0.90625 5.09349Z" fill="#FBBC04"/></svg>
            <span>Sign in with Google</span>
          </button>
        </div>
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up here</Link>
        </p>
      </div>

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-8 bg-white rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Reset Password</h3>
            <p className="text-gray-600 text-sm mb-4">Enter your email address to receive a password reset link.</p>
            <input
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowPasswordResetModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success message modal */}
      {resetEmailSent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-8 bg-white rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Success!</h3>
            <p className="text-gray-600 text-sm mb-4">A password reset email has been sent to your email address.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setResetEmailSent(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
