import Link from 'next/link'

export default function Home() {

  return (
    <div className="flex flex-col justify-center items-center h-48 w-full">
      <Link href="/style-transfer" >
        <a className="p-4 text-lg bg-primary rounded text-white shadow-md">Get Started With Style Transfer</a>
      </Link>
    </div>
  )
}
