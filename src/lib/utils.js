import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Used by shadcn/ui components for dynamic styling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}