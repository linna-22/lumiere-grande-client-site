import { createContext, useCallback, useContext, useEffect, useState } from "react";

const PublicHotelSettingsContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const DEFAULT_SETTINGS = {
  hotel_name: "Lumiere Grande Hotel",
  hotel_phone: "",
  hotel_email: "",
  hotel_address: "",
  hotel_logo_url: "",
  check_in_time: "14:00",
  check_out_time: "12:00",
  currency_code: "USD",
};

function normalizeSettings(data) {
  const publicSettings = data?.data || {};

  return {
    hotel_name:
      publicSettings.hotel_name ||
      DEFAULT_SETTINGS.hotel_name,

    hotel_phone:
      publicSettings.hotel_phone ||
      DEFAULT_SETTINGS.hotel_phone,

    hotel_email:
      publicSettings.hotel_email ||
      DEFAULT_SETTINGS.hotel_email,

    // Your current backend returns "hotel_addres"
    // from /api/public-settings, so support that key
    // without changing the backend.
    hotel_address:
      publicSettings.hotel_address ||
      publicSettings.hotel_addres ||
      DEFAULT_SETTINGS.hotel_address,

    hotel_logo_url:
      publicSettings.hotel_logo_url ||
      DEFAULT_SETTINGS.hotel_logo_url,

    check_in_time:
      publicSettings.check_in_time ||
      DEFAULT_SETTINGS.check_in_time,

    check_out_time:
      publicSettings.check_out_time ||
      DEFAULT_SETTINGS.check_out_time,

    currency_code:
      publicSettings.currency_code ||
      DEFAULT_SETTINGS.currency_code,
  };
}

export function PublicHotelSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchHotelSettings = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/public-settings`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load hotel settings."
        );
      }

      setSettings(normalizeSettings(data));
    } catch (error) {
      console.error(
        "Failed to load public hotel settings:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotelSettings();

    // Refresh when the visitor returns to the tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchHotelSettings();
      }
    };

    window.addEventListener(
      "focus",
      fetchHotelSettings
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    // Also check periodically so an already-open
    // public site picks up admin changes automatically.
    const interval = window.setInterval(
      fetchHotelSettings,
      30000
    );

    return () => {
      window.removeEventListener(
        "focus",
        fetchHotelSettings
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.clearInterval(interval);
    };
  }, [fetchHotelSettings]);

  return (
    <PublicHotelSettingsContext.Provider
      value={{
        settings,
        loading,
        fetchHotelSettings,
      }}
    >
      {children}
    </PublicHotelSettingsContext.Provider>
  );
}

export function usePublicHotelSettings() {
  const context = useContext(
    PublicHotelSettingsContext
  );

  if (!context) {
    throw new Error(
      "usePublicHotelSettings must be used inside PublicHotelSettingsProvider"
    );
  }

  return context;
}
