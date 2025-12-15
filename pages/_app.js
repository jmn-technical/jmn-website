import '../styles/globals.css'
import '../styles/navbar.css'
import '../styles/home.css'
 
 
import Head from 'next/head'
import Script from 'next/script'
function MyApp({ Component, pageProps }) {


  return(
  <>
   <Head>
 
        

       <style>
  @import url(&apos;https://fonts.googleapis.com/css2?family=Aboreto&family=Charis+SIL:wght@700&family=Inconsolata:wght@500&family=Josefin+Sans&family=Margarine&family=Montserrat:wght@300&family=Nunito&family=Roboto&family=Rubik:ital,wght@0,400;1,300&family=Space+Mono:wght@400;700&family=Ubuntu+Condensed&display=swap&apos;);
</style>
<style>
@import url(&apos;https://fonts.googleapis.com/css2?family=Montserrat:ital@0;1&display=swa&apos;);
 
 
</style>
<link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
      </Head>

      {/* <Script src="https://unpkg.com/aos@next/dist/aos.js"></Script>
  <Script>
    AOS.init();
  </Script> */}
    <Script strategy="lazyOnload" id='analytics'>
        {` window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-KBB4S1YKTW');

  `}
      </Script>
   <Component {...pageProps} />
  </>
  
  )
}

export default MyApp
