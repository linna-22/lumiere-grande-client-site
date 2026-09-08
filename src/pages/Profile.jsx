import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Globe,
  Loader2,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../api/user";
import { showSuccessToast } from "../utils/toast";

const emptyForm = {
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  identification_type: "",
  identification_number: "",
  nationality: "",
};

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await getProfile();
        const guest = res.data;
        setForm({
          first_name: guest.first_name ?? "",
          last_name: guest.last_name ?? "",
          phone: guest.phone ?? "",
          address: guest.address ?? "",
          identification_type: guest.identification_type ?? "",
          identification_number: guest.identification_number ?? "",
          nationality: guest.nationality ?? "",
        });
      } catch (err) {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile(form);
      showSuccessToast("Profile updated successfully!");
      navigate("/");
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        const firstError = Object.values(err.data.errors)[0]?.[0];
        setError(firstError || "Please check your details and try again.");
      } else if (err.status === 404) {
        setNotFound(true);
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
      <h1 className="font-serif text-3xl text-slate-900">My Profile</h1>
      <p className="mt-2 text-sm text-slate-500">
        Manage your personal details and contact information.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-lg font-semibold text-white">
            {(user?.name?.[0] || "?").toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-slate-900">{user?.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Mail size={13} />
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {notFound ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Your profile hasn't been fully set up yet. Please contact support so
          we can complete your account setup.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                First Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.first_name}
                  onChange={update("first_name")}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="First name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Last Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.last_name}
                  onChange={update("last_name")}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Phone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="+855 12 345 678"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Nationality
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.nationality}
                  onChange={update("nationality")}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Cambodian"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                ID Type
              </label>
              <div className="relative">
                <IdCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={form.identification_type}
                  onChange={update("identification_type")}
                  className="w-full appearance-none rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select ID type</option>
                  <option value="Passport">Passport</option>
                  <option value="Identity Card">Identity Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                ID Number
              </label>
              <div className="relative">
                <IdCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.identification_number}
                  onChange={update("identification_number")}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="ID / passport number"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.address}
                onChange={update("address")}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm focus:border-amber-500 focus:outline-none"
                placeholder="Street, city, country"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}