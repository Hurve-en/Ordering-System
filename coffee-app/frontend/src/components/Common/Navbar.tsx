import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { logout } from "../../redux/slices/authSlice";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth);
  const { items } = useAppSelector((state: any) => state.cart);

  const handleLogout = (): void => {
    dispatch(logout());
    navigate("/");
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span className={styles.icon}>☕</span>
            <span className={styles.text}>Apo Coffee</span>
          </Link>

          {/* Menu */}
          <ul className={styles.menu}>
            <li className={styles.item}>
              <Link to="/" className={styles.link}>
                Home
              </Link>
            </li>
            <li className={styles.item}>
              <Link to="/menu" className={styles.link}>
                Menu
              </Link>
            </li>
            {isAuthenticated && (
              <li className={styles.item}>
                <Link to="/orders" className={styles.link}>
                  Orders
                </Link>
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Cart */}
            <Link to="/cart" className={styles.cart}>
              <svg
                className={styles.svg}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {items.length > 0 && (
                <span className={styles.badge}>{items.length}</span>
              )}
            </Link>

            {/* User or Auth */}
            {isAuthenticated ? (
              <div className={styles.userSection}>
                <button className={styles.userBtn}>
                  <span className={styles.userIcon}>👤</span>
                  <span className={styles.userName}>
                    {user?.name || "User"}
                  </span>
                </button>
                <div className={styles.dropdown}>
                  <Link to="/profile" className={styles.dropItem}>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`${styles.dropItem} ${styles.logoutItem}`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.auth}>
                <Link to="/login" className={styles.authLink}>
                  Login
                </Link>
                <Link to="/register" className={styles.authBtn}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={styles.toggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobile}>
            <Link
              to="/"
              className={styles.mobileItem}
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={styles.mobileItem}
              onClick={toggleMobileMenu}
            >
              Menu
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className={styles.mobileItem}
                onClick={toggleMobileMenu}
              >
                Orders
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className={styles.mobileItem}
                onClick={toggleMobileMenu}
              >
                Profile
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className={styles.mobileItem}
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={styles.mobileItem}
                  onClick={toggleMobileMenu}
                >
                  Register
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`${styles.mobileItem} ${styles.logout}`}
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
