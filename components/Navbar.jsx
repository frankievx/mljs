
import { Home } from 'react-feather';
import Link from 'next/link'
export default function Navbar () {
  return (
    <div className="font-sans flex text-xl py-4">
      <Link href="/"><div className="text-base cursor-pointer"><Home /></div></Link>
    </div>
  )   
}