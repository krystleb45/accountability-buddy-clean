'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { getCurrentYear, generateFooterLinks } from '../../utils/FooterUtils';
import NewsletterSignup from '@/components/Forms/NewsletterSignup';
import { FaTwitter } from 'react-icons/fa';
import styles from './Footer.module.css';

/**
 * Footer component with newsletter signup, navigation links, and social icons.
 */
const Footer: React.FC = () => {
  const currentYear = getCurrentYear();
  const footerLinks = generateFooterLinks();

  const handleNewsletterSubmit = useCallback((data: { email: string; consent: boolean }): void => {
    // TODO: integrate real newsletter API
    console.log('Newsletter signup:', data);
  }, []);

  return (
    <footer
      className={`${styles.footer} bg-black px-4 py-8 text-white`}
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row">
        {/* Branding and Copyright */}
        <div className="flex-1">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Accountability Buddy. All rights reserved.
          </p>
        </div>

        {/* Newsletter Signup and Links */}
        <div className="flex flex-1 flex-col gap-8 sm:flex-row sm:items-start">
          {/* Newsletter Form */}
          <div className="w-full sm:w-1/2">
            <h3 className="mb-2 font-semibold text-white">Stay Updated</h3>
            <NewsletterSignup onSubmit={handleNewsletterSubmit} />
          </div>

          {/* Footer Navigation */}
          <nav className="w-full sm:w-1/2" aria-label="Footer Navigation">
            <h3 className="mb-2 font-semibold text-white">Quick Links</h3>
            <ul className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.url} className="text-gray-400 transition hover:text-kelly-green">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://twitter.com/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-400 transition hover:text-kelly-green"
                  aria-label="Follow us on Twitter"
                >
                  <FaTwitter aria-hidden="true" />
                  <span>Twitter</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Back to Top */}
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-lg bg-green-500 px-4 py-2 text-black transition hover:bg-green-400"
            aria-label="Scroll back to top"
          >
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
