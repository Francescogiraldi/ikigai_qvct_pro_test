import React from 'react';
import { motion } from 'framer-motion';

// Composant pour les pages légales et d'information
const LegalPages = ({ page, onClose }) => {
  // Contenu des différentes pages
  const pageContent = {
    copyright: {
      title: 'Copyright 2025',
      content: (
        <div className="space-y-4">
          <p>
            © 2025 IKIGAI. Tous droits réservés.
          </p>
          <p>
            L'ensemble du contenu de cette application, y compris les textes, images, logos, designs, et code source, 
            est la propriété exclusive d'IKIGAI et est protégé par les lois internationales sur le droit d'auteur.
          </p>
          <p>
            Toute reproduction, distribution, modification ou utilisation du contenu sans autorisation écrite préalable 
            est strictement interdite et constitue une violation des droits d'auteur.
          </p>
        </div>
      )
    },
    legal: {
      title: 'Mentions Légales',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Éditeur de l'application</h3>
          <p>
            IKIGAI SAS<br />
            123 Avenue de la Sérénité<br />
            34070 Montpellier, France<br />
            Email : contact@ikigai-app.com<br />
            Téléphone : +33 .........<br />
            Capital social : x €<br />
            RCS Montpellier : ....<br />
            N° TVA : FR 12 345 678 901
          </p>
          
          <h3 className="text-lg font-semibold">Hébergement</h3>
          <p>
            L'application est hébergée par Netlify.<br />
            Adresse : 
          </p>
          
          <h3 className="text-lg font-semibold">Directeur de la publication</h3>
          <p>
            Jonathan JOYEUX, IKIGAI SAS
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Politique de Confidentialité',
      content: (
        <div className="space-y-4">
          <p>
            Chez IKIGAI, nous accordons une importance capitale à la protection de vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
          
          <h3 className="text-lg font-semibold">Données collectées</h3>
          <p>
            Nous collectons les informations suivantes :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Informations d'identification (nom, prénom, email)</li>
            <li>Âge (optionnel)</li>
            <li>Statut professionnel</li>
            <li>Réponses aux questionnaires IKIGAI</li>
            <li>Données d'utilisation de l'application</li>
          </ul>
          
          <h3 className="text-lg font-semibold">Utilisation des données</h3>
          <p>
            Vos données sont utilisées pour :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personnaliser votre expérience IKIGAI</li>
            <li>Générer des recommandations adaptées à votre profil</li>
            <li>Améliorer nos services et algorithmes</li>
            <li>Vous contacter concernant votre compte</li>
          </ul>
          
          <h3 className="text-lg font-semibold">Protection de vos données</h3>
          <p>
            Nous utilisons Supabase, une plateforme sécurisée, pour stocker vos données. 
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
            pour protéger vos informations contre tout accès non autorisé.
          </p>
          
          <h3 className="text-lg font-semibold">Vos droits</h3>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition</li>
          </ul>
          
          <p>
            Pour exercer ces droits, contactez-nous à privacy@ikigai-app.com.
          </p>
        </div>
      )
    },
    support: {
      title: 'Support',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Comment nous contacter</h3>
          <p>
            Notre équipe de support est disponible pour vous aider du lundi au vendredi, de 9h à 18h (CET).
          </p>
          
          <h3 className="text-lg font-semibold">Par email</h3>
          <p>
            Pour toute question ou assistance : support@ikigai-app.com<br />
            Temps de réponse habituel : 24-48 heures ouvrées
          </p>
          
          <h3 className="text-lg font-semibold">Par téléphone</h3>
          <p>
            Assistance téléphonique : +33 .....<br />
            Disponible du lundi au vendredi, 9h-18h (CET)
          </p>
          
          <h3 className="text-lg font-semibold">FAQ</h3>
          <p>
            Consultez notre <a href="/faq" className="text-blue-600 hover:underline">base de connaissances</a> pour trouver rapidement des réponses aux questions fréquentes.
          </p>
          
          <h3 className="text-lg font-semibold">Signaler un problème</h3>
          <p>
            Si vous rencontrez un bug ou un problème technique, merci de nous fournir :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Une description détaillée du problème</li>
            <li>Les étapes pour reproduire le problème</li>
            <li>Le type d'appareil et de navigateur utilisés</li>
            <li>Des captures d'écran si possible</li>
          </ul>
        </div>
      )
    }
  };

  // Vérifier si la page demandée existe
  if (!pageContent[page]) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
          <div className="p-5">
            <h2 className="text-xl font-bold text-red-600">Page non trouvée</h2>
            <p className="mt-2">La page demandée n'existe pas.</p>
            <div className="mt-4 text-right">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-blue-50 p-5">
          <h2 className="text-xl font-bold text-blue-600">{pageContent[page].title}</h2>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {pageContent[page].content}
        </div>
        <div className="p-5 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LegalPages;