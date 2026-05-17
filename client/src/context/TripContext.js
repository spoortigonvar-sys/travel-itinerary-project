import { createContext, useContext, useState, useCallback } from 'react';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'default') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <TripContext.Provider value={{ activeTrip, setActiveTrip, toasts, showToast }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTripContext = () => useContext(TripContext);
