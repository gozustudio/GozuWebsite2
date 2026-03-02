"use client";

import { motion } from "framer-motion";

export default function HeroVideo() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/projects/Main/images/Main.jpg"
      >
        <source src="/videos/LandingVideo.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom gradient fade to background color */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-bg))",
        }}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Logo mark */}
          <svg
            className="mx-auto h-16 w-auto text-white md:h-20"
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
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-6 text-[11px] font-medium uppercase tracking-[4px] text-white/70"
        >
          Architecture &middot; Interior Design
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[3px] text-white/50">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-[1px] bg-white/30"
          />
        </div>
      </motion.div>
    </section>
  );
}
