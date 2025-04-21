/**
 * Tests d'intégration pour l'application Ikigai
 * Ce fichier teste l'application dans son ensemble, en simulant les interactions utilisateur
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App'; // Corrected path for App
import API from '../../src/backend/api'; // Corrected path for API

// Mock des services API
jest.mock('../../src/backend/api', () => ({ // Corrected path for mock
  auth: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated: jest.fn()
  },
  progress: {
    getProgress: jest.fn(),
    completeModule: jest.fn(),
    completeChallenge: jest.fn(),
    saveModuleResponses: jest.fn(),
    resetAllData: jest.fn()
  },
  content: {
    getAllIslands: jest.fn(() => [
      { id: 'island1', name: 'Île de la Découverte', description: 'Description de l\'île', modules: ['module1', 'module2'] },
      { id: 'island2', name: 'Île de la Passion', description: 'Description de l\'île', modules: ['module3', 'module4'] }
    ]),
    getAllModules: jest.fn(() => [
      { id: 'module1', name: 'Module 1', islandId: 'island1' },
      { id: 'module2', name: 'Module 2', islandId: 'island1' },
      { id: 'module3', name: 'Module 3', islandId: 'island2' },
      { id: 'module4', name: 'Module 4', islandId: 'island2' }
    ]),
    getAllChallenges: jest.fn(() => [
      { id: 'challenge1', name: 'Défi 1', category: 'daily' },
      { id: 'challenge2', name: 'Défi 2', category: 'weekly' }
    ]),
    getAllExercises: jest.fn(() => [
      { id: 'exercise1', name: 'Exercice 1', category: 'mindfulness' },
      { id: 'exercise2', name: 'Exercice 2', category: 'creativity' }
    ]),
    getIslandById: jest.fn((id) => {
      const islands = [
        { id: 'island1', name: 'Île de la Découverte', description: 'Description de l\'île', modules: ['module1', 'module2'] },
        { id: 'island2', name: 'Île de la Passion', description: 'Description de l\'île', modules: ['module3', 'module4'] }
      ];
      return islands.find(island => island.id === id);
    }),
    getModulesByIslandId: jest.fn((islandId) => {
      const modules = [
        { id: 'module1', name: 'Module 1', islandId: 'island1' },
        { id: 'module2', name: 'Module 2', islandId: 'island1' },
        { id: 'module3', name: 'Module 3', islandId: 'island2' },
        { id: 'module4', name: 'Module 4', islandId: 'island2' }
      ];
      return modules.filter(module => module.islandId === islandId);
    }),
    getModuleById: jest.fn((id) => {
      const modules = [
        { id: 'module1', name: 'Module 1', islandId: 'island1' },
        { id: 'module2', name: 'Module 2', islandId: 'island1' },
        { id: 'module3', name: 'Module 3', islandId: 'island2' },
        { id: 'module4', name: 'Module 4', islandId: 'island2' }
      ];
      return modules.find(module => module.id === id);
    }),
    getRecommendedContent: jest.fn(() => ({
      modules: [{ id: 'module1', name: 'Module 1', islandId: 'island1' }],
      challenges: [{ id: 'challenge1', name: 'Défi 1', category: 'daily' }]
    }))
  }
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
  });

  test('should show welcome page for new users', async () => {
    // Simuler un nouvel utilisateur
    API.auth.isAuthenticated.mockResolvedValue(false);
    API.progress.getProgress.mockResolvedValue({ totalPoints: 0 });
    
    render(<App />);
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByText(/Bienvenue sur IKIGAI/i)).toBeInTheDocument();
    });
  });

  test('should show signup page for users who completed onboarding but are not logged in', async () => {
    // Simuler un utilisateur qui a complété l'onboarding mais n'est pas connecté
    API.auth.isAuthenticated.mockResolvedValue(false);
    API.progress.getProgress.mockResolvedValue({
      totalPoints: 50,
      moduleResponses: {
        onboarding: {
          completedAt: new Date().toISOString()
        }
      }
    });
    
    render(<App />);
    
    // Attendre que l'application soit chargée et que la page d'inscription soit affichée
    await waitFor(() => {
      expect(screen.queryByText(/Créer un compte/i)).toBeInTheDocument();
    });
  });

  test('should show onboarding for logged in users who have not completed it', async () => {
    // Simuler un utilisateur connecté qui n'a pas complété l'onboarding
    API.auth.isAuthenticated.mockResolvedValue(true);
    API.progress.getProgress.mockResolvedValue({
      totalPoints: 0,
      moduleResponses: {}
    });
    
    render(<App />);
    
    // Attendre que l'application soit chargée et que l'onboarding soit affiché
    await waitFor(() => {
      expect(screen.queryByText(/Commencer votre voyage/i)).toBeInTheDocument();
    });
  });

  test('should show home page for logged in users who completed onboarding', async () => {
    // Simuler un utilisateur connecté qui a complété l'onboarding
    API.auth.isAuthenticated.mockResolvedValue(true);
    API.progress.getProgress.mockResolvedValue({
      totalPoints: 100,
      moduleResponses: {
        onboarding: {
          completedAt: new Date().toISOString()
        }
      }
    });
    
    render(<App />);
    
    // Attendre que l'application soit chargée et que la page d'accueil soit affichée
    await waitFor(() => {
      expect(screen.queryByText(/Tableau de bord/i)).toBeInTheDocument();
    });
  });

  test('should navigate to island view when island is selected', async () => {
    // Simuler un utilisateur connecté qui a complété l'onboarding
    API.auth.isAuthenticated.mockResolvedValue(true);
    API.progress.getProgress.mockResolvedValue({
      totalPoints: 100,
      moduleResponses: {
        onboarding: {
          completedAt: new Date().toISOString()
        }
      }
    });
    
    render(<App />);
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByText(/Tableau de bord/i)).toBeInTheDocument();
    });
    
    // Simuler la sélection d'une île
    await act(async () => {
      // Trouver et cliquer sur une île
      const islandElement = screen.getByText(/Île de la Découverte/i);
      userEvent.click(islandElement);
    });
    
    // Vérifier que la vue de l'île est affichée
    await waitFor(() => {
      expect(screen.queryByText(/Module 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/Module 2/i)).toBeInTheDocument();
    });
  });

  test('should complete a module and update progress', async () => {
    // Simuler un utilisateur connecté avec des modules à compléter
    API.auth.isAuthenticated.mockResolvedValue(true);
    API.progress.getProgress.mockResolvedValue({
      totalPoints: 100,
      moduleResponses: {
        onboarding: {
          completedAt: new Date().toISOString()
        }
      },
      completedModules: {}
    });
    
    // Simuler la mise à jour de la progression après avoir complété un module
    API.progress.completeModule.mockResolvedValue({
      totalPoints: 150,
      moduleResponses: {
        onboarding: {
          completedAt: new Date().toISOString()
        }
      },
      completedModules: {
        'module1': true
      }
    });
    
    render(<App />);
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByText(/Tableau de bord/i)).toBeInTheDocument();
    });
    
    // Simuler la sélection d'une île
    await act(async () => {
      const islandElement = screen.getByText(/Île de la Découverte/i);
      userEvent.click(islandElement);
    });
    
    // Simuler la complétion d'un module
    await act(async () => {
      const moduleElement = screen.getByText(/Module 1/i);
      userEvent.click(moduleElement);
      
      // Trouver et cliquer sur le bouton de complétion
      const completeButton = screen.getByText(/Terminer le module/i);
      userEvent.click(completeButton);
    });
    
    // Vérifier que la progression a été mise à jour
    expect(API.progress.completeModule).toHaveBeenCalledWith('module1', 'island1');
    
    // Vérifier que les points ont été mis à jour
    await waitFor(() => {
      expect(screen.queryByText(/150 points/i)).toBeInTheDocument();
    });
  });
});