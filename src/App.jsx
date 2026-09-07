import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import { BookingProvider } from "./context/BookingContext";
import HomePage from "./pages/HomePage";
import SuitesPage from "./pages/SuitesPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import ContactPage from "./pages/ContactPage";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <HashRouter>
      <BookingProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/suites" element={<SuitesPage />} />
              <Route path="/suites/:slug" element={<RoomDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <BookingModal />
      </BookingProvider>
    </HashRouter>
  );
}
