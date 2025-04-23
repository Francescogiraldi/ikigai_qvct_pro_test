/**
 * Protection CSRF
 */
import SecureStorage from './SecureStorage';

class CSRFProtection {
  static TOKEN_KEY = 'ikigai_csrf_token';
  
  // Générer un token CSRF aléatoire
  static generateToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    SecureStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }
  
  // Obtenir le token actuel ou en générer un nouveau
  static getToken() {
    let token = SecureStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }
  
  // Vérifier si un token est valide
  static isValidToken(token) {
    const storedToken = SecureStorage.getItem(this.TOKEN_KEY);
    return token === storedToken;
  }
  
  // Préparer les en-têtes avec le token CSRF
  static prepareHeaders(headers = {}) {
    const token = this.getToken();
    return {
      ...headers,
      'X-CSRF-Token': token
    };
  }
}

export default CSRFProtection;