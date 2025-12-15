import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const AchievementsSection = ({ poster }) => {
  if (!poster || poster.length === 0) {
    return null;
  }

  // Show latest images first
  const reversedPoster = [...poster].reverse();

  return (
    <section
      className="py-16 md:py-24 bg-gray-50"
      id="about"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="container mx-auto px-4">
        <Swiper
          modules={[Autoplay]}
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={800}
          spaceBetween={16}
          breakpoints={{
            0: {
              slidesPerView: 2,
            },
            464: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="py-4"
        >
          {reversedPoster.map((item, idx) => (
            <SwiperSlide key={item.id || item.imgid || idx}>
              <div className="aspect-[3/4] mx-2 bg-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-full relative h-full flex items-center justify-center text-gray-400">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt="poster"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default AchievementsSection;
