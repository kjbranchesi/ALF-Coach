import { useEffect, useState } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = () => {
    setError(null);
  };

  const throwError = (err: Error) => {
    setError(err);
  };

  return { throwError, resetError };
}
