/**
 * @chunk 7.26 - ViewSync
 * Hook to sync zoom/pan state between two viewers in comparison mode.
 * When syncEnabled is true, changes to one viewer are propagated to the other.
 */
import { useState, useCallback } from 'react';

interface ViewState {
  scale: number;
  position: { x: number; y: number };
}

export function useViewSync(syncEnabled: boolean) {
  const [leftView, setLeftView] = useState<ViewState>({ scale: 1, position: { x: 0, y: 0 } });
  const [rightView, setRightView] = useState<ViewState>({ scale: 1, position: { x: 0, y: 0 } });

  const setLeftScale = useCallback((scale: number) => {
    setLeftView(prev => ({ ...prev, scale }));
    if (syncEnabled) {
      setRightView(prev => ({ ...prev, scale }));
    }
  }, [syncEnabled]);

  const setLeftPosition = useCallback((position: { x: number; y: number }) => {
    setLeftView(prev => ({ ...prev, position }));
    if (syncEnabled) {
      setRightView(prev => ({ ...prev, position }));
    }
  }, [syncEnabled]);

  const setRightScale = useCallback((scale: number) => {
    setRightView(prev => ({ ...prev, scale }));
    if (syncEnabled) {
      setLeftView(prev => ({ ...prev, scale }));
    }
  }, [syncEnabled]);

  const setRightPosition = useCallback((position: { x: number; y: number }) => {
    setRightView(prev => ({ ...prev, position }));
    if (syncEnabled) {
      setLeftView(prev => ({ ...prev, position }));
    }
  }, [syncEnabled]);

  return {
    leftView,
    rightView,
    setLeftScale,
    setLeftPosition,
    setRightScale,
    setRightPosition,
  };
}
