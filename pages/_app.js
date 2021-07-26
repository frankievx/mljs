import 'tailwindcss/tailwind.css'
import './styles/tailwind.css'
import './styles/app.css'
import '@uppy/core/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import Layout from '/layouts/main.jsx'

function MyApp({ Component, pageProps }) {
  return  (
  <Layout>
    <Component {...pageProps} />
  </Layout>
  )
}

export default MyApp
