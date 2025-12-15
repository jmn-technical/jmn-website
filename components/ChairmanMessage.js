import React from "react";
import Image from "next/image";

const ChairmanMessage = () => {
  return (
    <section
      className="py-16 md:py-20 bg-gray-50"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
          Chairman&apos;s <span className="text-secondary">Message</span>
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="w-full md:w-1/3 lg:w-1/4 flex justify-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src="/photos/sheikhuna.jpg"
                  alt="Chairman's Portrait"
                  layout="fill"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Message Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="bg-white p-8 rounded-xl shadow-md">
                {/* Name and Designation */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-primary">
                    {" "}
                    Sheikh Abubakr Ahmad
                  </h3>
                  <p className="text-lg text-secondary font-medium">
                    Chairman, JMN
                  </p>
                </div>

                {/* Message */}
                <div className="text-gray-600 space-y-4">
                  <p>
                    Since its humble beginning in 2001 as a college of Islamic
                    studies under its mother body Markaz Garden, today Jamia
                    Madeenathunnoor has gradually grown to become the Centre of
                    Excellence by creatively blending education and national
                    consciousness.
                  </p>
                  <p>
                    {" "}
                    People from all walks of life, the elite, the poor, the
                    educated and the common man, extended their hands in this
                    journey of social change.
                  </p>{" "}
                  <p>
                    What makes Jamia Madeenathunnoor as prestigious Islamic
                    institution is that, it is an autonomous institution under
                    the aegis of Jamia Markaz, which is a renowned university in
                    South Asia, particularly in India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChairmanMessage;
