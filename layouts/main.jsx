import Head from 'next/head'
import Navbar from '/components/Navbar'

export default function Layout({ children }) {
  return (
    <div className="bg-accent">
      <Head>
        <title>Style Transfer Configurator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="fixed z-10 bg-primary text-center w-full"><Navbar/></header>
      <main className="flex flex-col relative bg-accent container mx-auto">
        <div className="mt-20 h-full w-full">
          {children}
        </div>
      </main>
    </div>
  )
}