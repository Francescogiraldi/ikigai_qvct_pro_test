/**
 * Utilitaire de validation des données
 */
class Validator {
  // Vérifie si une valeur est définie et non vide
  static isRequired(value, fieldName = 'Ce champ') {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} est requis`;
    }
    return null;
  }
  
  // Vérifie si une valeur est un email valide
  static isEmail(value, fieldName = 'Email') {
    if (!value) return null; // Si pas obligatoire
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} doit être une adresse email valide`;
    }
    return null;
  }
  
  // Vérifie la longueur minimale
  static minLength(value, min, fieldName = 'Ce champ') {
    if (!value) return null; // Si pas obligatoire
    
    if (value.length < min) {
      return `${fieldName} doit contenir au moins ${min} caractères`;
    }
    return null;
  }
  
  // Vérifie la longueur maximale
  static maxLength(value, max, fieldName = 'Ce champ') {
    if (!value) return null; // Si pas obligatoire
    
    if (value.length > max) {
      return `${fieldName} ne doit pas dépasser ${max} caractères`;
    }
    return null;
  }
  
  // Vérifie si une valeur est un nombre
  static isNumber(value, fieldName = 'Ce champ') {
    if (value === undefined || value === null || value === '') return null;
    
    if (isNaN(Number(value))) {
      return `${fieldName} doit être un nombre`;
    }
    return null;
  }
  
  // Validation complète d'un objet avec règles
  static validate(data, rules) {
    // Si la validation est désactivée, retourner valide
    if (process.env.REACT_APP_VALIDATION_ENABLED !== 'true') {
      return { isValid: true, errors: {} };
    }
    
    const errors = {};
    let isValid = true;
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      let fieldErrors = [];
      
      // Appliquer chaque règle de validation
      fieldRules.forEach(rule => {
        let error = null;
        
        if (typeof rule === 'function') {
          // Règle personnalisée
          error = rule(data[field], field);
        } else if (rule.type === 'required') {
          error = this.isRequired(data[field], field);
        } else if (rule.type === 'email') {
          error = this.isEmail(data[field], field);
        } else if (rule.type === 'minLength') {
          error = this.minLength(data[field], rule.value, field);
        } else if (rule.type === 'maxLength') {
          error = this.maxLength(data[field], rule.value, field);
        } else if (rule.type === 'isNumber') {
          error = this.isNumber(data[field], field);
        }
        
        if (error) {
          fieldErrors.push(error);
        }
      });
      
      // Si des erreurs existent pour ce champ
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }
}

export default Validator;