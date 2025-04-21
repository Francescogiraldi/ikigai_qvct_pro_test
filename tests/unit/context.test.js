/**
 * Tests pour les contextes React de l'application Ikigai
 * Ce fichier teste les fonctionnalités des contextes AuthContext, ProgressContext et ContentContext
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, ProgressProvider, ContentProvider, AppProvider, useAuth, useProgress, useContent } from '../../src/frontend/context'; // Corrected path
import API from '../../src/backend/api'; // Corrected path

// Mock des services API
jest.mock('../../src/backend/api', () => ({ // Corrected path
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
    getAllIslands: jest.fn(),
    getAllModules: jest.fn(),
    getAllChallenges: jest.fn(),
    getAllExercises: jest.fn()
  }
}));

// Composant de test pour AuthContext
const AuthTestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button data-testid="login-button" onClick={() => signIn('test@example.com', 'password')}>Login</button>
      <button data-testid="logout-button" onClick={() => signOut()}>Logout</button>
    </div>
  );
};

// Composant de test pour ProgressContext
const ProgressTestComponent = () => {
  const { progress, loading, completeModule, resetProgress } = useProgress();
  return (
    <div>
      <div data-testid="progress-status">{loading ? 'Loading...' : 'Progress loaded'}</div>
      <div data-testid="total-points">{progress?.totalPoints || 0}</div>
      <button data-testid="complete-module-button" onClick={() => completeModule('module1', 'island1')}>Complete Module</button>
      <button data-testid="reset-button" onClick={() => resetProgress()}>Reset Progress</button>
    </div>
  );
};

// Composant de test pour ContentContext
const ContentTestComponent = () => {
  const { islands, modules, challenges, exercises, loading } = useContent();
  return (
    <div>
      <div data-testid="content-status">{loading ? 'Loading...' : 'Content loaded'}</div>
      <div data-testid="islands-count">{islands?.length || 0}</div>
      <div data-testid="modules-count">{modules?.length || 0}</div>
      <div data-testid="challenges-count">{challenges?.length || 0}</div>
      <div data-testid="exercises-count">{exercises?.length || 0}</div>
    </div>
  );
};

// Tests pour AuthContext
describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading state and then not authenticated initially', async () => {
    API.auth.getCurrentUser.mockResolvedValue(null);
    
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('Loading...');
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
  });

  test('should authenticate user on login', async () => {
    const mockUser = { email: 'test@example.com' };
    API.auth.signIn.mockResolvedValue({ success: true, user: mockUser });
    
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });

    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
    });
  });

  test('should logout user', async () => {
    const mockUser = { email: 'test@example.com' };
    API.auth.getCurrentUser.mockResolvedValue(mockUser);
    API.auth.signOut.mockResolvedValue({ success: true });
    
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    await act(async () => {
      userEvent.click(screen.getByTestId('logout-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
  });
});

// Tests pour ProgressContext
describe('ProgressContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load user progress', async () => {
    const mockProgress = { totalPoints: 100, completedModules: { 'module1': true } };
    API.progress.getProgress.mockResolvedValue(mockProgress);
    
    render(
      <ProgressProvider>
        <ProgressTestComponent />
      </ProgressProvider>
    );

    expect(screen.getByTestId('progress-status').textContent).toBe('Loading...');
    
    await waitFor(() => {
      expect(screen.getByTestId('progress-status').textContent).toBe('Progress loaded');
      expect(screen.getByTestId('total-points').textContent).toBe('100');
    });
  });

  test('should complete a module and update progress', async () => {
    const initialProgress = { totalPoints: 100 };
    const updatedProgress = { totalPoints: 150, completedModules: { 'module1': true } };
    
    API.progress.getProgress.mockResolvedValue(initialProgress);
    API.progress.completeModule.mockResolvedValue(updatedProgress);
    
    render(
      <ProgressProvider>
        <ProgressTestComponent />
      </ProgressProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-points').textContent).toBe('100');
    });

    await act(async () => {
      userEvent.click(screen.getByTestId('complete-module-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('total-points').textContent).toBe('150');
    });
    
    expect(API.progress.completeModule).toHaveBeenCalledWith('module1', 'island1');
  });

  test('should reset progress', async () => {
    const initialProgress = { totalPoints: 100 };
    const resetProgress = { totalPoints: 0 };
    
    API.progress.getProgress.mockResolvedValue(initialProgress);
    API.progress.resetAllData.mockReturnValue(resetProgress);
    
    render(
      <ProgressProvider>
        <ProgressTestComponent />
      </ProgressProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-points').textContent).toBe('100');
    });

    await act(async () => {
      userEvent.click(screen.getByTestId('reset-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('total-points').textContent).toBe('0');
    });
  });
});

// Tests pour ContentContext
describe('ContentContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load content data', async () => {
    // Use mockResolvedValue for async simulation
    API.content.getAllIslands.mockResolvedValue([{ id: 'island1' }, { id: 'island2' }]);
    API.content.getAllModules.mockResolvedValue([{ id: 'module1' }, { id: 'module2' }, { id: 'module3' }]);
    API.content.getAllChallenges.mockResolvedValue([{ id: 'challenge1' }, { id: 'challenge2' }]);
    API.content.getAllExercises.mockResolvedValue([{ id: 'exercise1' }]);
    
    render(
      <ContentProvider>
        <ContentTestComponent />
      </ContentProvider>
    );

    expect(screen.getByTestId('content-status').textContent).toBe('Loading...');
    
    await waitFor(() => {
      expect(screen.getByTestId('content-status').textContent).toBe('Content loaded');
      expect(screen.getByTestId('islands-count').textContent).toBe('2');
      expect(screen.getByTestId('modules-count').textContent).toBe('3');
      expect(screen.getByTestId('challenges-count').textContent).toBe('2');
      expect(screen.getByTestId('exercises-count').textContent).toBe('1');
    });
  });
});

// Test pour AppProvider (intégration de tous les contextes)
describe('AppProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should provide all contexts correctly', async () => {
    // Mock des données pour tous les contextes
    const mockUser = { email: 'test@example.com' };
    const mockProgress = { totalPoints: 100 };
    
    API.auth.getCurrentUser.mockResolvedValue(mockUser);
    API.progress.getProgress.mockResolvedValue(mockProgress);
    API.content.getAllIslands.mockReturnValue([{ id: 'island1' }, { id: 'island2' }]);
    API.content.getAllModules.mockReturnValue([{ id: 'module1' }, { id: 'module2' }]);
    API.content.getAllChallenges.mockReturnValue([{ id: 'challenge1' }]);
    API.content.getAllExercises.mockReturnValue([{ id: 'exercise1' }]);
    
    const TestComponent = () => {
      const auth = useAuth();
      const progress = useProgress();
      const content = useContent();
      
      return (
        <div>
          <div data-testid="auth-user">{auth.user?.email || 'No user'}</div>
          <div data-testid="progress-points">{progress.progress?.totalPoints || 0}</div>
          <div data-testid="islands-total">{content.islands?.length || 0}</div>
        </div>
      );
    };
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-user').textContent).toBe('test@example.com');
      expect(screen.getByTestId('progress-points').textContent).toBe('100');
      expect(screen.getByTestId('islands-total').textContent).toBe('2');
    });
  });
});