export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <p className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-text-light/55">
        &copy; {new Date().getFullYear()} CARBON_REEF. All rights reserved.
      </p>
    </footer>
  );
}
