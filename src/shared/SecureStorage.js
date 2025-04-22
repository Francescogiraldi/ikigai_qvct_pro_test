/**
* Utilitaire pour chiffrer les données dans le stockage local
*/

class SecureStorage {
  // Clé de chiffrement (à remplacer par une clé environnementale)
  static ENCRYPTION_KEY = process.env.REACT_APP_STORAGE_ENCRYPTION_KEY || 'default-dev-key-replace-in-production';

  // Fonction simple de chiffrement (une vraie implémentation utiliserait CryptoJS ou similaire)
  static encrypt(data) {
    if (!data) return data;

    // Version simple de chiffrement (pour démo)
    // En production, utilisez une bibliothèque comme CryptoJS
    try {
      const jsonString = JSON.stringify(data);
      // Base64 encoding comme simulacre de chiffrement
      // (ce n'est PAS un vrai chiffrement sécurisé)
      return btoa(jsonString);
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      return null;
    }
  }

  // Fonction de déchiffrement
  static decrypt(encryptedData) {
    if (!encryptedData) return null;
    try {
      // Décodage Base64 (simulacre de déchiffrement)
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      return null;
    }
  }

  // Stocker une valeur de manière sécurisée
  static setItem(key, value) {
    const encryptedValue = this.encrypt(value);
    if (encryptedValue) {
      localStorage.setItem(key, encryptedValue);
      return true;
    }
    return false;
  }

  // Récupérer une valeur stockée
  static getItem(key) {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    return this.decrypt(encryptedValue);
  }

  // Supprimer une valeur
  static removeItem(key) {
    localStorage.removeItem(key);
  }

  // Vider le stockage
  static clear() {
    localStorage.clear();
  }
}

export default SecureStorage;