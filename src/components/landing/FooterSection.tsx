import Logo from "@/components/ui/Logo";

export default function FooterSection() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="max-w-[1320px] mx-auto px-6 py-10 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <Logo />
          <p className="font-mono text-[11px] text-zinc-500 mt-3 max-w-xs leading-relaxed">
            Market intelligence pour le hardware PC d'occasion. Données agrégées et normalisées, conformité art. L.341-1 CPI.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="font-mono text-[10px] tracking-wider text-zinc-600 mb-3">PRODUIT</div>
          <ul className="space-y-2 text-[12.5px] text-zinc-400">
            <li><a className="hover:text-zinc-100" href="#lens">Lens</a></li>
            <li><a className="hover:text-zinc-100" href="#estimator">Estimator</a></li>
            <li><a className="hover:text-zinc-100" href="#">Stock Manager</a></li>
            <li><a className="hover:text-zinc-100" href="#">Repair Guide</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="font-mono text-[10px] tracking-wider text-zinc-600 mb-3">LÉGAL</div>
          <ul className="space-y-2 text-[12.5px] text-zinc-400">
            <li><a className="hover:text-zinc-100" href="#">Mentions légales</a></li>
            <li><a className="hover:text-zinc-100" href="#">CGU</a></li>
            <li><a className="hover:text-zinc-100" href="/confidentialite">Confidentialité</a></li>
            <li><a className="hover:text-zinc-100" href="#">Contact</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="font-mono text-[10px] tracking-wider text-zinc-600 mb-3">SUIVRE</div>
          <ul className="space-y-2 text-[12.5px] text-zinc-400">
            <li><a className="hover:text-zinc-100" href="#">Twitter / X</a></li>
            <li><a className="hover:text-zinc-100" href="#">Discord pro</a></li>
            <li><a className="hover:text-zinc-100" href="#">RSS data</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-[1320px] mx-auto px-6 py-5 flex flex-wrap justify-between gap-4 font-mono text-[11px] text-zinc-600">
          <div>© 2026 Monark · v3.2.4 · build a8c91f</div>
          <div>Fait en France 🇫🇷</div>
        </div>
      </div>
    </footer>
  );
}