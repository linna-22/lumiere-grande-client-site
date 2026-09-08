import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import SuitesPage from "./pages/SuitesPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import ContactPage from "./pages/ContactPage";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

function Chrome({ children }) {
  const { pathname } = useLocation();
  const bare = ["/login", "/register", "/forgot-password", "/verify-reset-otp", "/reset-password"].includes(pathname);

  if (bare) return children;

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

function LoginRoute() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(form) {
    const data = await login(form);

    if (data.requires_2fa) {
      throw new Error(
        "This login is for customers only. Staff should use the staff portal.",
      );
    }

    if (data.user?.role !== "customer") {
      await logout();
      throw new Error(
        "This login is for customers only. Staff should use the staff portal.",
      );
    }

    navigate("/");
  }

  return (
    <Login
      onSubmit={handleSubmit}
      onNavigateRegister={() => navigate("/register")}
    />
  );
}

function RegisterRoute() {
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(form) {
    await register({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.confirm,
    });
    navigate("/login");
  }

  return (
    <Register
      onSubmit={handleSubmit}
      onNavigateLogin={() => navigate("/login")}
    />
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <BookingProvider>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
            <Chrome>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/suites" element={<SuitesPage />} />
                <Route path="/suites/:slug" element={<RoomDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/register" element={<RegisterRoute />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </Routes>
            </Chrome>
          </div>
          <BookingModal />
        </BookingProvider>
      </AuthProvider>
    </HashRouter>
  );
}
