import { Link } from "react-router-dom";
import usePageMeta from "../../hooks/usePageMeta";

const STATS = [
  { value: "10K+", label: "Customers" },
  { value: "5K+", label: "Products" },
  { value: "50+", label: "Partners" },
  { value: "30 Min", label: "Delivery" },
];

const VALUES = [
  {
    title: "Quality",
    description: "We source only the freshest and highest-quality products from trusted suppliers.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-400/10",
  },
  {
    title: "Affordability",
    description: "Great prices without compromising on quality. Smart shopping starts here.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-400/10",
  },
  {
    title: "Fast Delivery",
    description: "Lightning-fast delivery to your doorstep. Fresh groceries in 30 minutes or less.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-400/10",
  },
  {
    title: "Community",
    description: "Supporting local farmers and businesses to build a stronger community together.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-400/10",
  },
];

const About = () => {
  usePageMeta({
    title: "About Us",
    description:
      "SPMart brings your local kirana shopping online. Learn how we partner with trusted suppliers and small businesses to deliver fresh groceries in 30 minutes.",
  });

  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6 animate-fade-in-up">
          <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">About</span>
        </div>

        {/* Page heading */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            About <span className="section-heading">SPMART</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Your trusted neighborhood grocery store, reimagined for the digital age.
          </p>
        </div>

        {/* Company story card */}
        <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8 md:p-10 mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
            Our <span className="section-heading">Story</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              SPMART was born from a simple idea — making grocery shopping effortless, affordable, and enjoyable.
              We started as a small local store with a big dream: to bring the freshest produce and everyday
              essentials right to your doorstep without the hassle.
            </p>
            <p>
              Today, we serve thousands of happy customers across the city, partnering with local farmers and
              trusted brands to deliver quality products at unbeatable prices. Every item on our shelves is
              handpicked to ensure you get nothing but the best for your family.
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14 animate-fade-in-up">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold section-heading mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission section */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 rounded-2xl p-6 sm:p-8 md:p-10 mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
            Our Mission
          </h2>
          <p className="text-cyan-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            To revolutionize grocery shopping by combining convenience, quality, and affordability.
            We believe everyone deserves access to fresh, high-quality groceries without breaking the
            bank — delivered fast, with a smile.
          </p>
        </div>

        {/* Values grid */}
        <div className="animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
            What We <span className="section-heading">Stand For</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 sm:p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${value.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <svg className={`w-6 h-6 ${value.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
