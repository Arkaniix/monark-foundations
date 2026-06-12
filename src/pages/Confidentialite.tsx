const h2 = "text-[15px] font-semibold text-zinc-100 mt-10 mb-3 tracking-tight";
const p = "text-[14px] text-zinc-400 leading-relaxed mb-3";

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <a href="/" className="text-[13px] text-zinc-500 hover:text-zinc-300">← monark-market.fr</a>
        <h1 className="text-[32px] font-semibold tracking-tight text-zinc-100 mt-6 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-[13px] text-zinc-500 mb-10">Dernière mise à jour : 14 juin 2026</p>

        <p className={p}>
          Monark (monark-market.fr) et l'extension Monark Lens sont édités par [ENTITÉ JURIDIQUE / STATUT — À COMPLÉTER]. Pour toute question : [EMAIL DE CONTACT — À COMPLÉTER].
        </p>

        <h2 className={h2}>Données que nous traitons</h2>
        <p className={p}>
          <strong className="text-zinc-200 font-semibold">Compte.</strong> Lors de l'inscription : adresse e-mail et mot de passe (stocké sous forme hachée). S'y ajoutent votre formule d'abonnement et le journal de vos crédits (gains et dépenses).
        </p>
        <p className={p}>
          <strong className="text-zinc-200 font-semibold">Utilisation de l'extension.</strong> L'identification des composants et le filtrage des annonces s'exécutent localement, dans votre navigateur. Quand une donnée est transmise à nos serveurs, elle se limite à : le modèle de composant identifié, le prix affiché, la plateforme, l'état, la catégorie et une empreinte technique irréversible de l'annonce. Les titres, descriptions, photos et adresses des annonces ne sont ni transmis ni stockés sur nos serveurs.
        </p>
        <p className={p}>
          <strong className="text-zinc-200 font-semibold">Signalements.</strong> Si vous signalez ou confirmez une anomalie, nous enregistrons le type d'anomalie, les très courts extraits de texte (80 caractères maximum) ayant déclenché la détection, le modèle, le prix et la plateforme — jamais l'annonce complète.
        </p>
        <p className={p}>
          <strong className="text-zinc-200 font-semibold">Données locales.</strong> Vos jetons de connexion, vos préférences et l'historique de vos décisions de filtrage restent stockés localement dans votre navigateur et ne quittent pas votre appareil.
        </p>

        <h2 className={h2}>Pourquoi nous les traitons</h2>
        <p className={p}>
          Fournir les analyses de marché (sous forme de statistiques agrégées), gérer votre compte et vos crédits, améliorer la détection des annonces anormales et sécuriser le service. Ces traitements reposent sur l'exécution du service auquel vous souscrivez et sur notre intérêt légitime à l'améliorer.
        </p>

        <h2 className={h2}>Partage</h2>
        <p className={p}>
          Nous ne vendons aucune donnée. Aucun partage à des tiers, hors prestataires techniques strictement nécessaires : hébergement ([HÉBERGEUR + PAYS — À COMPLÉTER]) et prestataire de paiement lors d'un achat. Ni le site ni l'extension n'embarquent de traceurs publicitaires.
        </p>

        <h2 className={h2}>Durées de conservation et vos droits</h2>
        <p className={p}>
          Vos données de compte sont conservées tant que votre compte est actif. À la suppression du compte, elles sont effacées et vos contributions aux statistiques de marché sont anonymisées (identifiant définitivement dissocié). Certaines données de facturation peuvent être conservées le temps des obligations légales.
        </p>
        <p className={p}>
          Vous disposez des droits d'accès, de rectification, d'effacement, d'opposition et de portabilité : écrivez à [EMAIL DE CONTACT]. Vous pouvez également saisir la CNIL.
        </p>

        <h2 className={h2}>Permissions de l'extension</h2>
        <p className={p}>
          Monark Lens demande uniquement les permissions «&nbsp;storage&nbsp;» et «&nbsp;alarms&nbsp;», et n'accède qu'aux pages d'annonces des plateformes supportées (Leboncoin, eBay, Vinted) et à monark-market.fr.
        </p>
        <p className={p}>
          Cette politique peut évoluer ; la date de mise à jour figure en tête de page.
        </p>
      </div>
    </div>
  );
}