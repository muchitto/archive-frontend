import { MouseEvent } from "react"

interface PageButtonProps {
  textTop: string
  textBottom: string
  showText: boolean
  className?: string
  iconPath: string
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function PageButton({ textTop, textBottom, className, showText, iconPath, onClick }: PageButtonProps) {
  return (
    <div className={`${className} text-center text-lg}`}>
      <label className={`pb-2 block animate-pulse ${!showText ? 'block' : 'invisible'}`}>
        {textTop}
      </label>
      <div className="rounded-full bg-white w-14 h-14 block border-2 border-black">
        <a href="#" onClick={(event) => {
          event.preventDefault()
          onClick(event)
        }}>
          <img src={iconPath} className="w-full" />
        </a>
      </div>
      <label className={`pt-2 block animate-pulse ${!showText ? 'block' : 'invisible'}`}>
        {textBottom}
      </label>
    </div>
  )
}