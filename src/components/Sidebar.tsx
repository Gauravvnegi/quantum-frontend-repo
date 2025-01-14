"use client";
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaHome, FaUsers, FaEdit, FaWpforms, FaMoneyBillWave, FaWallet, FaDollarSign, FaNewspaper, FaImages, FaUserSecret, FaSignOutAlt, FaLock } from "react-icons/fa";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar }: SidebarProps) => {
  const menuItems = [
    { name: "Lead View", path: "/admin/leads", icon: <FaHome /> },
    { name: "Members", path: "/admin/members", icon: <FaUsers /> },
    { name: "Create Blog", path: "/admin/blogs", icon: <FaEdit /> }, 
    {name : "Applicant View", path:"/admin/applicantView", icon:<FaWpforms />},
    {name : "Fee Management", path:"/admin/feeDetails", icon:<FaDollarSign />},
    { name: "News & Events", path: "/admin/news-events", icon: <FaNewspaper /> },
    { name: "Picture Gallery", path: "/admin/picture-gallery", icon: <FaImages /> },
    { name: "Change Password", path: "/admin/changePassword", icon: <FaLock   /> },
    { name: "Logout", path: "/admin/logout", icon: <FaSignOutAlt   /> }

  ];

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64" : "w-16"
      } h-screen bg-gray-900 text-white transition-all duration-300 fixed top-0 left-0 flex flex-col`}
    >
      <div
        className="absolute top-4 left-4 text-xl cursor-pointer"
        onClick={toggleSidebar}
      >
        <FaBars />
      </div>
      <ul className="mt-16 space-y-4">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.path}
              className="flex items-center gap-4 px-4 py-2 rounded-md hover:bg-gray-700 hover:translate-x-2 transition-all"
            >
              <span className="text-lg">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;