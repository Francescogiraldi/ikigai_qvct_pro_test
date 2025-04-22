/**
* Utilitaire pour chiffrer les données dans le stockage local
* Utilise CryptoJS pour un chiffrement AES sécurisé
*/

// Importation de CryptoJS pour le chiffrement AES
import CryptoJS from 'crypto-js';

class SecureStorage {
  // Clé de chiffrement (à remplacer par une clé environnementale)
  static ENCRYPTION_KEY = process.env.REACT_APP_STORAGE_ENCRYPTION_KEY || 'default-dev-key-replace-in-production';

  // Génération d'une clé dérivée sécurisée à partir de la clé principale
  static getSecureKey() {
    // Utilisation de PBKDF2 pour dériver une clé plus sécurisée
    // Le sel est fixe ici mais pourrait être stocké séparément en production
    const salt = 'IKIGAI_SECURE_SALT';
    return CryptoJS.PBKDF2(this.ENCRYPTION_KEY, salt, {
      keySize: 256 / 32,
      iterations: 1000
    }).toString();
  }

  // Fonction de chiffrement AES sécurisée
  static encrypt(data) {
    if (!data) return data;

    try {
      const jsonString = JSON.stringify(data);
      const secureKey = this.getSecureKey();
      
      // Génération d'un vecteur d'initialisation aléatoire pour chaque chiffrement
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Chiffrement AES en mode CBC avec padding
      const encrypted = CryptoJS.AES.encrypt(jsonString, secureKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Concaténation de l'IV et du texte chiffré pour stockage
      // Format: IV:CipherText (en Base64)
      return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      return null;
    }
  }

  // Fonction de déchiffrement AES sécurisée
  static decrypt(encryptedData) {
    if (!encryptedData) return null;
    try {
      // Séparation de l'IV et du texte chiffré
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Format de données chiffrées invalide');
      }
      
      const iv = CryptoJS.enc.Base64.parse(parts[0]);
      const cipherText = parts[1];
      const secureKey = this.getSecureKey();
      
      // Déchiffrement avec la même configuration
      const decrypted = CryptoJS.AES.decrypt(cipherText, secureKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Conversion en chaîne UTF-8 puis parsing JSON
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
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