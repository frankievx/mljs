import Head from 'next/head'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Style Transfer Configurator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-col  justify-center w-full flex-1 text-left">
        <div class="text-center text-xl py-6 font-bold border-b border-solid">
          Style Transfer Configurator
        </div>
        <div class="flex justify-center">
          <div class="w-full">
            <div class="text-xl pb-3">Content Image</div>
            
          </div>
          <div class="w-full">
            <div class="text-xl pt-4">Style Image</div>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="h-4 ml-2" />
        </a>
      </footer>
    </div>
  )
}
