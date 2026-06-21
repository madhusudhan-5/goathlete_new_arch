import { createContext, useContext } from 'react';

export interface AuthContextValue {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
