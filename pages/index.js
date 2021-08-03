import Link from 'next/link'

export default function Home() {

  return (
    <div className="flex justify-center items-center h-full w-full">
      <Link href="/style-transfer" >
        <a className="p-4 text-lg bg-green-500 rounded text-white shadow-md">Get Started With Style Transfer</a>
      </Link>
    </div>
  )
}
