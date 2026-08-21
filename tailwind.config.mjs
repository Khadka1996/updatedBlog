import typographyPlugin from '@tailwindcss/typography';

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // keep in case some files do live here
  ],
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
    typographyPlugin,
  ],
};