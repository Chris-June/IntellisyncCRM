import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import type { AuthContextType } from '@/types/auth-types';

export { AuthContext };

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
