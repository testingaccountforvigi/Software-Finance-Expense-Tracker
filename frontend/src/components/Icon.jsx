// Reusable icon wrapper for consistent sizing and styling
const Icon = ({ icon: IconComponent, size = 20, strokeWidth = 1.8, className = '', ...props }) => {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
};

export default Icon;
