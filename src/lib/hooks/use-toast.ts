import { toast } from 'sonner';

/**
 * Compatibility hook for components that previously used useToast().
 * Maps to sonner's toast API.
 */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
    toast,
  };
}

export default useToast;
