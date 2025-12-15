import React from "react";
import Image from "next/image";
import Link from "next/link";

const Mission = () => {
  return (
    <section className="relative h-[40vh] md:h-[70vh] min-h-[500px] w-full">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/photos/51.jpg" // Replace with your image path
          alt="Students studying Islamic texts"
          layout="fill"
          className="object-cover object-to"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="border-b- border-golden inline-block pb-2">
              {/* Our Sacred Mission */}A DOOR TO THE WORLD
            </span>
          </h2>
          <p className="text-xl md:text-2xl font-medium mb-8 italic">
            &quot;It is an initiative whereby the students are well trained to
            radiate the noble ideals of Islam across the world&quot;
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* <button className="bg-golden hover:bg-yellow-600 text-dark-green px-8 py-3 rounded-lg font-bold text-lg transition-colors">
              Explore Our Programs
            </button> */}
            <Link passHref href={"/Programmes"}>
              <button className="bg-primary hover:bg-primary/60 border-2 border-primary text-white px-6 py-2.5 rounded-lg font-semibold text-lg transition-colors">
                Explore Our Programmes
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Islamic pattern at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-repeat-x"
        style={{
          backgroundImage: "url(/islamic-pattern.png)",
          backgroundSize: "200px 80px",
        }}
      ></div>
    </section>
  );
};

export default Mission;
