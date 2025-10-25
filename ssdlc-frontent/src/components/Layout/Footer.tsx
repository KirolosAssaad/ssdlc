import React from 'react';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--color-dark-brown)', 
      color: 'white',
      padding: '3rem 0 1rem',
      marginTop: '4rem'
    }}>
      <div className="container">
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BookOpen size={24} />
              <h3>BookVault</h3>
            </div>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>
              Your digital library for discovering and enjoying the best ebooks. 
              One device, unlimited reading possibilities.
            </p>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', color: '#ccc' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/" style={{ color: '#ccc', textDecoration: 'none' }}>Browse Books</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/about" style={{ color: '#ccc', textDecoration: 'none' }}>About Us</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/support" style={{ color: '#ccc', textDecoration: 'none' }}>Support</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/privacy" style={{ color: '#ccc', textDecoration: 'none' }}>Privacy Policy</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Contact Info</h4>
            <div style={{ color: '#ccc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Mail size={16} />
                <span>support@bookvault.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} />
                <span>123 Book Street, Reading City</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid #555', 
          paddingTop: '1rem', 
          textAlign: 'center',
          color: '#ccc'
        }}>
          <p>&copy; 2024 BookVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;