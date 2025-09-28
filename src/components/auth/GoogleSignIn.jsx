import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// ✅ Google Client ID from your OAuth credentials
const GOOGLE_CLIENT_ID = "762069684819-ad2l01051u8ophvbttbl1m5rirc81qt8.apps.googleusercontent.com";

const GoogleSignIn = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'filled_blue',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 320
            }
          );
        }
      }
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      onError?.('Failed to initialize Google Sign-In');
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      setIsLoading(true);
      
      // ✅ Call AuthContext login with the Google credential
      const loginResponse = await login(response.credential);
      
      // ✅ Success callback
      onSuccess?.(loginResponse);
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Access denied') || error.message.includes('403')) {
        errorMessage = 'Access denied. Only workingprojectjagan123@gmail.com is authorized.';
      } else if (error.message.includes('Invalid or expired')) {
        errorMessage = 'Google authentication failed. Please try again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      onError?.(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Google Sign-In Button Container */}
      <div 
        ref={googleButtonRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          opacity: isLoading ? 0.6 : 1,
          transition: 'opacity 0.2s'
        }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#667eea',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Verifying admin credentials...
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;
