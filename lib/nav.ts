export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Submit", href: "/submit" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "How it Works", href: "/#how-it-works" },
];
