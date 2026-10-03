const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      // every colour is a CSS variable, defined for both themes in src/index.css
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        soft: token('soft'),
        ink: token('text'),
        muted: token('muted'),
        line: token('border'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
        positive: token('positive'),
        neutral: token('neutral'),
        negative: token('negative'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      maxWidth: {
        page: '68rem',
      },
    },
  },
  plugins: [],
};
