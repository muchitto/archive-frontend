import Image from "next/future/image";
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

export default function ResultItem({ doc }: SearchItemProps) {
  const imageURL = `http://archive.org/services/img/${doc.identifier}`

  return (
    <a href={`https://archive.org/details/${doc.identifier}`} className="cursor-pointer">
      <div className="border-2 border-amber-300 p-5 flex justify-between flex-col mb-5 lg:mb-0 h-full w-full">
        <div className="w-full h-ful">
          <Image src={imageURL} width="100" height="100" className="w-full" />
        </div>
        <div className="flex flex-col p-2 w-full">
          <div className="text-lg text-center p-2 w-full">
            {doc.title}
          </div>
          <div className="flex">
            <label className="ml-2 w-full">
              {doc.mediatype}
            </label>
          </div>
        </div>
      </div>
    </a>
  )
}