import React from 'react';

export function SectionCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = 'p-5 lg:p-6',
  variant = 'white', // 'white' | 'cream' | 'dark'
}) {
  const bgClasses = {
    white: 'bg-white border-sakra-goldLight/80 text-sakra-dark',
    cream: 'bg-sakra-cream/40 border-sakra-goldLight/90 text-sakra-dark',
    dark: 'bg-sakra-deep border-sakra-forest text-sakra-ivory',
  }[variant];

  return (
    <div className={`rounded-lg border shadow-sakra-subtle overflow-hidden ${bgClasses} ${className}`}>
      {(title || action || badge) && (
        <div className={`px-5 py-4 lg:px-6 lg:py-4.5 border-b flex items-center justify-between gap-4 ${
          variant === 'dark' ? 'border-sakra-forest' : 'border-sakra-goldLight/50'
        } ${headerClassName}`}>
          <div>
            <div className="flex items-center gap-2.5">
              {title && (
                <h3 className={`font-serif text-lg lg:text-xl font-semibold tracking-tight ${
                  variant === 'dark' ? 'text-sakra-ivory' : 'text-sakra-dark'
                }`}>
                  {title}
                </h3>
              )}
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className={`text-xs mt-0.5 ${variant === 'dark' ? 'text-sakra-goldLight/70' : 'text-sakra-muted'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}
