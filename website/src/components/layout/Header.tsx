"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--color-bg)]/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav
          className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-12"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" className="relative z-50" aria-label="Gozu Studio Home">
            <svg
              className={`h-8 w-auto transition-colors duration-500 ${
                scrolled || menuOpen ? "text-[var(--color-body)]" : "text-white"
              }`}
              viewBox="0 0 78 52"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* GOZU Studio logo — using the currentColor variant */}
              <path d="M15.37,38.66c-1.31,0-2.54-.16-3.69-.48-1.15-.32-2.14-.79-2.97-1.41-.83-.63-1.49-1.39-1.96-2.3-.48-.91-.71-1.94-.71-3.11v-7.23c0-1.1.24-2.1.71-3.01.48-.91,1.13-1.69,1.96-2.35.83-.66,1.82-1.16,2.97-1.51,1.15-.35,2.38-.53,3.69-.53s2.56.17,3.71.52c1.15.35,2.15.84,3,1.49.85.65,1.51,1.43,1.99,2.35.48.92.71,1.93.71,3.04v1.73H13.37v-3.5h8.1v-.26c0-.73-.37-1.39-1.12-1.96-.74-.57-1.75-.86-3.01-.86-1.33,0-2.39.31-3.17.94-.78.63-1.18,1.34-1.18,2.14v6.65c0,.83.39,1.56,1.18,2.19.78.63,1.84.94,3.17.94,1.26,0,2.27-.29,3.01-.86.74-.57,1.12-1.23,1.12-1.96v-1.6h-4.18v-3.5h10.43v5.11c0,1.17-.24,2.2-.71,3.11-.48.91-1.14,1.67-1.99,2.3-.85.63-1.85,1.1-3,1.41-1.15.32-2.38.48-3.69.48Z" />
              <path d="M36.87,38.66c-1.35,0-2.6-.16-3.76-.48-1.16-.32-2.16-.79-3.01-1.41-.85-.63-1.51-1.39-1.99-2.3-.48-.91-.71-1.94-.71-3.11v-7.23c0-1.1.24-2.1.71-3.01.48-.91,1.14-1.69,1.99-2.35.85-.66,1.86-1.16,3.01-1.51,1.16-.35,2.41-.53,3.76-.53s2.6.17,3.76.52c1.16.35,2.16.84,3.01,1.49.85.65,1.51,1.43,1.99,2.35.48.92.71,1.93.71,3.04v7.23c0,1.17-.24,2.2-.71,3.11-.48.91-1.14,1.67-1.99,2.3-.85.63-1.86,1.1-3.01,1.41-1.16.32-2.41.48-3.76.48ZM36.87,34.84c1.33,0,2.4-.31,3.2-.94.8-.63,1.21-1.34,1.21-2.14v-6.65c0-.8-.4-1.51-1.21-2.14-.8-.63-1.87-.94-3.2-.94s-2.4.31-3.2.94c-.8.63-1.21,1.34-1.21,2.14v6.65c0,.8.4,1.51,1.21,2.14.8.63,1.87.94,3.2.94Z" />
              <path d="M48.11,38.34v-3.82l9.67-12.83h-9.19v-3.82h15.53v3.82l-9.67,12.83h9.67v3.82h-16.01Z" />
              <line x1="49.78" y1="0.64" x2="54.67" y2="6.51" stroke="currentColor" strokeWidth="1.5" />
              <path d="M65.48,38.66c-1.35,0-2.6-.17-3.76-.52-1.16-.35-2.16-.84-3.01-1.49-.85-.65-1.51-1.43-1.99-2.35-.48-.92-.71-1.93-.71-3.04v-13.38h6.25v13.14c0,.8.4,1.51,1.21,2.14.8.63,1.87.94,3.2.94s2.4-.31,3.2-.94c.8-.63,1.21-1.34,1.21-2.14v-13.14h6.25v13.38c0,1.1-.24,2.1-.71,3.01-.48.91-1.14,1.69-1.99,2.35-.85.66-1.86,1.16-3.01,1.51-1.16.35-2.41.52-3.76.52Z" />
              <text x="24" y="51" fontSize="8.5" fontFamily="inherit" fontWeight="300" letterSpacing="3.5" fill="currentColor">Studio</text>
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-medium uppercase tracking-[3px] transition-colors duration-300 hover:text-[var(--color-main)] ${
                  scrolled ? "text-[var(--color-body)]" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/quote"
              className="border border-[var(--color-main)] bg-transparent px-5 py-2 text-[11px] font-medium uppercase tracking-[3px] transition-all duration-300 hover:bg-[var(--color-main)] hover:text-white"
              style={{
                color: scrolled ? "var(--color-body)" : "white",
                borderColor: scrolled ? "var(--color-main)" : "rgba(255,255,255,0.5)",
              }}
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-[1px] w-6 transition-all duration-300 ${
                menuOpen
                  ? "translate-y-[4px] rotate-45 bg-[var(--color-body)]"
                  : scrolled
                    ? "bg-[var(--color-body)]"
                    : "bg-white"
              }`}
            />
            <span
              className={`block h-[1px] w-6 transition-all duration-300 ${
                menuOpen
                  ? "-translate-y-[3px] -rotate-45 bg-[var(--color-body)]"
                  : scrolled
                    ? "bg-[var(--color-body)]"
                    : "bg-white"
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--color-bg)] transition-opacity duration-500 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-4xl text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quote"
            onClick={() => setMenuOpen(false)}
            className="mt-4 border border-[var(--color-main)] px-8 py-3 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-all duration-300 hover:bg-[var(--color-main)] hover:text-white"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </>
  );
}
