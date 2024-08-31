import { toast } from 'react-toastify';

export const handleQueryError = (error) => {
  console.error('Query error:', error);
  toast.error(`An error occurred: ${error.message}`);
};

export const handleMutationError = (error) => {
  console.error('Mutation error:', error);
  toast.error(`An error occurred: ${error.message}`);
};

export const globalQueryErrorHandler = (error) => {
  console.error('Global query error:', error);
  toast.error(`A global error occurred: ${error.message}`);
};

export const globalMutationErrorHandler = (error) => {
  console.error('Global mutation error:', error);
  toast.error(`A global error occurred: ${error.message}`);
};