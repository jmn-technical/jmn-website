 
import React from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AcademicCouncil = () => {
  const data =[
    {name:"Dr Muhammad Abdul Hakkim Azhari",
      image:'/images/senate/hakkim-usthad.jpg',
      designation:"Rector",
    },
    {name:"Ali Ahsani",
      image:'/images/academic-council/ali-ahsani.jpeg',
      designation:"HoD, Fiqh",
    },
    {name:"Muhyudheen Saqafi Thaleekkara",
      image:'/images/academic-council/moidu-saqafi.jpeg',
      designation:"HoD, Aqeedah",
    },
    
    {name:"Muhyudheen Saqafi Kavanur",
      image:'/images/academic-council/kavanur-usthad.jpeg',
      designation:"HoD, Tafsir",
    },
    {name:"Asaf Nurani",
      image:'/images/senate/asaf-nurani.jpg',
      designation:"Pro-Rector",
    },
    {name:"Sayyid Thwaha Nurani",
      image:'/images/academic-council/thaha-nurani.jpeg',
      designation:"Dean of Academic Affairs",
    },
    {name:"Jafar Nurani",
      image:'/images/senate/jafar-nurani.jpg',
      designation:"Principal, Markhinz Bangalore",
    },
    {
      name:"Shihabudheen Nurani",
      image:'/images/academic-council/shihab-nurani.jpeg',
      designation:"Principal, Markazul Hidaya, Kodagu",
    },
    {name:"Roshan Nurani",
      image:'/images/academic-council/roshan-nurani.jpeg',
      designation:"Academic Expert & Vice Rector Jamia Markaz",
    },
    {name:"Shoukath Ali",
      image:'/images/academic-council/shaukath-ali.jpeg',
      designation:"Academic Expert & Counselor, IIT Bombay",
    },
   
  ];

  return (
   <div className="min-h-screen bg-gray-50">
         <Navbar/>
         {/* Hero Header */}
         <div className="bg-primary text-white   pt-28 pb-16 lg:py-28 lg:pt-36">
           <div className="container mx-auto px-4 text-center">
             <h1 className="text-3xl md:text-4xl font-semibold md:font-bold mb-4">ACADEMIC COUNCIL</h1>
             <p className="  max-w-2xl mx-auto">
             Guiding academic excellence through visionary leadership and scholarly governance
             </p>
           </div>
         </div>
   
         {/* Main Content */}
         <div className="container mx-auto px-4 py-16 lg:py-24">
           {/* Members Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
             {data.map((member, index) => (
               <div 
                 key={index} 
                 className="bg-white m-auto w-full rounded-xl shadow-m overflow-hidden hover:shadow-lg transition-shadow"
               >
                 {/* Member Photo */}
                 <div className="relative h-36  w-36 m-auto rounded-full mt-3">
                   <Image
                     src={member.image}
                     alt={member.name}
                   layout='fill'
                     className="object-cover rounded-full"
                   />
                 </div>
                 
                 {/* Member Details */}
                 <div className="p-6 text-center">
                   <h3 className="text-l font-semibold text-primary mb-1">{member.name}</h3>
                   <p className="text-secondary  ">{member.designation}</p>
                   
                  
                 </div>
               </div>
             ))}
           </div>
   
           
         </div>
         <Footer/>
       </div>
  );
};

export default AcademicCouncil;
