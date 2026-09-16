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
    // Prevent React StrictMode from running the callback twice.
    if (ran.current) return;
    ran.current = true;

    async function handleCallback() {
      const token = searchParams.get("token");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        sessionStorage.removeItem("oauth_redirect");

        setError("Sign in was cancelled or failed.");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 2000);

        return;
      }

      if (!token) {
        sessionStorage.removeItem("oauth_redirect");

        setError("No token received.");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 2000);

        return;
      }

      try {
        // Save/login the OAuth token first.
        await loginWithToken(token);

        /*
         * Google/GitHub OAuth leaves the React application,
         * so React Router location.state is not available here.
         *
         * We saved the original destination in sessionStorage
         * before starting OAuth.
         */
        const redirectTo =
          sessionStorage.getItem("oauth_redirect") || "/";

        // Remove it after reading so it isn't reused later.
        sessionStorage.removeItem("oauth_redirect");

        // Return to the original page.
        navigate(redirectTo, {
          replace: true,
        });
      } catch (err) {
        console.error("OAuth login error:", err);

        sessionStorage.removeItem("oauth_redirect");

        setError("Could not complete sign in.");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
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