import type { Config } from 'tailwindcss'
import tailwindAnimate from "tailwindcss-animate"

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Outfit', 'Inter', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem',
				'4xl': '2rem',
			},
			boxShadow: {
				'glow-sm': '0 0 15px -3px var(--tw-shadow-color)',
				'glow': '0 0 25px -5px var(--tw-shadow-color)',
				'glow-lg': '0 0 40px -10px var(--tw-shadow-color)',
				'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
				'premium-lg': '0 30px 60px -20px rgba(0, 0, 0, 0.2)',
			},
			backdropBlur: {
				xs: '2px',
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-out',
				'fade-up': 'fadeUp 0.5s ease-out',
				'fade-down': 'fadeDown 0.3s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'slide-in-right': 'slideInRight 0.3s ease-out',
				'slide-in-left': 'slideInLeft 0.3s ease-out',
				'slide-in-up': 'slideInUp 0.3s ease-out',
				'slide-in-down': 'slideInDown 0.3s ease-out',
				'bounce-subtle': 'bounceSubtle 0.6s ease-out',
				'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'count-up': 'countUp 0.8s ease-out',
				'confetti': 'confetti 0.6s ease-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeUp: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				fadeDown: {
					'0%': { opacity: '0', transform: 'translateY(-10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				slideInRight: {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				slideInLeft: {
					'0%': { opacity: '0', transform: 'translateX(-20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				slideInUp: {
					'0%': { opacity: '0', transform: 'translateY(100%)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideInDown: {
					'0%': { opacity: '0', transform: 'translateY(-100%)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				bounceSubtle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				pulseGlow: {
					'0%, 100%': { boxShadow: '0 0 20px 0 var(--tw-shadow-color)' },
					'50%': { boxShadow: '0 0 40px 10px var(--tw-shadow-color)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				countUp: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				confetti: {
					'0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(360deg)', opacity: '0' },
				},
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				// Premium accent colors
				success: {
					DEFAULT: 'hsl(142, 76%, 36%)',
					foreground: 'hsl(0, 0%, 100%)',
				},
				warning: {
					DEFAULT: 'hsl(38, 92%, 50%)',
					foreground: 'hsl(0, 0%, 0%)',
				},
				info: {
					DEFAULT: 'hsl(199, 89%, 48%)',
					foreground: 'hsl(0, 0%, 100%)',
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			transitionDuration: {
				'400': '400ms',
			},
			transitionTimingFunction: {
				'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
		}
	},
	plugins: [tailwindAnimate],
} satisfies Config


