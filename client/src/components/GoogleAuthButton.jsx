import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

export default function GoogleAuthButton({ onSuccess, onError, disabled = false }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(Boolean(window.google?.accounts?.id));
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setReady(true);
      return undefined;
    }

    let script = document.getElementById(GOOGLE_SCRIPT_ID);
    const handleLoad = () => setReady(true);
    if (!script) {
      script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', handleLoad);
    }

    return () => script?.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    if (!ready || !clientId || !buttonRef.current || disabled) return;
    buttonRef.current.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => onSuccess(credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      width: buttonRef.current.offsetWidth || 360,
    });
  }, [clientId, disabled, onSuccess, ready]);

  const handleUnavailable = () => {
    onError('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to the client environment.');
  };

  if (!clientId) {
    return (
      <button type="button" onClick={handleUnavailable} disabled={disabled} className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white py-2.5 text-[15px] font-medium text-ink transition hover:bg-paper disabled:opacity-60">
        <span className="text-lg font-bold text-blue-600">G</span>
        Continue with Google
      </button>
    );
  }

  return <div ref={buttonRef} className="flex min-h-10 w-full justify-center" aria-label="Continue with Google" />;
}
