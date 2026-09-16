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
    if (ran.current) return;
    ran.current = true;

    async function handleCallback() {
      const token = searchParams.get("token");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        setError("Sign in was cancelled or failed.");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);

        return;
      }

      if (!token) {
        setError("No token received.");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);

        return;
      }

      try {
        // Login using the token from Laravel
        await loginWithToken(token);

        // Get the page the customer originally wanted
        const redirectTo =
          sessionStorage.getItem("oauth_redirect") || "/";

        // Remove it after reading
        sessionStorage.removeItem("oauth_redirect");

        // Return customer to original page
        navigate(redirectTo, {
          replace: true,
        });
      } catch (err) {
        console.error("OAuth callback error:", err);

        setError("Could not complete sign in.");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    }

    handleCallback();
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-950 text-white">
      {error ? (
        <p className="text-rose-400 text-sm">
          {error} Redirecting to login...
        </p>
      ) : (
        <>
          <Loader2
            size={24}
            className="animate-spin text-amber-400"
          />

          <p className="text-slate-300 text-sm">
            Signing you in...
          </p>
        </>
      )}
    </div>
  );
}