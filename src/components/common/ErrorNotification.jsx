import { useEffect, useState } from 'react';

const ErrorNotification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
      <p>{message}</p>
      <button
        className="absolute top-1 right-1 text-white"
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default ErrorNotification;