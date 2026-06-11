import { ReactNode } from 'react'

export function iPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="iphone-frame">
        <div className="screen-content">
          {children}
        </div>
      </div>
    </div>
  )
}
