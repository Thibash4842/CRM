import { useEffect, useCallback } from 'react';

export const useKeyboardShortcut = (keys, callback) => {
  const handleKeyPress = useCallback(
    (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;
      
      const keyMatch = keys.some(keyCombo => {
        const parts = keyCombo.toLowerCase().split('+');
        const requiresModifier = parts.includes('ctrl') || parts.includes('cmd');
        const targetKey = parts[parts.length - 1];
        
        if (requiresModifier && !modifierKey) return false;
        if (!requiresModifier && modifierKey) return false;
        
        return event.key.toLowerCase() === targetKey;
      });

      if (keyMatch) {
        event.preventDefault();
        callback();
      }
    },
    [keys, callback]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};
