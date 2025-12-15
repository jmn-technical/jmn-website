import React from "react";
import Image from "next/image";

const RectorMessage = () => {
  return (
    <section
      className="py-16 md:py-20 bg-gray-50/50"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
          Rector&apos;s <span className="text-secondary">Message</span>
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            {/* Chairman's Photo */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex justify-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={"/images/senate/hakkim-usthad.jpg"} // Replace with your image path
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
                    Dr. Muhammed Abdul Hakkim Azhari
                  </h3>
                  <p className="text-lg text-secondary font-medium">
                    Rector, JMN
                  </p>
                </div>

                {/* Message */}
                <div className="text-gray-600 space-y-4">
                
                  
                <p> Welcome to Jamia Madeenathunnoor, a nongovernmental and
                  philanthropic institute founded in 2001 to mould a highly
                  talented professionals and scholars.</p> 
                  <p>  Today, it is evident from
                  our performance that it is an institute of national impact and
                  international repute, a premier institute for knowledge
                  seekers from different parts of the globe. However, no one,
                  nor I, can claim to be the sole architect of its success.
                  </p> <p> It
                  would not have been possible for the Institute to be what it
                  is today without the constant succour and support of Markaz
                  community. Our goal is to be a Centre of Excellence so that
                  we remain relevant to our society.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RectorMessage;
