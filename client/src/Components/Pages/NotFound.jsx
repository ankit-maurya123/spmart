import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="pt-20 md:pt-24 pb-12 min-h-screen flex items-center justify-center">
      <div className="max-w-[1200px] mx-auto px-4 text-center animate-fade-in-up">
        {/* 404 heading */}
        <h1 className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold leading-none section-heading select-none">
          404
        </h1>

        {/* Animated cart icon */}
        <div className="animate-float my-6">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-sm rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>
          <Link
            to="/store"
            className="px-8 py-3 border-2 border-gray-200 dark:border-white/[0.1] text-gray-800 dark:text-white font-bold text-sm rounded-full hover:border-yellow-400 dark:hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-400/5 transition-all duration-300 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Visit Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
