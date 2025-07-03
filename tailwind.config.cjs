/** @type {import('tailwindcss').Config} */
// const colors = require("tailwindcss/colors")

const customSizes = {
  "11px": "0.22rem",
  "12px": "0.24rem",
  "13px": "0.26rem",
  "14px": "0.28rem",
  "16px": "0.32rem",
  "18px": "0.36rem",
  "20px": "0.4rem",
  "22px": "0.44rem",
  "24px": "0.48rem",
  "26px": "0.52rem",
  0.25: "0.065rem",
  0.5: "0.125rem",
  0.75: "0.2rem",
  1: "0.25rem",
  1.125: "0.275rem",
  1.25: "0.3rem",
  1.5: "0.375rem",
  1.75: "0.425rem",
  2: "0.5rem",
}

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ...colors,
        theme: "#F77E04",
        broadcast: "#EFEFEF",
      },
      width: customSizes,
      fontSize: customSizes,
      lineHeight: customSizes,
      margin: customSizes,
      padding: customSizes,
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
