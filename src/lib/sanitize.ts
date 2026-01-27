/**
 * Sanitizes user input by removing potentially dangerous characters
 * and trimming whitespace
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

/**
 * Sanitizes description input specifically
 */
export function sanitizeDescription(description: string): string {
  return sanitizeInput(description);
}
