export function Logo() {
  return (
    <svg 
      width="120" 
      height="32" 
      viewBox="0 0 120 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon - Architectural Grid */}
      <rect 
        x="2" 
        y="4" 
        width="24" 
        height="24" 
        rx="2" 
        stroke="var(--text-primary)" 
        strokeWidth="2" 
        fill="none"
      />
      <line 
        x1="14" 
        y1="4" 
        x2="14" 
        y2="28" 
        stroke="var(--text-primary)" 
        strokeWidth="1.5"
      />
      <line 
        x1="2" 
        y1="16" 
        x2="26" 
        y2="16" 
        stroke="var(--text-primary)" 
        strokeWidth="1.5"
      />
      <circle 
        cx="8" 
        cy="10" 
        r="1.5" 
        fill="var(--accent-primary)"
      />
      <circle 
        cx="20" 
        cy="22" 
        r="1.5" 
        fill="var(--accent-primary)"
      />
      
      {/* Text - Nizam */}
      <text 
        x="36" 
        y="22" 
        fill="var(--text-primary)" 
        fontSize="18" 
        fontWeight="600" 
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Tt
      </text>
    </svg>
  );
}