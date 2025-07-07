// src/components/Squiggle.js

export default function Squiggle() {
  return (
    <svg
      width="100%"
      height="8"
      viewBox="0 0 91 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="squigglePattern"
        patternUnits="userSpaceOnUse"
        width="91"
        height="8"
      >
        <path
          d="M114.4-5.067c-43.467 0-86.933 4.667-130.4 4.667-43.467 0-86.933-4.667-130.4-4.667s-86.933 4.667-130.4 4.667c-43.467 0-86.933-4.667-130.4-4.667"
          stroke="#E1E3E1"
          strokeLinecap="square"
        />
      </pattern>
      <rect
        width="100%"
        height="8"
        fill="url(#squigglePattern)"
      />
    </svg>
  );
}
