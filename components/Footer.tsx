"use client";

import React from "react";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#dbe4eb] text-black">
      <div className="w-full px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="flex flex-col items-start space-y-2">
            <img src="/Banna Banni Logo.png" alt="Banna Banni Logo" className="h-10 w-auto" />
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 mt-1" />
            <p className="text-[15px] leading-normal">
              Third Floor, plot No 3, Ashirwad Embropark, Saniya Road, Saniya Hemad, Surat, Gujrat -395010
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <a href="mailto:contact@blfabric.com" className="hover:underline text-[15px]">
              contact@blfabric.com
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <a href="tel:+917433999837" className="hover:underline text-[15px]">
              +91 7433999837
            </a>
          </div>
        </div>

        {/* Important Links */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[16px] mb-3">Important Links</h3>
          <ul className="space-y-2 text-[15px]">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/products" className="hover:underline">All Products</a></li>
            <li><a href="/about" className="hover:underline">About Us</a></li>
            <li><a href="/contact" className="hover:underline">Contact Us</a></li>
            <li><a href="/faq" className="hover:underline">FAQs</a></li>
            <li><a href="/blogs" className="hover:underline">Blog</a></li>
          </ul>
        </div>

        {/* Working Hours */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[16px] mb-3">Working Hours</h3>
          <p className="text-[15px]">Monday - Saturday</p>
          <p className="text-[15px]">11:00AM to 06:00PM</p>
        </div>

        {/* My Account & Our Privacy */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-[16px] mb-3">My Account</h3>
            <ul className="space-y-2 text-[15px]">
              <li><a href="/login" className="hover:underline">My Account</a></li>
              
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[16px] mb-3">Our Privacy</h3>
            <ul className="space-y-2 text-[15px]">
              <li><a href="/privacypolicy" className="hover:underline">Privacy Policy</a></li>
              <li><a href="/Terms" className="hover:underline">Terms & Conditions</a></li>
              <li><a href="/Shipping" className="hover:underline">Shipping Policy</a></li>
              <li><a href="/returnrefund" className="hover:underline">Return & Refund Policy</a></li>
               <li><a href="/stitchingpolicy" className="hover:underline">Stitching Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-teal-800 text-white text-center py-3 text-[15px]">
        Copyright © 2025 Banna Banni all rights reserved. Powered by Banna Banni
      </div>
    </footer>
  );
};

export default Footer;
