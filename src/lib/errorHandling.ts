import toast from 'react-hot-toast';
import { isAuthRequiredError, getErrorMessage } from './api';
import { useLoginPromptStore } from './store';

// Single entry point for surfacing API errors to the user: routes
// auth-required failures to the login modal instead of a toast, and
// normalizes everything else through getErrorMessage.
export function handleApiError(error: any, fallback?: string) {
  if (isAuthRequiredError(error)) {
    useLoginPromptStore.getState().open();
    return;
  }
  toast.error(getErrorMessage(error, fallback));
}
