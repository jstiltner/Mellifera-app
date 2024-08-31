import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const validateHiveName = (name: string): string | null => {
  const sanitizedName = sanitizeInput(name);
  if (sanitizedName.length < 3) {
    return 'Hive name must be at least 3 characters long';
  }
  if (sanitizedName.length > 50) {
    return 'Hive name must be no more than 50 characters long';
  }
  return null;
};

export const validateQueenId = (queenId: string): string | null => {
  const sanitizedQueenId = sanitizeInput(queenId);
  if (sanitizedQueenId.length === 0) {
    return null; // Allow empty queen ID
  }
  if (!/^[A-Za-z0-9-]+$/.test(sanitizedQueenId)) {
    return 'Queen ID must contain only letters, numbers, and hyphens';
  }
  return null;
};

export const validateStatus = (status: string): string | null => {
  const validStatuses = ['active', 'inactive', 'dead'];
  const sanitizedStatus = sanitizeInput(status).toLowerCase();
  if (!validStatuses.includes(sanitizedStatus)) {
    return 'Invalid status. Must be one of: active, inactive, or dead';
  }
  return null;
};

export const validateNotes = (notes: string): string | null => {
  const sanitizedNotes = sanitizeInput(notes);
  if (sanitizedNotes.length > 1000) {
    return 'Notes must be no more than 1000 characters long';
  }
  return null;
};
