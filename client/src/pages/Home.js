import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, CreditCard, Star, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="container text-center">
          <h1 style={styles.heroTitle}>
            Find Trusted Service Providers for Every Need
          </h1>
          <p style={styles.heroSubtitle}>
            From daily household services to large-scale events - all in one platform
          </p>
          <div style={styles.heroButtons}>
            <Link to="/services?type=LVHF" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Book Home Services
            </Link>
            <Link to="/rfq/create" className="btn btn-outline" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Plan an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div className="grid grid-cols-4">
            <div className="card text-center">
              <Shield size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
              <h3 style={styles.featureTitle}>Verified Professionals</h3>
              <p style={styles.featureText}>
                All service providers are verified with background checks and trust badges
              </p>
            </div>
            <div className="card text-center">
              <CreditCard size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
              <h3 style={styles.featureTitle}>Secure Payments</h3>
              <p style={styles.featureText}>
                Escrow-based payment system ensures your money is safe until job completion
              </p>
            </div>
            <div className="card text-center">
              <Star size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
              <h3 style={styles.featureTitle}>Quality Guaranteed</h3>
              <p style={styles.featureText}>
                Rating and review system helps you choose the best service providers
              </p>
            </div>
            <div className="card text-center">
              <Search size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
              <h3 style={styles.featureTitle}>Easy Discovery</h3>
              <p style={styles.featureText}>
                Smart search and filters to find exactly what you need, when you need it
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section style={styles.serviceTypes}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <div className="grid grid-cols-2">
            <div className="card">
              <h3 style={styles.serviceTypeTitle}>Home & Local Services (LVHF)</h3>
              <p style={styles.serviceTypeText}>
                Quick, reliable services for your daily needs
              </p>
              <ul style={styles.serviceList}>
                <li>Plumbing & Electrical</li>
                <li>Cleaning & Pest Control</li>
                <li>Appliance Repair</li>
                <li>Carpentry & Painting</li>
              </ul>
              <Link to="/services?type=LVHF" style={styles.serviceLink}>
                Browse Services <ArrowRight size={16} />
              </Link>
            </div>
            <div className="card">
              <h3 style={styles.serviceTypeTitle}>Event Services (HVLF)</h3>
              <p style={styles.serviceTypeText}>
                Professional services for your special occasions
              </p>
              <ul style={styles.serviceList}>
                <li>Wedding Planning & Catering</li>
                <li>Photography & Videography</li>
                <li>Decoration & Venue</li>
                <li>Corporate Events</li>
              </ul>
              <Link to="/rfq/create" style={styles.serviceLink}>
                Request Quotes <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div className="container text-center">
          <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
          <p style={styles.ctaText}>
            Join thousands of satisfied customers who trust us for their service needs
          </p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '6rem 0',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    opacity: 0.9,
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  features: {
    padding: '4rem 0',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '3rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  featureText: {
    color: '#6b7280',
    lineHeight: 1.6,
  },
  serviceTypes: {
    padding: '4rem 0',
    backgroundColor: '#f9fafb',
  },
  serviceTypeTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  serviceTypeText: {
    color: '#6b7280',
    marginBottom: '1rem',
  },
  serviceList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '1.5rem',
  },
  serviceLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cta: {
    padding: '4rem 0',
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    opacity: 0.9,
  },
};

export default Home;
