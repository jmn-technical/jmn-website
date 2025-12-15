 

import React, { useState } from 'react';
import Image from 'next/image';
import { FaSearch, FaMapMarkerAlt, FaUniversity, FaPhoneAlt, FaUserTie } from 'react-icons/fa';
  import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import juniorSchools from '../../assets/data/campuses/juniorSchools';

const CampusListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const campuses = juniorSchools

  const filteredCampuses = campuses.filter(campus => {
    const matchesSearch = 
      campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.incharge.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      campus.type.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesType;
  });

  const campusTypes = [...new Set(campuses.map(campus => campus.type))];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navbar/>
    

      <div className="relative h-64 md:h-80 bg-blue-900 pt-80 pb-10 lg:py-54  ">
      <Image
          src="/photos/38.jpg"
          alt="Jamia Madeenathunnoor Campuses"
          layout='fill'
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 mt-10 md:mt-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase">Junior Schools</h1>
           
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8 mb-32">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campuses..."
                className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="p-3 border capitalize rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Campus Types</option>
              {campusTypes.map((type, index) => (
                <option  key={index} value={type}>{type}</option>
              ))}
            </select>
            
            <button 
              className="bg-primary hover:bg-primary/60 text-white p-3 rounded-lg flex items-center justify-center"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Campus List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="gri grid-cols-10 bg-gray-100 p-4 font-bold text-gray-700 hidden md:grid">
             <div className="col-span-2">Name</div>
            <div className="col-span-2">Course Type</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Incharge</div>
            <div className="col-span-2">Contact</div>
          </div>

          {/* Campus Items */}
          {filteredCampuses.length > 0 ? (
            filteredCampuses.map((campus) => (
              <div 
                key={campus.an} 
                className="grid grid-cols-1 md:grid-cols-10 p-4 border-b hover:bg-gray-50 transition-colors"
              >
                    <div className="col-span-2 flex items-center mb-2 md:mb-0 capitalize">
                  <FaUniversity className="text-primary/80 mr-2 hidden md:block" />
                  <span className="font-semibold md:hidden">Name: </span>
                  {campus.name}
                </div>
                <div className="col-span-2 flex items-center mb-2 md:mb-0 capitalize">
                  <span className="font-semibold md:hidden">Type: </span>
                  {campus.type}
                </div>
                <div className="col-span-2 flex items-center mb-2 md:mb-0 capitalize">
                  <FaMapMarkerAlt className="text-red-400 mr-2 hidden md:block" />
                  <span className="font-semibold md:hidden">Location: </span>
                  {campus.location}, {campus.district}
                </div>
                <div className="col-span-2 flex items-center mb-2 md:mb-0 capitalize">
                  <FaUserTie className="text-secondary mr-2 hidden md:block" />
                  <span className="font-semibold md:hidden">Incharge: </span>
                  {campus.incharge}
                </div>
                <div className="col-span-2 flex items-center ">
                  
                  <FaPhoneAlt className="text-blue-500 mr-2 hidden md:block" />
                  <span className="font-semibold md:hidden">Contact: </span>
                  <a href={`tel:${campus.contact.replace(/\s/g, '')}`} className=" hover:underline">
                    {campus.contact}
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No campuses match your search criteria
            </div>
          )}
        </div>

       
      </div>
      <Footer/>
    </div>
  );
};

export default CampusListPage;