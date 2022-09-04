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
    <div className="border-2 border-rose-200 flex justify-between flex-col lg:max-w-xs mb-5 lg:mb-0">
      <div className="w-full h-full">
        <img src={imageURL} className="w-full" />
      </div>
      <div className="flex flex-col mt-5 p-2 w-full">
        <div className="text-lg pb-5 text-center	p-5 w-full">
          <Link href={`https://archive.org/details/${doc.identifier}`}>
            {doc.title}
          </Link>
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
  )
}