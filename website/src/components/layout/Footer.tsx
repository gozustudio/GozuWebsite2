import Link from "next/link";
import Image from "next/image";
import { SITE, NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]/20 bg-[var(--color-body)]">
      {/* Pre-footer CTA */}
      <div className="mx-auto max-w-[1400px] px-6 py-20 text-center lg:px-12">
        <h2 className="font-serif text-3xl text-white/90 md:text-5xl">
          Have a project in mind?
        </h2>
        <p className="mt-4 text-sm tracking-wide text-white/50">
          Let&apos;s create something extraordinary together.
        </p>
        <Link
          href="/quote"
          className="mt-8 inline-block border border-[var(--color-main)] px-10 py-3 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-main)] transition-all duration-300 hover:bg-[var(--color-main)] hover:text-white"
        >
          Request a Quote
        </Link>
      </div>

      {/* Footer Content */}
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 lg:grid-cols-4 lg:px-12">
          {/* Brand */}
          <div>
            <svg
              className="h-8 w-auto text-white"
              viewBox="0 0 78 52"
              fill="currentColor"
              aria-label="Gozu Studio"
            >
              <path d="M15.37,38.66c-1.31,0-2.54-.16-3.69-.48-1.15-.32-2.14-.79-2.97-1.41-.83-.63-1.49-1.39-1.96-2.3-.48-.91-.71-1.94-.71-3.11v-7.23c0-1.1.24-2.1.71-3.01.48-.91,1.13-1.69,1.96-2.35.83-.66,1.82-1.16,2.97-1.51,1.15-.35,2.38-.53,3.69-.53s2.56.17,3.71.52c1.15.35,2.15.84,3,1.49.85.65,1.51,1.43,1.99,2.35.48.92.71,1.93.71,3.04v1.73H13.37v-3.5h8.1v-.26c0-.73-.37-1.39-1.12-1.96-.74-.57-1.75-.86-3.01-.86-1.33,0-2.39.31-3.17.94-.78.63-1.18,1.34-1.18,2.14v6.65c0,.83.39,1.56,1.18,2.19.78.63,1.84.94,3.17.94,1.26,0,2.27-.29,3.01-.86.74-.57,1.12-1.23,1.12-1.96v-1.6h-4.18v-3.5h10.43v5.11c0,1.17-.24,2.2-.71,3.11-.48.91-1.14,1.67-1.99,2.3-.85.63-1.85,1.1-3,1.41-1.15.32-2.38.48-3.69.48Z" />
              <path d="M36.87,38.66c-1.35,0-2.6-.16-3.76-.48-1.16-.32-2.16-.79-3.01-1.41-.85-.63-1.51-1.39-1.99-2.3-.48-.91-.71-1.94-.71-3.11v-7.23c0-1.1.24-2.1.71-3.01.48-.91,1.14-1.69,1.99-2.35.85-.66,1.86-1.16,3.01-1.51,1.16-.35,2.41-.53,3.76-.53s2.6.17,3.76.52c1.16.35,2.16.84,3.01,1.49.85.65,1.51,1.43,1.99,2.35.48.92.71,1.93.71,3.04v7.23c0,1.17-.24,2.2-.71,3.11-.48.91-1.14,1.67-1.99,2.3-.85.63-1.86,1.1-3.01,1.41-1.16.32-2.41.48-3.76.48ZM36.87,34.84c1.33,0,2.4-.31,3.2-.94.8-.63,1.21-1.34,1.21-2.14v-6.65c0-.8-.4-1.51-1.21-2.14-.8-.63-1.87-.94-3.2-.94s-2.4.31-3.2.94c-.8.63-1.21,1.34-1.21,2.14v6.65c0,.8.4,1.51,1.21,2.14.8.63,1.87.94,3.2.94Z" />
              <path d="M48.11,38.34v-3.82l9.67-12.83h-9.19v-3.82h15.53v3.82l-9.67,12.83h9.67v3.82h-16.01Z" />
              <line x1="49.78" y1="0.64" x2="54.67" y2="6.51" stroke="currentColor" strokeWidth="1.5" />
              <path d="M65.48,38.66c-1.35,0-2.6-.17-3.76-.52-1.16-.35-2.16-.84-3.01-1.49-.85-.65-1.51-1.43-1.99-2.35-.48-.92-.71-1.93-.71-3.04v-13.38h6.25v13.14c0,.8.4,1.51,1.21,2.14.8.63,1.87.94,3.2.94s2.4-.31,3.2-.94c.8-.63,1.21-1.34,1.21-2.14v-13.14h6.25v13.38c0,1.1-.24,2.1-.71,3.01-.48.91-1.14,1.69-1.99,2.35-.85.66-1.86,1.16-3.01,1.51-1.16.35-2.41.52-3.76.52Z" />
              <text x="24" y="51" fontSize="8.5" fontFamily="inherit" fontWeight="300" letterSpacing="3.5" fill="currentColor">Studio</text>
            </svg>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Luxury architecture &amp; interior design.
              <br />
              London &middot; Vilnius
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-white/60">
              Navigate
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors duration-300 hover:text-[var(--color-main)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/quote"
                  className="text-sm text-white/40 transition-colors duration-300 hover:text-[var(--color-main)]"
                >
                  Request a Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-white/60">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/40">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors duration-300 hover:text-[var(--color-main)]"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors duration-300 hover:text-[var(--color-main)]"
                >
                  {SITE.phone}
                </a>
              </li>
              {SITE.locations.map((loc) => (
                <li key={loc}>{loc}</li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[3px] text-white/60">
              Follow
            </h3>
            <div className="flex gap-4">
              {SOCIAL_LINKS.filter((s) => s.href !== "#").map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all duration-300 hover:border-[var(--color-main)] hover:bg-[var(--color-main)]"
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={16}
                    height={16}
                    className="invert"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-6 text-[11px] text-white/30 sm:flex-row lg:px-12">
          <p>&copy; {new Date().getFullYear()} Gozu Studio. All rights reserved.</p>
          <Link
            href="/privacy"
            className="transition-colors duration-300 hover:text-white/60"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
