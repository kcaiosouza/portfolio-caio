import { useState, useCallback, useRef, useEffect } from 'react';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const WINAMP_WIDTH = 275;
export const WINAMP_MAIN_HEIGHT = 116;
export const WINAMP_EQ_HEIGHT = 116;
export const WINAMP_PL_HEIGHT = 232;
export const WINAMP_SHADE_HEIGHT = 14;

/**
 * Calculates magnetic snap between a moving window and a target window.
 * Supports snapping below, above, to the right, or to the left of the target window.
 */
export function calculateMagneticSnap(
  moving: WindowRect,
  target: WindowRect,
  threshold: number = 18
): { snapped: boolean; x: number; y: number } {
  // 1. Snap directly underneath target (moving top edge snaps to target bottom edge)
  const targetBottom = target.y + target.height;
  if (
    Math.abs(moving.y - targetBottom) <= threshold &&
    Math.abs(moving.x - target.x) <= threshold * 2
  ) {
    return {
      snapped: true,
      x: target.x,
      y: targetBottom,
    };
  }

  // 2. Snap directly above target (moving bottom edge snaps to target top edge)
  const targetTop = target.y;
  if (
    Math.abs(moving.y + moving.height - targetTop) <= threshold &&
    Math.abs(moving.x - target.x) <= threshold * 2
  ) {
    return {
      snapped: true,
      x: target.x,
      y: targetTop - moving.height,
    };
  }

  // 3. Snap directly to the right of target (moving left edge snaps to target right edge)
  const targetRight = target.x + target.width;
  if (
    Math.abs(moving.x - targetRight) <= threshold &&
    Math.abs(moving.y - target.y) <= threshold * 2
  ) {
    return {
      snapped: true,
      x: targetRight,
      y: target.y,
    };
  }

  // 4. Snap directly to the left of target (moving right edge snaps to target left edge)
  const targetLeft = target.x;
  if (
    Math.abs(moving.x + moving.width - targetLeft) <= threshold &&
    Math.abs(moving.y - target.y) <= threshold * 2
  ) {
    return {
      snapped: true,
      x: targetLeft - moving.width,
      y: target.y,
    };
  }

  return {
    snapped: false,
    x: moving.x,
    y: moving.y,
  };
}

export interface UseWinampDockingReturn {
  mainPos: WindowRect;
  setMainPos: React.Dispatch<React.SetStateAction<WindowRect>>;
  eqPos: WindowRect;
  setEqPos: React.Dispatch<React.SetStateAction<WindowRect>>;
  plPos: WindowRect;
  setPlPos: React.Dispatch<React.SetStateAction<WindowRect>>;
  isEqDocked: boolean;
  setIsEqDocked: React.Dispatch<React.SetStateAction<boolean>>;
  isPlDocked: boolean;
  setIsPlDocked: React.Dispatch<React.SetStateAction<boolean>>;
  isMainShade: boolean;
  setIsMainShade: React.Dispatch<React.SetStateAction<boolean>>;
  isEqShade: boolean;
  setIsEqShade: React.Dispatch<React.SetStateAction<boolean>>;
  isPlShade: boolean;
  setIsPlShade: React.Dispatch<React.SetStateAction<boolean>>;
  moveMain: (dx: number, dy: number) => void;
  handleDragMain: (newPos: { x: number; y: number }) => void;
  handleDragEq: (
    newPos: { x: number; y: number; width?: number; height?: number },
    threshold?: number
  ) => { snapped: boolean; x: number; y: number };
  handleDragPl: (
    newPos: { x: number; y: number; width?: number; height?: number },
    threshold?: number
  ) => { snapped: boolean; x: number; y: number };
  toggleMainShade: () => void;
  toggleEqShade: () => void;
  togglePlShade: () => void;
}

