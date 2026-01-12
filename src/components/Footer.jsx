import React from "react";
import { Send, MessageCircle } from "lucide-react";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p>© 2025 LearnCode. Все права защищены.😈</p>
                <div className="footer-links">
                    <a href="https://t.me/i9amo">
                        <Send className="footer-icon" aria-hidden="true" />
                        <span>Kontakty</span>
                    </a>
                    <a href="https://t.me/i9amo">
                        <MessageCircle className="footer-icon" aria-hidden="true" />
                        <span>Socseti</span>
                    </a>
                </div>
            </div>
        </footer>
    )
}