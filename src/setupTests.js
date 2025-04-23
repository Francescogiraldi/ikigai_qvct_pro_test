// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Set dummy Supabase environment variables for tests
process.env.REACT_APP_SUPABASE_URL = 'http://localhost:54321';
process.env.REACT_APP_SUPABASE_ANON_KEY = 'dummy-anon-key';

// Polyfill for Element.animate (not available in JSDOM)
if (typeof Element.prototype.animate !== 'function') {
  Element.prototype.animate = function(keyframes, options) {
    // Mock implementation: returns a basic Animation object
    // You might need a more sophisticated mock depending on your tests
    return {
      play: () => {},
      pause: () => {},
      cancel: () => {},
      finish: () => { if (this.onfinish) this.onfinish(); },
      reverse: () => {},
      updatePlaybackRate: () => {},
      persist: () => {},
      commitStyles: () => {},
      onfinish: null,
      oncancel: null,
      // Add other properties/methods as needed by your tests
    };
  };
}
