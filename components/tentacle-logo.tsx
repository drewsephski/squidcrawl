'use client';

interface TentacleLogoProps {
  className?: string;
}

export function TentacleLogo({ className = '' }: TentacleLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Squid body/head */}
      <ellipse cx="16" cy="10" rx="6" ry="5" fill="currentColor" opacity="0.9" />
      
      {/* Tentacles flowing down */}
      <path
        d="M11 14.5 Q10 18 11 22 Q12 26 10 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M14 15 Q13.5 19 14.5 23 Q15.5 27 14 29"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M18 15 Q18.5 19 17.5 23 Q16.5 27 18 29"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M21 14.5 Q22 18 21 22 Q20 26 22 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      
      {/* Suckers on tentacles */}
      <circle cx="11" cy="18" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="11" cy="21" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="14.2" cy="20" r="0.6" fill="currentColor" opacity="0.5" />
      <circle cx="17.8" cy="20" r="0.6" fill="currentColor" opacity="0.5" />
      <circle cx="21" cy="18" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="21" cy="21" r="0.8" fill="currentColor" opacity="0.5" />
      
      {/* Eye highlights */}
      <circle cx="14" cy="9" r="1.2" fill="#0a0f1c" />
      <circle cx="18" cy="9" r="1.2" fill="#0a0f1c" />
      <circle cx="14.3" cy="8.7" r="0.4" fill="white" opacity="0.8" />
      <circle cx="18.3" cy="8.7" r="0.4" fill="white" opacity="0.8" />
    </svg>
  );
}
