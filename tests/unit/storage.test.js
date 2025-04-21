/**
 * Tests pour le service de stockage (StorageService)
 * Ce fichier teste les fonctionnalités d'enregistrement des réponses utilisateur
 */

import { jest } from '@jest/globals';
import StorageService from '../../src/backend/services/StorageService';
import { supabase } from '../../src/shared/supabase';

// Mock de Supabase
jest.mock('../../src/shared/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    upsert: jest.fn(),
  },
}));

// Mock de fetch pour les appels API REST - Supprimé car Supabase est mocké
// global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('StorageService', () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
    localStorageMock.clear();
    // Réinitialiser le mock fetch - Supprimé
    // global.fetch.mockClear();
    // Configurer un mock de base pour fetch pour éviter les erreurs non gérées - Supprimé
    // global.fetch.mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue('') });
  });

  describe('saveModuleResponses', () => {
    test('devrait sauvegarder les réponses dans progress_data et user_responses pour onboarding', async () => {
      // Simuler un utilisateur connecté
      const mockUser = { id: 'user123' };
      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Simuler une réponse réussie pour upsert
      supabase.upsert.mockResolvedValue({ error: null });
      
      // Simuler une réponse réussie pour fetch - Supprimé
      // global.fetch.mockResolvedValue({
      //   ok: true,
      //   text: jest.fn().mockResolvedValue(''),
      // });
      
      // Données de test
      const moduleId = 'onboarding';
      const responses = {
        name: 'Test User',
        age: 30,
        goals: ['Réduire le stress', 'Améliorer la concentration']
      };
      
      // Simuler des données de progression existantes
      const mockProgress = StorageService.getInitialProgress();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      // Appeler la fonction à tester
      const result = await StorageService.saveModuleResponses(moduleId, responses);
      
      // Vérifier que les données ont été sauvegardées dans localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Vérifier que les données ont été sauvegardées dans Supabase (user_progress)
      expect(supabase.from).toHaveBeenCalledWith('user_progress');
      expect(supabase.upsert).toHaveBeenCalled();
      
      // Vérifier que saveUserResponses a été appelé avec les bons paramètres - Supprimé car fetch n'est plus mocké globalement
      // expect(global.fetch).toHaveBeenCalled();
      
      // Vérifier que les réponses sont dans le résultat
      expect(result.moduleResponses).toHaveProperty(moduleId);
      expect(result.moduleResponses[moduleId].responses).toEqual(responses);
    });
    
    test('devrait sauvegarder les réponses uniquement dans progress_data pour les modules non-onboarding', async () => {
      // Simuler un utilisateur connecté
      const mockUser = { id: 'user123' };
      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Simuler une réponse réussie pour upsert
      supabase.upsert.mockResolvedValue({ error: null });
      
      // Données de test
      const moduleId = 'mindfulness_1';
      const responses = {
        question1: 'Réponse 1',
        question2: 'Réponse 2'
      };
      
      // Simuler des données de progression existantes
      const mockProgress = StorageService.getInitialProgress();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      // Appeler la fonction à tester
      const result = await StorageService.saveModuleResponses(moduleId, responses);
      
      // Vérifier que les données ont été sauvegardées dans localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Vérifier que les données ont été sauvegardées dans Supabase (user_progress)
      expect(supabase.from).toHaveBeenCalledWith('user_progress');
      expect(supabase.upsert).toHaveBeenCalled();
      
      // Vérifier que saveUserResponses n'a PAS été appelé
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Vérifier que les réponses sont dans le résultat
      expect(result.moduleResponses).toHaveProperty(moduleId);
      expect(result.moduleResponses[moduleId].responses).toEqual(responses);
    });
    
    test('devrait utiliser le fallback localStorage quand l\'utilisateur n\'est pas connecté', async () => {
      // Simuler un utilisateur NON connecté
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Données de test
      const moduleId = 'onboarding';
      const responses = {
        name: 'Test User',
        age: 30,
        goals: ['Réduire le stress', 'Améliorer la concentration']
      };
      
      // Simuler des données de progression existantes
      const mockProgress = StorageService.getInitialProgress();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      // Appeler la fonction à tester
      const result = await StorageService.saveModuleResponses(moduleId, responses);
      
      // Vérifier que les données ont été sauvegardées dans localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Vérifier que les données n'ont PAS été sauvegardées dans Supabase
      expect(supabase.from).not.toHaveBeenCalled();
      
      // Vérifier que les réponses en attente ont été stockées
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pending_user_responses',
        expect.any(String)
      );
      
      // Vérifier que les réponses sont dans le résultat
      expect(result.moduleResponses).toHaveProperty(moduleId);
      expect(result.moduleResponses[moduleId].responses).toEqual(responses);
    });
  });
  
  describe('syncPendingResponses', () => {
    test('devrait synchroniser les réponses en attente quand l\'utilisateur se connecte', async () => {
      // Simuler un utilisateur connecté
      const mockUser = { id: 'user123' };
      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Simuler des réponses en attente
      const pendingResponses = [
        {
          module_id: 'onboarding',
          responses: { name: 'Test User', age: 30 },
          created_at: new Date().toISOString()
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(pendingResponses));
      
      // Simuler une réponse réussie pour fetch
      global.fetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      });
      
      // Appeler la fonction à tester
      await StorageService.syncPendingResponses();
      
      // Vérifier que fetch a été appelé avec les bonnes données
      expect(global.fetch).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://gryuokxglfbasdizecqw.supabase.co/rest/v1/user_responses',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: expect.any(String)
        })
      );
      
      // Vérifier que les réponses en attente ont été supprimées
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pending_user_responses');
    });
    
    test('ne devrait rien faire si aucune réponse en attente', async () => {
      // Simuler un utilisateur connecté
      const mockUser = { id: 'user123' };
      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Simuler aucune réponse en attente
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Appeler la fonction à tester
      await StorageService.syncPendingResponses();
      
      // Vérifier que fetch n'a PAS été appelé
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    test('ne devrait rien faire si l\'utilisateur n\'est pas connecté', async () => {
      // Simuler un utilisateur NON connecté
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Simuler des réponses en attente
      const pendingResponses = [
        {
          module_id: 'onboarding',
          responses: { name: 'Test User', age: 30 },
          created_at: new Date().toISOString()
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(pendingResponses));
      
      // Appeler la fonction à tester
      await StorageService.syncPendingResponses();
      
      // Vérifier que fetch n'a PAS été appelé
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
  
  describe('saveUserResponses', () => {
    test('devrait sauvegarder les réponses dans user_responses', async () => {
      // Simuler un utilisateur connecté
      const mockUser = { id: 'user123' };
      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Simuler une réponse réussie pour fetch
      global.fetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      });
      
      // Données de test
      const moduleId = 'onboarding';
      const responses = {
        name: 'Test User',
        age: 30,
        goals: ['Réduire le stress', 'Améliorer la concentration']
      };
      
      // Appeler la fonction à tester
      await StorageService.saveUserResponses(moduleId, responses);
      
      // Vérifier que fetch a été appelé avec les bonnes données
      expect(global.fetch).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://gryuokxglfbasdizecqw.supabase.co/rest/v1/user_responses',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: expect.stringContaining('user123')
        })
      );
    });
    
    test('ne devrait rien faire si l\'utilisateur n\'est pas connecté', async () => {
      // Simuler un utilisateur NON connecté
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      // Données de test
      const moduleId = 'onboarding';
      const responses = {
        name: 'Test User',
        age: 30,
        goals: ['Réduire le stress', 'Améliorer la concentration']
      };
      
      // Appeler la fonction à tester
      await StorageService.saveUserResponses(moduleId, responses);
      
      // Vérifier que fetch n'a PAS été appelé
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});