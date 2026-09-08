import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import PageHero from "../components/PageHero";

const contactDetails = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["Phnom Penh", "Cambodia"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+1 (212) 555-0198", "+1 (212) 555-0177"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["lumieregrandehotel@gmail.com "],
  },
  {
    icon: Clock,
    title: "Front Desk Hours",
    lines: ["Open 24 hours", "7 days a week"],
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <PageHero
        eyebrow="Get in Touch"
        title="We'd Love to Hear From You"
        description="Whether you have a question about your reservation, special requests, or hosting an event with us, our team is here to help."
        image="https://images.pexels.com/photos/26729556/pexels-photo-26729556.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1600"
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactDetails.map((detail) => (
            <div
              key={detail.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <detail.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-slate-900">{detail.title}</h3>
              {detail.lines.map((line) => (
                <p key={line} className="mt-1 text-sm text-slate-500">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Form */}
          <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm sm:p-9 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Send a Message
            </p>
            <h2 className="mt-3 font-serif text-2xl text-slate-900 sm:text-3xl">
              Contact Our Team
            </h2>

            {submitted ? (
              <div className="mt-10 flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="font-serif text-xl text-slate-900">Message Sent!</h3>
                <p className="max-w-sm text-slate-500">
                  Thank you for reaching out, {form.name || "guest"}. Our concierge team will
                  respond to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-600"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="Reservation Inquiry"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-amber-600 sm:w-auto"
                >
                  Send Message <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <iframe
              title="Lumiere Grande Hotel Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.5244935972946!2d104.88799717489461!3d11.56221198863841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951adb4d4041d%3A0x8a90e729f62ad800!2sETEC%20Center!5e1!3m2!1sen!2skh!4v1788750066108!5m2!1sen!2skh"
              className="h-80 w-full lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
