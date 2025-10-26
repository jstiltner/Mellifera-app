// src/hooks/useKeyboardShortcuts.js
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * Global keyboard shortcuts hook
 * Provides keyboard navigation and actions throughout the app
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const handleKeyPress = useCallback(
    (event) => {
      // Check if user is typing in an input field
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName
      );

      // Don't trigger shortcuts while typing
      if (isTyping && !event.metaKey && !event.ctrlKey) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + K: Command palette (future feature)
      if (modKey && event.key === 'k') {
        event.preventDefault();
        console.log('Command palette (not yet implemented)');
        // TODO: Open command palette
      }

      // Cmd/Ctrl + /: Show keyboard shortcuts help
      if (modKey && event.key === '/') {
        event.preventDefault();
        console.log('Keyboard shortcuts help (not yet implemented)');
        // TODO: Show shortcuts modal
      }

      // Cmd/Ctrl + D: Toggle dark mode
      if (modKey && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
      }

      // Navigation shortcuts (only when not typing)
      if (!isTyping) {
        switch (event.key) {
          case 'h':
            if (!modKey) {
              event.preventDefault();
              navigate('/');
            }
            break;

          case 'a':
            if (!modKey) {
              event.preventDefault();
              navigate('/apiaries');
            }
            break;

          case 'i':
            if (!modKey) {
              event.preventDefault();
              navigate('/inspections');
            }
            break;

          case 't':
            if (!modKey) {
              event.preventDefault();
              navigate('/treatments');
            }
            break;

          case 's':
            if (!modKey) {
              event.preventDefault();
              navigate('/settings');
            }
            break;

          case '?':
            event.preventDefault();
            console.log('Help modal (not yet implemented)');
            // TODO: Show help modal
            break;

          default:
            break;
        }
      }

      // Escape key: Close modals, cancel actions
      if (event.key === 'Escape') {
        // Dispatch custom event that modals can listen to
        window.dispatchEvent(new CustomEvent('closeModal'));
      }
    },
    [navigate, toggleTheme]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

/**
 * Keyboard shortcuts configuration
 * Used for displaying help and documentation
 */
export const KEYBOARD_SHORTCUTS = {
  navigation: [
    { key: 'H', description: 'Go to Home/Dashboard' },
    { key: 'A', description: 'Go to Apiaries' },
    { key: 'I', description: 'Go to Inspections' },
    { key: 'T', description: 'Go to Treatments' },
    { key: 'S', description: 'Go to Settings' },
  ],
  actions: [
    { key: 'Cmd/Ctrl + K', description: 'Open command palette' },
    { key: 'Cmd/Ctrl + D', description: 'Toggle dark mode' },
    { key: 'Cmd/Ctrl + /', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Close modal/Cancel action' },
    { key: '?', description: 'Show help' },
  ],
};

export default useKeyboardShortcuts;