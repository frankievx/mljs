import Link from 'next/link'

export default function Home() {

  return (
    <div className="flex flex-col justify-center items-center h-48 w-full gap-y-8">
      <Link href="/style-transfer" >
        <a className="p-4 text-lg bg-primary rounded text-white shadow-md w-7/12 text-center">Style Transfer</a>
      </Link>
      <Link href="/face-landmarks-detection"  >
        <a className="p-4 text-lg bg-secondary rounded text-white shadow-md w-7/12 text-center">Face Landmarks Detection</a> 
      </Link>
      <Link href="/body-pix"  >
        <a className="p-4 text-lg bg-secondary rounded text-white shadow-md w-7/12 text-center">Body Pix</a> 
      </Link>
    </div>
  )
}
