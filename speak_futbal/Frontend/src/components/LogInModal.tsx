import React, { useState } from "react";
import ApiService from "@/services/api";
import { useGoogleLogin } from '@react-oauth/google';

interface LogInModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onLoginSuccess?: (userData: any) => void;
}

const LogInModal: React.FC<LogInModalProps> = ({
  open,
  onClose,
  onSwitchToSignUp,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userData = await ApiService.login(formData);
      onLoginSuccess?.(userData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };
   const handleGoogleSuccess = async (credentialResponse: any) => {
  setIsLoading(true);
  try {
    // Send token to Django backend with credentials to receive session cookie
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/google-login/`, {
      method: 'POST',
      credentials: 'include', // Important: include cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: credentialResponse.access_token,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || 'Authentication failed');
      return;
    }
    
    const userData = await response.json();
    console.log('Google login successful:', userData);
      if (userData.token) {
    localStorage.setItem('authToken', userData.token);
  }
    // Call parent with user data (no need for localStorage)
    onLoginSuccess?.(userData);
    onClose();
  } catch (err) {
    console.error('Google login error:', err);
    setError("Failed to authenticate with Google");
  } finally {
    setIsLoading(false);
  }
};
   const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google login failed"),
    flow: 'implicit',
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex">
      {/* Left colored section */}
      <div className="flex-1 h-full relative" style={{ backgroundColor: "#a3b1c6" }}>
        {/* Branding at top left */}
        <div className="absolute top-6 left-8">
          <span className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "Poppins, sans-serif", color: "#111827" }}>
            Speak Football
          </span>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[50%]">
          <h2 className="text-4xl font-extrabold text-[#111827] text-center mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Discover different events around you.
          </h2>
          <p className="text-base text-gray-800 text-center leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
            Log In to connect with football.
          </p>
        </div>
      </div>
      {/* Right colored section with centered Log In box */}
      <div
        className="w-full max-w-md h-full flex items-center justify-center"
        style={{ backgroundColor: "#a3b1c6" }}
      >
        <div className="relative w-full bg-white rounded-2xl shadow-2xl flex flex-col justify-center items-center px-8 py-6 mr-12" style={{ zIndex: 10 }}>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          {/* Welcome Section */}
          <div className="w-full flex flex-col items-center mb-4 mt-2">
            <h1 className="text-2xl font-bold text-[#5D6C8A] mb-2">Welcome to Speak Football</h1>
            <p className="text-gray-600 mb-4 text-center">Log in to your account</p>
          </div>
          {/* Social Auth */}
          <div className="w-full flex flex-col gap-3 mb-4">
             <button 
              type="button"
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 border border-gray-300 rounded py-2 font-semibold text-black hover:bg-gray-50 transition"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>
            {/* <button className="flex items-center justify-center gap-2 border border-gray-300 rounded py-2 font-semibold text-black hover:bg-gray-50 transition">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
            </button> */}
          </div>
          {/* OR Divider */}
          <div className="flex items-center w-full mb-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-3 text-gray-400 font-semibold">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          {/* Log In Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full mb-2">
            {error && (
              <div className="text-red-500 text-sm text-center mb-2">
                {error}
              </div>
            )}
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none text-gray-800"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none text-gray-800"
              required
            />
            {/* Forgot password */}
            <div className="flex justify-end mb-2">
              <button
                type="button"
                className="text-xs text-[#5D6C8A] hover:underline"
                onClick={onForgotPassword}
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#5D6C8A] text-white py-2 rounded font-semibold hover:bg-[#4a5870] transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>
          </form>
          {/* Don't have an account */}
          <div className="w-full text-center mt-2 mb-2">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <button
              type="button"
              className="text-[#5D6C8A] font-semibold hover:underline"
              onClick={onSwitchToSignUp}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogInModal;