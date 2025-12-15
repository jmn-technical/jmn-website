import { LucideLibraryBig } from "lucide-react";
import React from "react";
import {
  FaHeart,
  FaGraduationCap,
  FaGlobeAmericas,
  FaRunning,
  FaRobot,
  FaMicroscope,
  FaPalette,
  FaMountain,
  FaBook,
} from "react-icons/fa";

const UniversityDifferentiators = () => {
  const features = [
    { icon: <FaHeart className="w-8 h-8" />, title: "Pastoral Care" },
    { icon: <LucideLibraryBig className="w-8 h-8" />, title: "Extensive Library" },
    {
      icon: <FaGlobeAmericas className="w-8 h-8" />,
      title: "Polyglot Environs",
    },
    { icon: <FaRunning className="w-8 h-8" />, title: "Vigorous Faculties" },
    { icon: <FaRobot className="w-8 h-8" />, title: "Science & Tech Fairs" },
    { icon: <FaMicroscope className="w-8 h-8" />, title: "Research Slots" },
    { icon: <FaPalette className="w-8 h-8" />, title: "Cultural Meets" },
    { icon: <FaMountain className="w-8 h-8" />, title: "Academic Events & Expos" },
    { icon: <FaBook className="w-8 h-8" />, title: "Internships & Expeditions" },
  ];

  return (
    <section
      className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="container mx-auto px-4  ">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            JMN <span className="">Get Differed</span>
          </h2>
          {/* <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Distinctive features that set us apart in the world of higher education
          </p> */}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              data-aos="fade-up"
              //  data-aos-duration="1000"
              key={feature.title}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-25 transition-all duration-300 hover:-translate-y-2 border border-white/20 border-opacity-20"
            >
              <div className="flex items-center mb-">
                <div className="p-3 rounded-lg bg-white text-secondary mr-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl ">{feature.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversityDifferentiators;
