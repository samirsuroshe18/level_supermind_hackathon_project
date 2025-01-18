import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0B0F1C] text-white py-8 px-4 sm:px-12 lg:px-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Resources Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/research" className="text-gray-400 hover:text-white transition">
                Research
              </Link>
            </li>
            <li>
              <Link to="/blogapi" className="text-gray-400 hover:text-white transition">
                BlogAPI
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/careers" className="text-gray-400 hover:text-white transition">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/twitter" className="text-gray-400 hover:text-white transition">
                Twitter
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-400 hover:text-white transition">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-gray-400 hover:text-white transition">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>

        {/* Dashboard Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/login" className="text-gray-400 hover:text-white transition">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-gray-400 hover:text-white transition">
                Register
              </Link>
            </li>
            <li>
              <Link to="/downloads" className="text-gray-400 hover:text-white transition">
                Data Downloads
              </Link>
            </li>
            <li>
              <Link to="/directory" className="text-gray-400 hover:text-white transition">
                Directory
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact us</h3>
          <div className="flex space-x-4">
            {/* Social Media Icons */}
            <Link
              to="/telegram"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
                alt="Telegram"
                className="w-8 h-8"
              />
            </Link>
            <Link
              to="/cancel"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                alt="Cancel"
                className="w-8 h-8"
              />
            </Link>
            <Link
              to="/linkedin"
              className="w-10 h-10 flex items-center justify-center  rounded-full hover:opacity-90 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                alt="LinkedIn"
                className="w-8 h-8"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-700 pt-6">
        <p className="text-sm text-gray-400">Copyright © Hack Horizon, Inc.</p>
        <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
