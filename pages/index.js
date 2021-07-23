import Head from 'next/head'
import Image from 'next/image'
import contentPic from '/public/images/willow-flycatcher.jpeg'
import stylePic from '/public/images/wing-bg.jpeg'
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Style Transfer Configurator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-col  justify-center w-full flex-1 text-left overflow-auto">
        <div class="text-center text-xl py-6 font-bold border-b border-solid">
          Style Transfer Configurator
        </div>
        <div class="flex justify-center p-10">
          <div class="w-full text-center">
            <div>
              <div class="text-xl pb-3">Content Image</div>
              <Image src={contentPic} />
            </div>
            <div class="w-full">
              <div class="text-xl pt-4">Style Image</div>
              <Image src={stylePic} />
            </div>
            <div class="w-full">
              <div class="text-xl pt-4">Computed Image</div>
              <Image src={stylePic} />
            </div>
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