export function useWinampDocking(
  initialMainPos?: Partial<WindowRect>
): UseWinampDockingReturn {
  const initialMain: WindowRect = {
    x: initialMainPos?.x ?? 320,
    y: initialMainPos?.y ?? 80,
    width: initialMainPos?.width ?? WINAMP_WIDTH,
    height: initialMainPos?.height ?? WINAMP_MAIN_HEIGHT,
  };

  const [mainPos, setMainPos] = useState<WindowRect>(initialMain);
  const [eqPos, setEqPos] = useState<WindowRect>({
    x: initialMain.x,
    y: initialMain.y + initialMain.height,
    width: WINAMP_WIDTH,
    height: WINAMP_EQ_HEIGHT,
  });
  const [plPos, setPlPos] = useState<WindowRect>({
    x: initialMain.x,
    y: initialMain.y + initialMain.height + WINAMP_EQ_HEIGHT,
    width: WINAMP_WIDTH,
    height: WINAMP_PL_HEIGHT,
  });

  const [isEqDocked, setIsEqDocked] = useState(true);
  const [isPlDocked, setIsPlDocked] = useState(true);

  const [isMainShade, setIsMainShade] = useState(false);
  const [isEqShade, setIsEqShade] = useState(false);
  const [isPlShade, setIsPlShade] = useState(false);

  // Keep references to access the most recent state in callbacks without recreating them
  const isEqDockedRef = useRef(isEqDocked);
  const isPlDockedRef = useRef(isPlDocked);
  const mainPosRef = useRef(mainPos);
  const eqPosRef = useRef(eqPos);
  const plPosRef = useRef(plPos);

  useEffect(() => {
    isEqDockedRef.current = isEqDocked;
  }, [isEqDocked]);

  useEffect(() => {
    isPlDockedRef.current = isPlDocked;
  }, [isPlDocked]);

  useEffect(() => {
    mainPosRef.current = mainPos;
  }, [mainPos]);

  useEffect(() => {
    eqPosRef.current = eqPos;
  }, [eqPos]);

  useEffect(() => {
    plPosRef.current = plPos;
  }, [plPos]);

  /**
   * Translates the main player and all currently docked windows together by (dx, dy).
   */
  const moveMain = useCallback((dx: number, dy: number) => {
    setMainPos(prev => {
      const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
      mainPosRef.current = next;
      return next;
    });

    if (isEqDockedRef.current) {
      setEqPos(prev => {
        const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
        eqPosRef.current = next;
        return next;
      });
    }

    if (isPlDockedRef.current) {
      setPlPos(prev => {
        const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
        plPosRef.current = next;
        return next;
      });
    }
  }, []);

  /**
   * Moves main player to target coordinates and shifts docked windows along.
   */
  const handleDragMain = useCallback((newPos: { x: number; y: number }) => {
    const current = mainPosRef.current;
    const dx = newPos.x - current.x;
    const dy = newPos.y - current.y;
    moveMain(dx, dy);
  }, [moveMain]);

  /**
   * Handles dragging the Equalizer window. Tests for magnetic snapping against
   * target windows (Main or Playlist) and updates docking status.
   */
  const handleDragEq = useCallback(
    (
      newPos: { x: number; y: number; width?: number; height?: number },
      threshold: number = 18
    ) => {
      const candidate: WindowRect = {
        ...eqPosRef.current,
        ...newPos,
      };

      // Test snap against main window
      const snapMain = calculateMagneticSnap(candidate, mainPosRef.current, threshold);
      if (snapMain.snapped) {
        setIsEqDocked(true);
        isEqDockedRef.current = true;
        const nextPos: WindowRect = { ...candidate, x: snapMain.x, y: snapMain.y };
        setEqPos(nextPos);
        eqPosRef.current = nextPos;
        return snapMain;
      }

      // Test snap against playlist window
      const snapPl = calculateMagneticSnap(candidate, plPosRef.current, threshold);
      if (snapPl.snapped) {
        setIsEqDocked(true);
        isEqDockedRef.current = true;
        const nextPos: WindowRect = { ...candidate, x: snapPl.x, y: snapPl.y };
        setEqPos(nextPos);
        eqPosRef.current = nextPos;
        return snapPl;
      }

      // Not snapped -> undock
      setIsEqDocked(false);
      isEqDockedRef.current = false;
      const nextPos: WindowRect = { ...candidate, x: newPos.x, y: newPos.y };
      setEqPos(nextPos);
      eqPosRef.current = nextPos;
      return { snapped: false, x: newPos.x, y: newPos.y };
    },
    []
  );

  /**
   * Handles dragging the Playlist window. Tests for magnetic snapping against
   * target windows (Equalizer or Main) and updates docking status.
   */
  const handleDragPl = useCallback(
    (
      newPos: { x: number; y: number; width?: number; height?: number },
      threshold: number = 18
    ) => {
      const candidate: WindowRect = {
        ...plPosRef.current,
        ...newPos,
      };

      // Test snap against Equalizer
      const snapEq = calculateMagneticSnap(candidate, eqPosRef.current, threshold);
      if (snapEq.snapped) {
        setIsPlDocked(true);
        isPlDockedRef.current = true;
        const nextPos: WindowRect = { ...candidate, x: snapEq.x, y: snapEq.y };
        setPlPos(nextPos);
        plPosRef.current = nextPos;
        return snapEq;
      }

      // Test snap against Main window
      const snapMain = calculateMagneticSnap(candidate, mainPosRef.current, threshold);
      if (snapMain.snapped) {
        setIsPlDocked(true);
        isPlDockedRef.current = true;
        const nextPos: WindowRect = { ...candidate, x: snapMain.x, y: snapMain.y };
        setPlPos(nextPos);
        plPosRef.current = nextPos;
        return snapMain;
      }

      // Not snapped -> undock
      setIsPlDocked(false);
      isPlDockedRef.current = false;
      const nextPos: WindowRect = { ...candidate, x: newPos.x, y: newPos.y };
      setPlPos(nextPos);
      plPosRef.current = nextPos;
      return { snapped: false, x: newPos.x, y: newPos.y };
    },
    []
  );

  /**
   * Toggles Main window rollup (windowshade) mode.
   * Adjusts height to 14px (or back to 116px) and shifts docked windows.
   */
  const toggleMainShade = useCallback(() => {
    setIsMainShade(prevShade => {
      const nextShade = !prevShade;
      const newHeight = nextShade ? WINAMP_SHADE_HEIGHT : WINAMP_MAIN_HEIGHT;
      setMainPos(prevMain => {
        const diffY = newHeight - prevMain.height;
        if (isEqDockedRef.current) {
          setEqPos(prevEq => {
            const nextEq = { ...prevEq, y: prevEq.y + diffY };
            eqPosRef.current = nextEq;
            return nextEq;
          });
        }
        if (isPlDockedRef.current) {
          setPlPos(prevPl => {
            const nextPl = { ...prevPl, y: prevPl.y + diffY };
            plPosRef.current = nextPl;
            return nextPl;
          });
        }
        const nextMain = { ...prevMain, height: newHeight };
        mainPosRef.current = nextMain;
        return nextMain;
      });
      return nextShade;
    });
  }, []);

  /**
   * Toggles Equalizer window rollup mode.
   */
  const toggleEqShade = useCallback(() => {
    setIsEqShade(prevShade => {
      const nextShade = !prevShade;
      const newHeight = nextShade ? WINAMP_SHADE_HEIGHT : WINAMP_EQ_HEIGHT;
      setEqPos(prevEq => {
        const diffY = newHeight - prevEq.height;
        if (isPlDockedRef.current) {
          setPlPos(prevPl => {
            const nextPl = { ...prevPl, y: prevPl.y + diffY };
            plPosRef.current = nextPl;
            return nextPl;
          });
        }
        const nextEq = { ...prevEq, height: newHeight };
        eqPosRef.current = nextEq;
        return nextEq;
      });
      return nextShade;
    });
  }, []);

  /**
   * Toggles Playlist window rollup mode.
   */
  const togglePlShade = useCallback(() => {
    setIsPlShade(prevShade => {
      const nextShade = !prevShade;
      const newHeight = nextShade ? WINAMP_SHADE_HEIGHT : WINAMP_PL_HEIGHT;
      setPlPos(prevPl => {
        const nextPl = { ...prevPl, height: newHeight };
        plPosRef.current = nextPl;
        return nextPl;
      });
      return nextShade;
    });
  }, []);

  return {
    mainPos,
    setMainPos,
    eqPos,
    setEqPos,
    plPos,
    setPlPos,
    isEqDocked,
    setIsEqDocked,
    isPlDocked,
    setIsPlDocked,
    isMainShade,
    setIsMainShade,
    isEqShade,
    setIsEqShade,
    isPlShade,
    setIsPlShade,
    moveMain,
    handleDragMain,
    handleDragEq,
    handleDragPl,
    toggleMainShade,
    toggleEqShade,
    togglePlShade,
  };
}
