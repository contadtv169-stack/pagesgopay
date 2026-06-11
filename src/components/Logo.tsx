import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = { sm: 32, md: 48, lg: 72 }
  const txtSizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' }
  const s = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: s,
          height: s,
          background: 'linear-gradient(135deg, #0066FF 0%, #0048CC 100%)',
          boxShadow: `0 4px 15px rgba(0,102,255,0.3)`,
        }}
      >
        <svg viewBox="0 0 100 100" width={s * 0.6} height={s * 0.6}>
          <text
            x="50"
            y="72"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="66"
            fontWeight="800"
            fill="white"
            textAnchor="middle"
          >
            G
          </text>
          <circle cx="72" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
          <path
            d="M72 35 Q72 48 62 54 Q52 60 52 48"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${txtSizes[size]} font-extrabold text-[#1a1a2e] tracking-tight`}>
          GoPay
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 48 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #0066FF 0%, #0048CC 100%)',
        boxShadow: `0 4px 15px rgba(0,102,255,0.3)`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.6} height={size * 0.6}>
        <text
          x="50"
          y="72"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="66"
          fontWeight="800"
          fill="white"
          textAnchor="middle"
        >
          G
        </text>
        <circle cx="72" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
        <path
          d="M72 35 Q72 48 62 54 Q52 60 52 48"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
