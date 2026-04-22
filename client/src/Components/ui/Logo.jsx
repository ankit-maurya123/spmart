const Logo = ({ size = "md" }) => {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-lg", gap: "gap-1.5" },
    md: { icon: "w-8 h-8 sm:w-9 sm:h-9", text: "text-xl sm:text-2xl", gap: "gap-2" },
    lg: { icon: "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11", text: "text-xl sm:text-2xl md:text-3xl", gap: "gap-2 sm:gap-2.5" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* Icon */}
      <div className={`${s.icon} relative flex-shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="logoShine" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="logoAccent" x1="16" y1="8" x2="28" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          {/* Rounded square background */}
          <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#logoBg)" />
          <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#logoShine)" />

          {/* Shopping bag body */}
          <path
            d="M10 16L12 32H28L30 16H10Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Bag handles */}
          <path
            d="M15 16V13C15 10.2386 17.2386 8 20 8C22.7614 8 25 10.2386 25 13V16"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sparkle / star accent */}
          <circle cx="20" cy="23" r="3.5" fill="url(#logoAccent)" />
          <path
            d="M20 19.5L20.8 21.8L23.2 21.8L21.2 23.3L22 25.5L20 24L18 25.5L18.8 23.3L16.8 21.8L19.2 21.8Z"
            fill="white"
            fillOpacity="0.9"
          />
        </svg>
      </div>

      {/* Text */}
      <h1 className={`${s.text} font-extrabold tracking-tight leading-none`}>
        <span className="text-cyan-600 dark:text-cyan-400">SP</span>
        <span className="text-yellow-500 dark:text-yellow-400">MART</span>
      </h1>
    </div>
  );
};

export default Logo;
