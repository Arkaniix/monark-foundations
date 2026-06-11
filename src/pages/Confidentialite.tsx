const h2 = "text-[15px] font-semibold text-zinc-100 mt-10 mb-3 tracking-tight";
const p = "text-[14px] text-zinc-400 leading-relaxed mb-3";
const li = "text-[14px] text-zinc-400 leading-relaxed mb-1.5 ml-4 list-disc";

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <a href="/" className="text-[13px] text-zinc-500 hover:text-zinc-300">← monark-market.fr</a>
        <h1 className="text-[32px] font-semibold tracking-tight text-zinc-100 mt-6 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-[13px] text-zinc-500 mb-10">Dernière mise à jour : 11 juin 2026</p>

        <h2 className={h2}>1. Responsable du traitement</h2>
        <p className={p}>
          Le service Monark (site monark-market.fr et extension de navigateur Monark Lens) est édité par
          [À COMPLÉTER : forme juridique et raison sociale], [À COMPLÉTER : adresse].
          Pour toute question relative à vos données : [À COMPLÉTER : e-mail de contact].
        </p>

        <h2 className={h2}>2. Données collectées — site et compte</h2>
        <ul className="mb-3">
          <li className={li}>Compte : adresse e-mail, mot de passe (stocké sous forme hachée), plan d'abonnement, solde de crédits.</li>
          <li className={li}>Usage : historique de vos analyses et estimations, journaux techniques (dont adresse IP) à des fins de sécurité.</li>
          <li className={li}>Paiement : traité par [À COMPLÉTER : prestataire de paiement] ; nous ne stockons aucun numéro de carte.</li>
        </ul>

        <h2 className={h2}>3. Données collectées — extension Monark Lens</h2>
        <p className={p}>
          Lorsque vous consultez une page d'annonce sur Leboncoin, eBay ou Vinted, l'extension peut transmettre
          à nos serveurs : une empreinte anonyme de l'annonce (hachage irréversible — l'adresse exacte de la page
          n'est jamais transmise), le composant identifié, le titre de l'annonce, le prix, l'état, la région et
          l'intention détectée (vente, lot, recherche…). Le titre transmis sert à la classification automatique
          de l'annonce.
        </p>
        <p className={p}>
          Cette collecte alimente les statistiques de marché du service. Elle est désactivable à tout moment
          depuis la fenêtre de l'extension (« Collecte passive »). L'extension est inactive en dehors des pages
          de détail d'annonce des trois plateformes citées et ne collecte aucune autre donnée de navigation.
        </p>

        <h2 className={h2}>4. Finalités</h2>
        <ul className="mb-3">
          <li className={li}>Fournir le service : analyses d'annonces, estimations, alertes, listes de suivi.</li>
          <li className={li}>Produire des statistiques de marché agrégées et anonymisées.</li>
          <li className={li}>Assurer la sécurité du service et prévenir les abus.</li>
          <li className={li}>Gérer la facturation et le compte.</li>
        </ul>

        <h2 className={h2}>5. Bases légales</h2>
        <p className={p}>
          Exécution du contrat (compte, analyses, crédits), intérêt légitime (statistiques agrégées, sécurité)
          — avec faculté d'opposition pour la collecte passive de l'extension, désactivable dans ses réglages —
          et obligations légales (facturation).
        </p>

        <h2 className={h2}>6. Conservation et anonymisation</h2>
        <p className={p}>
          Les données de compte sont conservées pendant la durée de vie du compte, puis supprimées après sa
          clôture. Les observations de marché conservées à long terme sont définitivement dissociées des comptes
          utilisateurs et ne contiennent ni adresse d'annonce, ni identifiant de vendeur.
        </p>

        <h2 className={h2}>7. Destinataires</h2>
        <p className={p}>
          Vos données ne sont ni vendues ni louées. Elles ne sont transmises qu'à nos sous-traitants techniques :
          hébergement ([À COMPLÉTER : hébergeur et pays]) et prestataire de paiement. Aucun tracking publicitaire,
          aucun traceur tiers.
        </p>

        <h2 className={h2}>8. Vos droits</h2>
        <p className={p}>
          Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de
          portabilité sur vos données, en écrivant à [À COMPLÉTER : e-mail de contact]. Vous pouvez également
          introduire une réclamation auprès de la CNIL (cnil.fr).
        </p>

        <h2 className={h2}>9. Stockage local</h2>
        <p className={p}>
          Le site et l'extension conservent vos jetons de session dans le stockage local de votre navigateur,
          nécessaire au fonctionnement du service. Aucun cookie publicitaire n'est utilisé.
        </p>

        <h2 className={h2}>10. Modifications</h2>
        <p className={p}>
          Cette politique peut évoluer ; la date de dernière mise à jour figure en tête de page.
        </p>
      </div>
    </div>
  );
}