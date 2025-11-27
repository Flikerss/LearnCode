import React from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="app-container fade-in">{children}</main>
      <Footer />
    </>
  );
}
