import React from 'react';
import './Footer.css';
import { FaDiscord } from 'react-icons/fa';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-socials">
                    Made by: Redo
                </div>
                <div className="footer-links">
                <FaDiscord />Random Guy On The Internet
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Redo. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;