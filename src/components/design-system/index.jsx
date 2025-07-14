import React from 'react';
import { designTokens } from './designTokens';

/**
 * Button Component - Professional, accessible buttons
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm hover:shadow-md'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const fullWidthClass = fullWidth ? 'w-full' : '';
  
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${fullWidthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

/**
 * Card Component - Professional container with consistent styling
 */
export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    outlined: 'border-2',
    ghost: 'border-transparent bg-transparent'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5' : '';
  
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Typography Component - Consistent text styling
 */
export const Typography = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  className = '',
  as: Component = 'p',
  ...props
}) => {
  const variantClasses = {
    h1: 'text-3xl font-bold leading-tight',
    h2: 'text-2xl font-bold leading-tight',
    h3: 'text-xl font-semibold leading-tight',
    h4: 'text-lg font-semibold leading-tight',
    subtitle1: 'text-lg font-medium leading-normal',
    subtitle2: 'text-base font-medium leading-normal',
    body: 'text-base font-normal leading-normal',
    caption: 'text-sm font-medium leading-normal',
    small: 'text-xs font-normal leading-normal'
  };
  
  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };
  
  const typographyClasses = `
    ${variantClasses[variant]}
    ${colorClasses[color]}
    ${alignClasses[align]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Component className={typographyClasses} {...props}>
      {children}
    </Component>
  );
};

/**
 * Badge Component - Status indicators and labels
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

/**
 * LoadingSpinner Component - Consistent loading states
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const colorClasses = {
    primary: 'text-primary-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };
  
  const spinnerClasses = `
    animate-spin rounded-full border-2 border-current border-t-transparent
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={spinnerClasses} {...props} />
  );
};

/**
 * MetricCard Component - Enhanced version for health data
 */
export const MetricCard = ({
  title,
  value,
  unit,
  trend,
  riskLevel = 'low',
  isLoading = false,
  size = 'md',
  icon,
  description,
  className = '',
  ...props
}) => {
  const riskColors = {
    low: 'border-green-200 bg-green-50 text-green-800',
    medium: 'border-amber-200 bg-amber-50 text-amber-800',
    high: 'border-red-200 bg-red-50 text-red-800',
    critical: 'border-red-300 bg-red-100 text-red-900'
  };
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${sizeClasses[size]} ${className}`}>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md border-l-4 ${riskColors[riskLevel]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <span className="text-current">{icon}</span>}
            <Typography variant="caption" color="secondary" className="font-medium">
              {title}
            </Typography>
          </div>
          {trend && (
            <div className={`text-sm ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-1">
          <Typography variant="h3" className="font-bold text-current">
            {value}
          </Typography>
          {unit && (
            <Typography variant="caption" color="muted">
              {unit}
            </Typography>
          )}
        </div>
        
        {description && (
          <Typography variant="small" color="secondary">
            {description}
          </Typography>
        )}
      </div>
    </Card>
  );
};

export default {
  Button,
  Card,
  Typography,
  Badge,
  LoadingSpinner,
  MetricCard
};
