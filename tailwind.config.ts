import { type Config } from "tailwindcss";
import plugin from "tailwindcss/plugin"

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"),],
} satisfies Config;
