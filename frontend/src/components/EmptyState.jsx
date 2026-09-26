import Button from './Button';

const EmptyState = ({ icon, title, description, action, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 mb-6 max-w-md">{description}</p>
      {action && onAction && (
        <Button onClick={onAction}>{action}</Button>
      )}
    </div>
  );
};

export default EmptyState;
