import { MouseEvent } from "react"

interface PageButtonProps {
  textTop: string
  textBottom: string
  showText: boolean
  className?: string
  icon: JSX.Element
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function PageButton({ textTop, textBottom, className, showText, icon, onClick }: PageButtonProps) {
  return (
    <div className={`${className} text-center text-lg`}>
      <label className={`pb-2 block animate-pulse ${!showText ? 'block' : 'invisible'}`}>
        {textTop}
      </label>
      <div className="rounded-full bg-white w-14 h-14 block border-2 border-black hover:shadow-btn">
        <a href="#" onClick={(event) => {
          event.preventDefault()
          onClick(event)
        }}>
          {icon}
        </a>
      </div>
      <label className={`pt-2 block animate-pulse ${!showText ? 'block' : 'invisible'}`}>
        {textBottom}
      </label>
    </div>
  )
}