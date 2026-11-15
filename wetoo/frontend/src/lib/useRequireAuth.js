import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Renvoie une fonction `requireAuth(action)`.
 * Si l'utilisateur est connecté, l'action est exécutée.
 * Sinon, on affiche un message et on propose la connexion, en mémorisant la page.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  return useCallback(
    (action) => {
      if (isAuthenticated) return action?.();
      toast.info('Crée ton compte gratuit pour participer.', {
        duration: 6000,
        action: {
          label: 'Se connecter',
          onClick: () => navigate(`/connexion?next=${encodeURIComponent(location.pathname)}`),
        },
      });
      return undefined;
    },
    [isAuthenticated, navigate, location.pathname, toast]
  );
}
