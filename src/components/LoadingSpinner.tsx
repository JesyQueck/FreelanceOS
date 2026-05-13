interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  className = '', 
  showText = false,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'loading-jumping-boxes-small',
    medium: 'loading-jumping-boxes',
    large: 'loading-jumping-boxes-large'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={sizeClasses[size]}>
        <div className="jumping-box"></div>
        <div className="jumping-box"></div>
        <div className="jumping-box"></div>
        <div className="jumping-box"></div>
      </div>
      {showText && (
        <div className={`text-[var(--color-text-secondary)] ${textSizes[size]}`}>
          {text}
        </div>
      )}
    </div>
  );
}
