import Image from 'next/future/image';
import Link from 'next/link';

import logoIcon from '../../assets/icons/logo.svg';

export default function Header () {

  return (
    <header className="py-10">
      <div className="flex items-center w-full">
        <Image src={logoIcon} alt="Archive" />

        <label className='inline-block text-4xl md:text-6xl lg:text-8xl font-bold ml-5 md:ml-10 uppercase'>
          <Link href="/" replace={true}>
            Archive
          </Link>
        </label>
      </div>
    </header>
  );
}
