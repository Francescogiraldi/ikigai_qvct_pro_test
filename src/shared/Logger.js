/**
 * Utilitaire de logging centralisé pour l'application IKIGAI
 * Permet de gérer les logs de manière cohérente et sécurisée
 * Ne log en production que les erreurs et masque les données sensibles
 */

class Logger {
  static log(level, message, data = {}) {
    // Ne logger qu'en développement ou si c'est une erreur
    if (process.env.NODE_ENV !== 'production' || level === 'error') {
      // Masquer les données sensibles
      const sanitizedData = this.sanitize(data);
      console[level](message, sanitizedData);
    }
  }
  
  static sanitize(data) {
    // Copie profonde pour ne pas modifier l'original
    if (!data) return data;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Liste de propriétés à masquer
    const sensitiveProps = ['password', 'token', 'key', 'secret', 'credentials'];
    
    // Fonction récursive pour parcourir l'objet
    const maskSensitiveData = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;
      
      Object.keys(obj).forEach(key => {
        // Si la propriété est sensible, la masquer
        if (sensitiveProps.some(prop => key.toLowerCase().includes(prop))) {
          obj[key] = '[MASKED]';
        } 
        // Sinon, continuer la récursion si c'est un objet
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskSensitiveData(obj[key]);
        }
      });
    };
    
    maskSensitiveData(sanitized);
    return sanitized;
  }
  
  static debug(message, data = {}) {
    this.log('log', message, data);
  }
  
  static info(message, data = {}) {
    this.log('info', message, data);
  }
  
  static warn(message, data = {}) {
    this.log('warn', message, data);
  }
  
  static error(message, data = {}) {
    this.log('error', message, data);
  }
}

export default Logger;