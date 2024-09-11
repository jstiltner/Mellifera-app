const Button = ({ onClick, children, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
