import React, {
  useMemo,
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';

const ViewPortContext = createContext({ vw: 0, vh: 0 });

export const ViewportProvider = ({ children }: { children: any }) => {
  const initVp = useMemo(() => {
    const { clientWidth, clientHeight } = document.documentElement;
    return {
      vw: clientWidth,
      vh: clientHeight,
    };
  }, []);

  const [viewPort, setViewPort] = useState(initVp);

  useEffect(() => {
    const onResize = () => {
      const d = document.documentElement;
      const vw = d.clientWidth;
      const vh = d.clientHeight;
      setViewPort({
        vw,
        vh,
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [viewPort]);

  return (
    <ViewPortContext.Provider value={viewPort}>
      {children}
    </ViewPortContext.Provider>
  );
};

export const useViewPort = () => useContext(ViewPortContext);
