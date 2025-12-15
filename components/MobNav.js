"use client";
import Image from "next/image";
import React, { useState } from "react";
import { RiMenu3Fill } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

import clsx from "clsx";
import Link from "next/link";

import { useRouter } from "next/router";
const MobNav = () => {
  const [menu, setMenu] = useState(false);
  const [item, setItem] = useState("");
  const router = useRouter();

  const programmes = [
    {
      name: "JUNIOR SCHOOL",
      link: "/Programmes/Hs",
    },
    {
      name: "SENIOR SCHOOL",
      link: "/Programmes/Hss",
    },
    {
      name: "GRADUATE SCHOOL",
      link: "/Programmes/Bs",
    },
     {
      name: "FINISHING",
      link: "/Programmes/finishing",
    },
     {
      name: "RABBANI FINISHING SCHOOL",
      link: "/Programmes/rabbani",
    },
  ];
  const campuses = [
    {
      name: "On-Campuses",
      link: "/campuses/OnCampuses",
    },
    {
      name: "Junior Schools",
      link: "/campuses/JuniorSchools",
    },
    {
      name: "Open Schools",
      link: "/campuses/OpenSchools",
    },
    {
      name: "Interstate Campuses",
      link: "/campuses/Interstate",
    },
  ];
  const leadership = [
    {
      name: "Senate",
      link: "/leadership/Senate",
    },
    {
      name: "Academic Council",
      link: "/leadership/Academic",
    },
    {
      name: "Executive Council",
      link: "/leadership/Exicutive",
    },
    {
      name: "Finance Committee",
      link: "/leadership/Finance",
    },
  ];

  const checkActive = (menuItem) => {
    if (menuItem == "about") {
      if (
        item == "about" ||
        router.pathname == "/About" ||
        router.pathname == "/leadership/Senate" ||
        router.pathname == "/leadership/Academic" ||
        router.pathname == "/leadership/Exicutive" ||
        router.pathname == "/leadership/Finance"
      ) {
        return true;
      } else {
        return false;
      }
    }
    if (menuItem == "programmes") {
      if (
        item == "programmes" ||
        router.pathname == "/Programmes/Hs" ||
        router.pathname == "Programmes/Hss" ||
        router.pathname == "Programmes/Bs"  ||
        router.pathname == "Programmes/finishing"  ||
         router.pathname == "Programmes/rabbani"
      ) {
        return true;
      } else {
        return false;
      }
    }
    if (menuItem == "campuses") {
      if (
        item == "campuses" ||
        router.pathname == "/campuses/OnCampuses" ||
        router.pathname == "/campuses/JuniorSchools" ||
        router.pathname == "/campuses/OpenSchools" ||
        router.pathname == "/campuses/Interstate"
      ) {
        return true;
      } else {
        return false;
      }
    }
  };
  return (
    <div className="lg:hidden   fixed w-full  z-50 backdrop-blur-lg shadow bg-black/70 text-white  font-montserrat ">
      {/* Top Row  */}
      <div className="flex justify-between items-center  p-2 px-4  ">
        <div className="flex items-center gap-2">
          <Link passHref href={"/"}>
            <div className="p-1 bg-white rounded-md">
              <div className="relative   h-10 w-12 rounded   transition ease-linear duration-200">
                <Image
                  src={"/images/LOGO-3.png"}
                  className="object-cover  rounded"
                  layout="fill"
                  alt="logo"
                />
              </div>
            </div>
          </Link>{" "}
          <Link passHref href={"/"}>
            <div className="relative h-10 w-32 rounded   transition ease-linear duration-200">
              <Image
                src={"/images/logo-text.png"}
                className="object-cover  rounded"
                layout="fill"
                alt="logo"
              />
            </div>
          </Link>
        </div>

        <div className="relative  ">
          <RiMenu3Fill
            onClick={() => setMenu(true)}
            className={clsx(
              " text-3xl  absolute right-0   -mt-3 transition-all duration-300 ",
              {
                "opacity-0 invisible  translate-x-3": menu,
                "visibl   duration-400 transition": !menu,
              }
            )}
          />
          <AiOutlineClose
            onClick={() => {
              setMenu(false);
              setItem("");
            }}
            className={clsx(
              " absolute right-0 -mt-2 text-2xl transition-all duration-300  ",
              {
                "opacity-0 invisible -translate-y-3 ": !menu,
                " translate-y-0 duration-400 transition visible": menu,
              }
            )}
          />
        </div>
      </div>

      {/* Menu */}
      <div
        className={clsx(
          " pb-12 absolute  w-full m-auto  bg-black/90 bg-opacity-95",
          {
            invisible: !menu,
            "visible  ": menu,
          }
        )}
      >
        <div
          className={clsx(
            "rounded m-auto w-11/12  p-2 transition-all ease-linear duration-200 ",
            {
              " translate-y-6": menu,
            }
          )}
        >
          <div className="grid gap-1 text-lg">
            {/* Home */}
            <Link passHref href={"/"} onClick={() => setMenu(false)}>
              <div className=" p-2 rounded text-white flex items-center gap-2">
                {router.pathname == "/" && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
                Home{" "}
              </div>
            </Link>{" "}
            {/* About */}
            <div className="bg-primar p-2 rounded text-white relative flex items-center">
              <button
                onClick={() => setItem("about")}
                className="w-full flex items-center gap-1"
              >
                {checkActive("about") && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
                About
                <MdOutlineKeyboardArrowRight
                  className="text-lg mt-[3px]"
                  onClick={() => setItem("about")}
                />
              </button>

              {item == "about" && (
                <div className="z-50  absolute right-0 top-0 mt-1 mr-2 w-7/12 p-3 rounded grid gap-1 bg-gray-900 bg-opacity-60 ">
                  <Link
                    passHref
                    href={"/About"}
                    onClick={() => {
                      setMenu(false);
                      setItem("");
                    }}
                  >
                    <div className="bg-white text-gray-800 p-2 px-3 rounded  ">
                      Overview
                    </div>
                  </Link>
                  <button
                    onClick={() => setItem("leadership")}
                    className="w-full flex items-center bg-white text-gray-800 p-2 px-3 rounded"
                  >
                    Leadership
                    <MdOutlineKeyboardArrowRight
                      className="text-lg mt-[3px]"
                      onClick={() => setItem("leadership")}
                    />
                  </button>
                </div>
              )}

              {item == "leadership" && (
                <div className="z-50  absolute right-0 top-0 mt-1 mr-2 w-7/12 p-3 rounded grid gap-1 bg-gray-900 bg-opacity-60 ">
                  {leadership.map((d) => (
                    <Link
                      passHref
                      key={d.name}
                      href={d.link}
                      onClick={() => {
                        setMenu(false);
                        setItem("");
                      }}
                    >
                      <div className="bg-white text-gray-800 p-2 px-3 rounded  flex items-center gap-2">
                        {d.name}
                        {router.pathname == d.link && (
                          <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Programmes */}
            <div className="  p-2 rounded text-white relative flex items-center">
              <button
                onClick={() => setItem("programmes")}
                className="w-full flex items-center gap-1"
              >
                {checkActive("programmes") && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
                Programmes
                <MdOutlineKeyboardArrowRight
                  className="text-lg"
                  onClick={() => setItem("programmes")}
                />
              </button>

              {item == "programmes" && (
                <div className="z-50  absolute right-0 top-0 mt-1 mr-2 w-7/12 p-3 rounded grid gap-1 bg-gray-900 bg-opacity-60 ">
                  {programmes.map((d) => (
                    <Link
                      passHref
                      key={d.name}
                      href={d.link}
                      onClick={() => {
                        setMenu(false);
                        setItem("");
                      }}
                    >
                      <div className="bg-white text-gray-800 p-2 px-3 rounded flex items-center gap-2 ">
                        {d.name}{" "}
                        {router.pathname == d.link && (
                          <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Campuses */}
            <div className="  p-2 rounded text-white relative flex items-center">
              <button
                onClick={() => setItem("campuses")}
                className="w-full flex items-center gap-1"
              >
                {checkActive("campuses") && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
                Campuses
                <MdOutlineKeyboardArrowRight
                  className="text-lg"
                  onClick={() => setItem("campuses")}
                />
              </button>

              {item == "campuses" && (
                <div className="z-50  absolute right-0 top-0 mt-1  w-fit p-3 rounded grid gap-1 bg-gray-900 bg-opacity-60 ">
                  {campuses.map((d) => (
                    <Link
                      passHref
                      key={d.name}
                      href={d.link}
                      onClick={() => {
                        setMenu(false);
                        setItem("");
                      }}
                    >
                      <div className="bg-white text-gray-800 p-2 px-3 rounded flex items-center gap-2 whitespace-nowrap">
                        {d.name}{" "}
                        {router.pathname == d.link && (
                          <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Staff Panel */}
            <a href="https://manager.jamiamadeenathunnoor.org/">
              <div className=" p-2 rounded text-white flex items-center gap-2">
                Staff Panel
              </div>
            </a>
            {/* Alumni */}
            <Link passHref href={"/Alumni"} onClick={() => setMenu(false)}>
              <div className=" p-2 rounded text-white flex items-center gap-2">
                {router.pathname == "/Alumni" && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
                Alumni
              </div>
            </Link>
            {/* News */}
            <Link passHref href={"/Newses"} onClick={() => setMenu(false)}>
              <div className=" p-2 rounded text-white flex items-center gap-2">
                {router.pathname == "/Newses" && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
               Updates
              </div>
            </Link>
            {/* Contact */}
            <Link passHref href={"/Contact"} onClick={() => setMenu(false)}>
              <div className=" p-2 rounded text-white flex items-center gap-2">
                {router.pathname == "/Contact" && (
                  <div className=" rounded-full h-2 w-2 bg-green-600"></div>
                )}
                Contact
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobNav;
