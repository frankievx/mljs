import Head from 'next/head'
import Navbar from '/components/Navbar'

export default function Layout({ children }) {
  return (
    <div className="bg-light">
      <Head>
        <title>Style Transfer Lab</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.jsdelivr.net/npm/three@0.106.2/build/three.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/scatter-gl@0.0.1/lib/scatter-gl.min.js"></script>
      </Head>
      <main className="flex flex-col container min-h-screen max-w-screen-lg">
        <div className="flex"><Navbar /></div>
        {children}
      </main>
    </div>
  )
}