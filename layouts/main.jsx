import Head from 'next/head'
import Navbar from '/components/Navbar'

export default function Layout({ children }) {
  return (
    <div className="bg-accent">
      <Head>
        <title>Style Transfer Lab</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="fixed z-10 bg-primary text-center w-full"><Navbar/></header>
      <main className="flex flex-col relative bg-accent container mx-auto h-screen">
        <div className="mt-20 w-full h-screen bg-accent">
          {children}
        </div>
      </main>
    </div>
  )
}