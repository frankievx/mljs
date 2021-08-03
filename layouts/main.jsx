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
      <Navbar />
      <main className="flex flex-col container mx-auto h-screen max-h-screen">
        {children}
      </main>
    </div>
  )
}