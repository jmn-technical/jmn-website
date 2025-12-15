

// pages/index.js

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import News from "../components/News";
import Footer from "../components/Footer";
import Head from "next/head";
import Script from "next/script";
import Posters from "../components/Updates";
import About from "../components/About";
import ChairmanMessage from "../components/ChairmanMessage";
import RectorMessage from "../components/RectorMessage";
import MileStone from "../components/MileStone";
import Logos from "../components/Logos";
import Features from "../components/Features";
import Hero from "../components/HeroBanner";
import Mission from "../components/Mission";

export default function Home() {
  const [poster, setPoster] = useState([]);

  const getPoster = async () => {
    try {
      console.log("🔄 Fetching /api/images ...");
      const res = await fetch("/api/images"); 
      const json = await res.json();
      console.log("✅ /api/images response:", json);

      const data = json?.data ?? [];
      setPoster(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ getPoster error:", error);
      setPoster([]);
    }
  };

  useEffect(() => {
    // init AOS
    import("aos").then((aos) => {
      aos.init({});
    });

    // ✅ actually load posters from DB
    getPoster();
  }, []);

  console.log("📦 poster state in Home:", poster);

  return (
    <div className="scroll-smooth">
      <Script
        src="https://unpkg.com/aos@next/dist/aos.js"
        strategy="beforeInteractive"
      />

      <Head>
        <title>Jamia Madeenathunnoor</title>
        <meta
          name="description"
          content="Jamia Madeenathunnoor epitomizes excellence, blending traditional Islamic studies with diverse academic disciplines..."
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
      </Head>

      <Navbar />

      <div className="home">
        <Hero />

        <Posters poster={poster} />

        <About />
        <MileStone />
        <Logos />
        <ChairmanMessage />
        <Mission />
        <RectorMessage />
        <Features />
        <News />
      </div>
      <Footer />
    </div>
  );
}
