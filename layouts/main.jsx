import Head from 'next/head'
import Navbar from '/components/Navbar'

export default function Layout({ children }) {
  return (
    <div className="bg-light">
      <Head>
        <title>Style Transfer Lab</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/uppy/uppy.min.css" />
      </Head>
      <main className="flex flex-col container  h-screen max-w-screen-lg">
        <div className="flex"><Navbar /></div>
        {children}
      </main>
    </div>
  )
}