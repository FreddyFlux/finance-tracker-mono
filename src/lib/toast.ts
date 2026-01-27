import { toast } from "sonner";

/**
 * Shows a success toast notification
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    className: "bg-green-500 text-white",
  });
}

/**
 * Shows an error toast notification
 */
export function showErrorToast(message: string, description?: string) {
  toast.error(message, {
    description,
  });
}
