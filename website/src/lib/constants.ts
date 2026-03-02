export const SITE = {
  name: "Gozu Studio",
  domain: "gozustudio.com",
  url: "https://www.gozustudio.com",
  email: "info@gozustudio.com",
  phone: "(+44) 07765 577275",
  instagram: "https://www.instagram.com/gozustudio/",
  founder: "Goda Zukaite",
  description:
    "Luxury architecture and interior design studio based in London, UK. Specialising in residential and commercial projects across Europe.",
  locations: ["London, United Kingdom", "Vilnius, Lithuania"],
} as const;

export const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/gozustudio/",
    icon: "/images/instagram.svg",
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: "/images/linkedin.svg",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/4407765577275",
    icon: "/images/whatsapp.svg",
  },
  {
    name: "Telegram",
    href: "https://t.me/+4407765577275",
    icon: "/images/telegram.svg",
  },
  {
    name: "X",
    href: "#",
    icon: "/images/x.svg",
  },
] as const;
