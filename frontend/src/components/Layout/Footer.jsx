import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Lock, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-brown text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-brown" />
              <span className="text-2xl font-bold">BookVault</span>
            </div>
            <p className="text-cream/80 mb-4 max-w-md">
              Your secure digital library with advanced DRM protection. 
              Discover, purchase, and enjoy thousands of ebooks with complete peace of mind.
            </p>
            <div className="flex items-center space-x-2 text-sm text-cream/60">
              <Shield className="h-4 w-4" />
              <span>DRM Protected</span>
              <Lock className="h-4 w-4 ml-4" />
              <span>Secure Downloads</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-cream/80 hover:text-cream transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/genres" className="text-cream/80 hover:text-cream transition-colors">
                  Genres
                </Link>
              </li>
              <li>
                <Link to="/authors" className="text-cream/80 hover:text-cream transition-colors">
                  Authors
                </Link>
              </li>
              <li>
                <Link to="/new-releases" className="text-cream/80 hover:text-cream transition-colors">
                  New Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-cream/80 hover:text-cream transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/drm-info" className="text-cream/80 hover:text-cream transition-colors">
                  DRM Information
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-cream/80 hover:text-cream transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cream/80 hover:text-cream transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-cream/60 text-sm">
            © 2024 BookVault. All rights reserved. Protected by advanced DRM technology.
          </div>
          <div className="flex items-center space-x-1 text-cream/60 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-brown" />
            <span>for book lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;