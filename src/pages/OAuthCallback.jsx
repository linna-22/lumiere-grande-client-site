import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoking effects in dev.
    if (ran.current) return;
    ran.current = true;

    async function handleCallback() {
      const token = searchParams.get("token");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        setError("Sign in was cancelled or failed.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!token) {
        setError("No token received.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        await loginWithToken(token);
        navigate("/");
      } catch (err) {
        setError("Could not complete sign in.");
        setTimeout(() => navigate("/login"), 2000);
      }
    }

    handleCallback();
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-950 text-white">
      {error ? (
        <p className="text-rose-400 text-sm">{error} Redirecting to login...</p>
      ) : (
        <>
          <Loader2 size={24} className="animate-spin text-amber-400" />
          <p className="text-slate-300 text-sm">Signing you in...</p>
        </>
      )}
    </div>
  );
}