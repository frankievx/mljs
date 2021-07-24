import Head from 'next/head'
import Navbar from '/components/Navbar'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Style Transfer Configurator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
     
      <header className="fixed z-10 bg-white text-center w-full"><Navbar/></header>
      <main className="flex flex-col h-screen relative">
        <div className="absolute top-20 h-full">
          {children}
        </div>
      </main>
    </>
  )
}