const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '', ...props }) => {
  const baseClasses = 'font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
