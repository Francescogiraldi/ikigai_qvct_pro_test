/**
 * Tests pour l'API backend de l'application Ikigai
 * Ce fichier teste les fonctionnalités des services d'API (auth, progress, content)
 */

import API from '../../src/backend/api';
import AuthService from '../../src/backend/services/AuthService';
import StorageService from '../../src/backend/services/StorageService';
import ContentService from '../../src/backend/services/ContentService';

// Mock des services
jest.mock('../../src/backend/services/AuthService');
jest.mock('../../src/backend/services/StorageService');
jest.mock('../../src/backend/services/ContentService');

describe('API Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCurrentUser should call AuthService.getCurrentUser', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    AuthService.getCurrentUser.mockResolvedValue(mockUser);

    const result = await API.auth.getCurrentUser();
    
    expect(AuthService.getCurrentUser).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  test('signUp should call AuthService.signUp with correct parameters', async () => {
    const mockResponse = { success: true, user: { email: 'test@example.com' } };
    AuthService.signUp.mockResolvedValue(mockResponse);

    const result = await API.auth.signUp('test@example.com', 'password123');
    
    expect(AuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result).toEqual(mockResponse);
  });

  test('signIn should call AuthService.signIn with correct parameters', async () => {
    const mockResponse = { success: true, user: { email: 'test@example.com' } };
    AuthService.signIn.mockResolvedValue(mockResponse);

    const result = await API.auth.signIn('test@example.com', 'password123');
    
    expect(AuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result).toEqual(mockResponse);
  });

  test('signInWithGoogle should call AuthService.signInWithGoogle', async () => {
    const mockResponse = { success: true, message: 'Redirection vers Google...' };
    AuthService.signInWithGoogle.mockResolvedValue(mockResponse);

    const result = await API.auth.signInWithGoogle();
    
    expect(AuthService.signInWithGoogle).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  test('signOut should call AuthService.signOut', async () => {
    const mockResponse = { success: true, message: 'Déconnexion réussie!' };
    AuthService.signOut.mockResolvedValue(mockResponse);

    const result = await API.auth.signOut();
    
    expect(AuthService.signOut).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  test('isAuthenticated should call AuthService.isAuthenticated', async () => {
    AuthService.isAuthenticated.mockResolvedValue(true);

    const result = await API.auth.isAuthenticated();
    
    expect(AuthService.isAuthenticated).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

describe('API Progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getProgress should call StorageService.getProgress', async () => {
    const mockProgress = { totalPoints: 100, completedModules: { 'module1': true } };
    StorageService.getProgress.mockResolvedValue(mockProgress);

    const result = await API.progress.getProgress();
    
    expect(StorageService.getProgress).toHaveBeenCalled();
    expect(result).toEqual(mockProgress);
  });

  test('saveProgress should call StorageService.saveProgress with correct parameters', async () => {
    const mockProgress = { totalPoints: 150, completedModules: { 'module1': true } };
    StorageService.saveProgress.mockResolvedValue(mockProgress);

    const result = await API.progress.saveProgress(mockProgress);
    
    expect(StorageService.saveProgress).toHaveBeenCalledWith(mockProgress);
    expect(result).toEqual(mockProgress);
  });

  test('completeModule should call StorageService.completeModule with correct parameters', async () => {
    const mockProgress = { totalPoints: 150, completedModules: { 'module1': true } };
    StorageService.completeModule.mockResolvedValue(mockProgress);

    const result = await API.progress.completeModule('module1', 'island1');
    
    expect(StorageService.completeModule).toHaveBeenCalledWith('module1', 'island1');
    expect(result).toEqual(mockProgress);
  });

  test('completeChallenge should call StorageService.completeChallenge with correct parameters', async () => {
    const mockProgress = { totalPoints: 150, completedChallenges: ['challenge1'] };
    StorageService.completeChallenge.mockResolvedValue(mockProgress);

    const result = await API.progress.completeChallenge('challenge1');
    
    expect(StorageService.completeChallenge).toHaveBeenCalledWith('challenge1');
    expect(result).toEqual(mockProgress);
  });

  test('saveModuleResponses should call StorageService.saveModuleResponses with correct parameters', async () => {
    const mockResponses = { question1: 'answer1', question2: 'answer2' };
    const mockProgress = { 
      totalPoints: 150, 
      moduleResponses: { 'module1': mockResponses } 
    };
    StorageService.saveModuleResponses.mockResolvedValue(mockProgress);

    const result = await API.progress.saveModuleResponses('module1', mockResponses);
    
    expect(StorageService.saveModuleResponses).toHaveBeenCalledWith('module1', mockResponses);
    expect(result).toEqual(mockProgress);
  });

  test('resetAllData should call StorageService.resetAllData', () => {
    const mockInitialProgress = { totalPoints: 0, completedModules: {} };
    StorageService.resetAllData.mockReturnValue(mockInitialProgress);

    const result = API.progress.resetAllData();
    
    expect(StorageService.resetAllData).toHaveBeenCalled();
    expect(result).toEqual(mockInitialProgress);
  });
});

describe('API Content', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllIslands should call ContentService.getAllIslands', () => {
    const mockIslands = [{ id: 'island1' }, { id: 'island2' }];
    ContentService.getAllIslands.mockReturnValue(mockIslands);

    const result = API.content.getAllIslands();
    
    expect(ContentService.getAllIslands).toHaveBeenCalled();
    expect(result).toEqual(mockIslands);
  });

  test('getIslandById should call ContentService.getIslandById with correct parameter', () => {
    const mockIsland = { id: 'island1', name: 'Île de la Découverte' };
    ContentService.getIslandById.mockReturnValue(mockIsland);

    const result = API.content.getIslandById('island1');
    
    expect(ContentService.getIslandById).toHaveBeenCalledWith('island1');
    expect(result).toEqual(mockIsland);
  });

  test('getAllModules should call ContentService.getAllModules', () => {
    const mockModules = [{ id: 'module1' }, { id: 'module2' }];
    ContentService.getAllModules.mockReturnValue(mockModules);

    const result = API.content.getAllModules();
    
    expect(ContentService.getAllModules).toHaveBeenCalled();
    expect(result).toEqual(mockModules);
  });

  test('getModulesByIslandId should call ContentService.getModulesByIslandId with correct parameter', () => {
    const mockModules = [{ id: 'module1', islandId: 'island1' }, { id: 'module2', islandId: 'island1' }];
    ContentService.getModulesByIslandId.mockReturnValue(mockModules);

    const result = API.content.getModulesByIslandId('island1');
    
    expect(ContentService.getModulesByIslandId).toHaveBeenCalledWith('island1');
    expect(result).toEqual(mockModules);
  });

  test('getModuleById should call ContentService.getModuleById with correct parameter', () => {
    const mockModule = { id: 'module1', name: 'Module 1' };
    ContentService.getModuleById.mockReturnValue(mockModule);

    const result = API.content.getModuleById('module1');
    
    expect(ContentService.getModuleById).toHaveBeenCalledWith('module1');
    expect(result).toEqual(mockModule);
  });

  test('getAllChallenges should call ContentService.getAllChallenges', () => {
    const mockChallenges = [{ id: 'challenge1' }, { id: 'challenge2' }];
    ContentService.getAllChallenges.mockReturnValue(mockChallenges);

    const result = API.content.getAllChallenges();
    
    expect(ContentService.getAllChallenges).toHaveBeenCalled();
    expect(result).toEqual(mockChallenges);
  });

  test('getAllExercises should call ContentService.getAllExercises', () => {
    const mockExercises = [{ id: 'exercise1' }, { id: 'exercise2' }];
    ContentService.getAllExercises.mockReturnValue(mockExercises);

    const result = API.content.getAllExercises();
    
    expect(ContentService.getAllExercises).toHaveBeenCalled();
    expect(result).toEqual(mockExercises);
  });

  test('getRecommendedContent should call ContentService.getRecommendedContent with correct parameter', () => {
    const mockUserProgress = { totalPoints: 100 };
    const mockRecommendedContent = {
      modules: [{ id: 'module1' }],
      challenges: [{ id: 'challenge1' }]
    };
    ContentService.getRecommendedContent.mockReturnValue(mockRecommendedContent);

    const result = API.content.getRecommendedContent(mockUserProgress);
    
    expect(ContentService.getRecommendedContent).toHaveBeenCalledWith(mockUserProgress);
    expect(result).toEqual(mockRecommendedContent);
  });
});