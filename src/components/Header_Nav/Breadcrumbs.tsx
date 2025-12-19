import React from 'react';
import { useLocation } from 'react-router-dom';
import { BreadcrumbItem } from '@/types';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/', isCurrent: location.pathname === '/' }
    ];

    let accumulatedPath = '';
    pathSegments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        label,
        href: accumulatedPath,
        isCurrent: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 overflow-x-auto">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <a
              href={crumb.href}
              className={`text-sm font-medium ${
                crumb.isCurrent
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } ${crumb.isCurrent ? 'font-semibold' : ''}`}
              aria-current={crumb.isCurrent ? 'page' : undefined}
            >
              {crumb.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};