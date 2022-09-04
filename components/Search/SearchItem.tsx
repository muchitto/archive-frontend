import Link from "next/link";
import { useEffect } from "react";
import { Doc } from "../../utils/Archive";

interface SearchItemProps {
  doc: Doc
}

export const MediaTypeIcons : { [key: string] : string } = {
  "account": "user.svg",
  "movies": "film.svg",
  "audio": "volume.svg"
}

const metadataURL = "https://archive.org/metadata/"

export default function SearchItem({ doc }: SearchItemProps) {
  const imageURL = `http://archive.org/services/img/${doc.identifier}`

  return (
    <a href={`https://archive.org/details/${doc.identifier}`} className="cursor-pointer">
      <div className="border-2 border-rose-200 flex justify-between flex-col lg:max-w-xs mb-5 lg:mb-0">
        <div className="w-full h-full">
          <img src={imageURL} className="w-full" />
        </div>
        <div className="flex flex-col p-2 w-full">
          <div className="text-lg text-center p-2 w-full">
            {doc.title}
          </div>
          <div className="flex">
            {MediaTypeIcons[doc.mediatype] && (
              <img 
                src={"./icons/" + MediaTypeIcons[doc.mediatype]}
                className="w-6 max-h-80"
              />
            )}
            <label className="ml-2 w-full">
              {doc.mediatype}
            </label>
          </div>
        </div>
      </div>
    </a>
  )
}