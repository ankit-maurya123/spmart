import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import usePageMeta from "../../hooks/usePageMeta";

const INFO_CARDS = [
  {
    title: "Email",
    value: "support@spmart.com",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "text-cyan-500",
    bg: "bg-cyan-100 dark:bg-cyan-400/10",
  },
  {
    title: "Phone",
    value: "+123 456 7890",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-400/10",
  },
  {
    title: "Address",
    value: "Your City, Country",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-400/10",
  },
];

const Contact = () => {
  usePageMeta({
    title: "Contact Us",
    description:
      "Get in touch with SPMart support. Email support@spmart.com, call us, or send a message — we typically reply within a few hours.",
  });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await axios.post("/api/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6 animate-fade-in-up">
          <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">Contact</span>
        </div>

        {/* Page heading */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            Get in <span className="section-heading">Touch</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-14 animate-fade-in-up">
          {INFO_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 text-center hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Contact form + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in-up">
          {/* Form */}
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-5">
              Send us a Message
            </h2>

            {submitted && (
              <div className="mb-5 p-4 bg-green-100 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-semibold">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Write your message..."
                  className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Map placeholder */}
          <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden flex items-center justify-center min-h-[300px] lg:min-h-0">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                Find Us Here
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Visit our store at Your City, Country. We're open Monday to Saturday, 8 AM to 10 PM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
