export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#25609A',
          'blue-hover': '#1a4a7a',
          green: '#4caf4f',
          'green-hover': '#3e8e40',
          'green-soft': '#eaf6eb',
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
