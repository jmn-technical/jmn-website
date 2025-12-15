


import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import moment from "moment";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";

import cookies from "js-cookie";

export default function Blog() {
  const [blog, setBlog] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const data = !showMore ? blog.slice(0, 6) : blog;


  const fetchData = () => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/blogs?_sort=published_at:desc`
       
      )
      .then((response) => {
        setBlog(response.data);
      });
  };

  useEffect(() => {
    // fetchData();
  }, []);
  return (
    <>
      <Head>
        <title>Blogs </title>
        <meta property="og:title" content="Blog" key="title" />
      </Head>
      

      <>
      <Navbar/> 
      
       <div className='blogs__head'>
<h1>NEWS & EVENTS</h1>
</div>
        <div className="blogs__content container">

          {data.map((data, index) => {
            const date = moment(data.date).format("MMM DD YYYY");
            const content = data.content.slice(0, 600);
            return (
              <div key={index} className="blog_row">
               
                <div className="blog__box pl-5 pr-5 grid grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="blog__img">
                    <img
                      src={`${data.thumbnail.url}`}
                      // src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${data.thumbnail.url}`}
                    />
                  </div>
                  <div className="blog__box__right  lg:col-span-2">
                    <div className="grid grid-cols-1">
                      <h3 className="order-last sm:order-first">
                        {data.title}
                      </h3>
                      <span className="flex ">
                        <h5>{date}</h5>
                     
               
                      </span>
                    </div>

                    <p>{content} </p>
  
                    <Link href="/Blog">
                      <button
                        onClick={() => cookies.set("blogId", data.slug)}
                        id="blog__list__button"
                      >
                        READ MORE
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
           
                 

          <div className="blog__bottom flex ">
            <button onClick={() => setShowMore(!showMore)}>
              {!showMore ? "LOAD MORE" : "LOAD LESS"}{" "}
            </button>
          </div>
        </div>

        <Footer />
      </>     
    </>
  );
}
