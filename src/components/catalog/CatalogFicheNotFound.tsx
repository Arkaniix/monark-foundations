import { Link } from "@tanstack/react-router";

export default function CatalogFicheNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="font-mono text-[10.5px] tracking-[0.16em] text-zinc-500">MODÈLE INTROUVABLE</div>
      <Link
        to="/catalogue"
        className="font-mono text-[10.5px] tracking-[0.12em] text-blue-400 hover:text-blue-300"
      >
        ← RETOUR CATALOGUE
      </Link>
    </div>
  );
}