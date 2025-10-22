import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { User, LogOut, LayoutDashboard, Menu } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          <h2>Digital Service Hub</h2>
        </Link>

        <div style={styles.menu}>
          <Link to="/services" style={styles.link}>Services</Link>
          <Link to="/vendors" style={styles.link}>Vendors</Link>
          <Link to="/rfq" style={styles.link}>RFQ</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={styles.link}>
                <LayoutDashboard size={18} style={{ marginRight: '0.5rem' }} />
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" style={styles.link}>Admin</Link>
              )}
              <div style={styles.userMenu}>
                <User size={18} />
                <span style={{ marginLeft: '0.5rem' }}>{user?.name}</span>
                {user?.trustBadge !== 'none' && (
                  <span className={`badge badge-${user?.trustBadge}`} style={{ marginLeft: '0.5rem' }}>
                    {user?.trustBadge}
                  </span>
                )}
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ marginRight: '1rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ef4444',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s',
  },
};

export default Navbar;
