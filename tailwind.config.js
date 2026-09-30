/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        xp: {
          blue: {
            header: '#0058EE',
            headerEnd: '#0372FD',
            inactive: '#7A96DF',
            light: '#245EDC',
            dark: '#1941A5'
          },
          taskbar: '#245EDC',
          startGreen: '#388E3C',
          startGreenEnd: '#4CAF50',
          beige: '#ECE9D8',
          border: '#002D96',
          titleShadow: '#00136B'
        }
      },
      fontFamily: {
        tahoma: ['Tahoma', 'Segoe UI', 'sans-serif'],
        terminal: ['"Courier New"', 'Courier', 'monospace']
      }
    },
  },
  plugins: [],
};
