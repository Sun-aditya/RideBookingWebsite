/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0A0A0A",
          yellow: "#F5C518",
          white: "#FFFFFF",
          darkGray: "#1A1A1A",
          mediumGray: "#2D2D2D",
          lightGray: "#F5F5F5",
          green: "#22C55E",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,197,24,0.25), 0 10px 30px rgba(245,197,24,0.18)",
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        pulseSlow: "pulse 2.5s ease-in-out infinite",
        pingSlow: "ping 2.8s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
