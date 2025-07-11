"use client"

import type React from "react"

interface AmericanFlagProps {
  className?: string
}

const AmericanFlag: React.FC<AmericanFlagProps> = ({ className = "h-5 w-5" }) => {
  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden ${className}`}
      style={{
        boxShadow: "0 0 1px rgba(0,0,0,0.3)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              180deg,
              #B22234 0%,
              #B22234 7.69%,
              #FFFFFF 7.69%,
              #FFFFFF 15.38%,
              #B22234 15.38%,
              #B22234 23.07%,
              #FFFFFF 23.07%,
              #FFFFFF 30.76%,
              #B22234 30.76%,
              #B22234 38.45%,
              #FFFFFF 38.45%,
              #FFFFFF 46.14%,
              #B22234 46.14%,
              #B22234 53.83%,
              #FFFFFF 53.83%,
              #FFFFFF 61.52%,
              #B22234 61.52%,
              #B22234 69.21%,
              #FFFFFF 69.21%,
              #FFFFFF 76.9%,
              #B22234 76.9%,
              #B22234 84.59%,
              #FFFFFF 84.59%,
              #FFFFFF 92.28%,
              #B22234 92.28%,
              #B22234 100%
            )
          `,
        }}
      />
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: "40%",
          height: "53.85%",
          background: "#3C3B6E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 1px, transparent 1px)
            `,
            backgroundSize: "33.33% 33.33%",
            backgroundPosition: `
              10% 20%, 50% 20%, 90% 20%,
              10% 50%, 50% 50%, 90% 50%,
              10% 80%, 50% 80%, 90% 80%
            `,
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  )
}

export default AmericanFlag
