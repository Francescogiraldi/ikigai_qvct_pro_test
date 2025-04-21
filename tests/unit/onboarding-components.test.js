/**
 * Tests pour les composants d'onboarding
 * Ces tests vérifient les fonctionnalités des composants d'interface utilisateur d'onboarding
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { 
  AnimatedStar,
  StarRating,
  InteractiveCard,
  AnimatedButton,
  AnimatedCheckbox
} from '../../src/frontend/components/ui/onboarding';

// Mock de framer-motion pour éviter les problèmes de tests avec les animations
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      // Modify motion.div mock to accept animation props without passing them down
      div: React.forwardRef(({ children, whileHover, whileTap, initial, animate, transition, ...props }, ref) => <div ref={ref} {...props}>{children}</div>),
      span: React.forwardRef(({ children, ...props }, ref) => <span ref={ref} {...props}>{children}</span>),
      button: React.forwardRef(({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>),
      svg: React.forwardRef(({ children, ...props }, ref) => <svg ref={ref} {...props}>{children}</svg>),
      path: React.forwardRef(({ children, ...props }, ref) => <path ref={ref} {...props}>{children}</path>),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe('AnimatedStar Component', () => {
  test('renders correctly with default props', () => {
    render(<AnimatedStar />);
    expect(screen.getByText('☆')).toBeInTheDocument();
  });

  test('renders filled state correctly', () => {
    render(<AnimatedStar filled={true} />);
    expect(screen.getByText('☆')).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<AnimatedStar onClick={handleClick} />);
    fireEvent.click(screen.getByText('☆'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('AnimatedButton Component', () => {
  test('renders correctly with children', () => {
    render(<AnimatedButton>Click Me</AnimatedButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('renders with icon when provided', () => {
    render(<AnimatedButton icon="🔍">Search</AnimatedButton>);
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('applies disabled state correctly', () => {
    render(<AnimatedButton disabled={true}>Disabled Button</AnimatedButton>);
    expect(screen.getByText('Disabled Button')).toBeDisabled();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<AnimatedButton onClick={handleClick}>Clickable</AnimatedButton>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <AnimatedButton onClick={handleClick} disabled={true}>
        Disabled
      </AnimatedButton>
    );
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('AnimatedCheckbox Component', () => {
  test('renders correctly with label', () => {
    render(<AnimatedCheckbox label="Accept terms" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  test('calls onChange handler when clicked', () => {
    const handleChange = jest.fn();
    render(
      <AnimatedCheckbox
        label="Click me"
        checked={false}
        onChange={handleChange}
      />
    );
    fireEvent.click(screen.getByText('Click me'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('toggles checked state when clicked', () => {
    const handleChange = jest.fn();
    render(
      <AnimatedCheckbox
        label="Toggle me"
        checked={true}
        onChange={handleChange}
      />
    );
    fireEvent.click(screen.getByText('Toggle me'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});

describe('InteractiveCard Component', () => {
  test('renders correctly with children', () => {
    render(
      <InteractiveCard>
        <div>Card Content</div>
      </InteractiveCard>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  test('applies className prop correctly', () => {
    render(
      <InteractiveCard className="custom-class">
        <div>Custom Card</div>
      </InteractiveCard>
    );
    const cardElement = screen.getByText('Custom Card').closest('.onboarding-card');
    expect(cardElement).toHaveClass('custom-class');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(
      <InteractiveCard onClick={handleClick}>
        <div>Clickable Card</div>
      </InteractiveCard>
    );
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('StarRating Component', () => {
  test('renders correct number of stars', () => {
    render(<StarRating maxRating={3} />);
    // Chaque AnimatedStar affiche une étoile vide (☆)
    expect(screen.getAllByText('☆')).toHaveLength(3);
  });

  test('calls onChange handler when star is clicked', () => {
    const handleChange = jest.fn();
    render(<StarRating maxRating={5} onChange={handleChange} />);
    
    // Cliquer sur la première étoile
    fireEvent.click(screen.getAllByText('☆')[0]);
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});