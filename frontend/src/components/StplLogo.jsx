const STPLLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg width="40" height="40" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" rx="15" fill="url(#grad)" />

        <path
          d="M30 60 L50 40 L65 50 L80 30"
          stroke="white"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polygon points="80,30 75,35 85,35" fill="white" />

        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      <div className="leading-tight">
        <h1 className="text-lg font-bold text-gray-800">STPL</h1>
        <p className="text-xs text-gray-500">ERP SYSTEM</p>
      </div>
    </div>
  );
};

export default STPLLogo;