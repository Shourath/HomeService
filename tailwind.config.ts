import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: {
          start: "#0A2A8C",
          end: "#1F6BFF",
        },
        navy: {
          DEFAULT: "#0B1B3F",
          dark: "#061026",
          light: "#182C5E",
        },
        cream: {
          DEFAULT: "#F7F8DC",
          light: "#FBFCED",
          dark: "#E8EAC0",
        },
        amber: {
          DEFAULT: "#FFB41F",
          hover: "#E59E15",
          light: "#FFF3D6",
        },
        accent: {
          orange: "#FF5A1F",
          hover: "#E04812",
          light: "#FFEAE2",
        },
        chip: {
          orange: "#FF5A1F",
          blue: "#1F6BFF",
          purple: "#8438FF",
          green: "#1FA85A",
        },
        status: {
          success: "#1FA85A",
          warning: "#F5A524",
          danger: "#E5383B",
          info: "#1F6BFF",
        }
      },
      borderRadius: {
        'card': '24px',
        'panel': '32px',
        'pill': '999px',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Oswald', 'Anton', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(11, 27, 63, 0.08)',
        'card': '0 12px 36px rgba(10, 42, 140, 0.12)',
        'hover': '0 20px 48px rgba(10, 42, 140, 0.16)',
        'panel': '0 24px 64px rgba(11, 27, 63, 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;
