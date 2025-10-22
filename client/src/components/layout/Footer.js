import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <div>
            <h3 style={styles.heading}>Digital Service Hub</h3>
            <p style={styles.text}>
              Your trusted marketplace for local and event-based services.
            </p>
          </div>
          <div>
            <h4 style={styles.heading}>Services</h4>
            <ul style={styles.list}>
              <li><Link to="/services?type=LVHF" style={styles.link}>Home Services</Link></li>
              <li><Link to="/services?type=HVLF" style={styles.link}>Event Services</Link></li>
              <li><Link to="/vendors" style={styles.link}>Find Vendors</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={styles.heading}>Company</h4>
            <ul style={styles.list}>
              <li><Link to="/about" style={styles.link}>About Us</Link></li>
              <li><Link to="/contact" style={styles.link}>Contact</Link></li>
              <li><Link to="/careers" style={styles.link}>Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={styles.heading}>Support</h4>
            <ul style={styles.list}>
              <li><Link to="/help" style={styles.link}>Help Center</Link></li>
              <li><Link to="/terms" style={styles.link}>Terms of Service</Link></li>
              <li><Link to="/privacy" style={styles.link}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div style={styles.bottom}>
          <p>&copy; 2024 Digital Service Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '3rem 0 1rem',
    marginTop: '4rem',
  },
  heading: {
    marginBottom: '1rem',
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  text: {
    color: '#9ca3af',
    lineHeight: 1.6,
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  link: {
    color: '#9ca3af',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '0.5rem',
    transition: 'color 0.2s',
  },
  bottom: {
    borderTop: '1px solid #374151',
    paddingTop: '1rem',
    textAlign: 'center',
    color: '#9ca3af',
  },
};

export default Footer;
