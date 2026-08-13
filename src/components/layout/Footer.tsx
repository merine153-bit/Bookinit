export default function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-900 bg-brand-950 py-10 text-brand-200">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-sm">© 2026 Passerelle TCF Canada. جميع الحقوق محفوظة.</p>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <a href="#" className="hover:text-white">من نحن</a>
          <a href="#" className="hover:text-white">الخصوصية</a>
          <a href="#" className="hover:text-white">تواصل معنا</a>
        </div>
        <span className="text-xl font-extrabold text-white">
          Passerelle <span className="text-accent-500">TCF</span>
        </span>
      </div>
    </footer>
  );
}
