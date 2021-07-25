import Head from 'next/head'
import Navbar from '/components/Navbar'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Style Transfer Configurator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
     
      <header className="fixed z-10 bg-primary text-center w-full"><Navbar/></header>
      <main className="flex flex-col h-screen relative bg-accent">
        <div className="absolute top-20 h-full w-full">
          {children}
        </div>
      </main>
    </>
  )
}