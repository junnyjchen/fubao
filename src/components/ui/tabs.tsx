'use client';

import { useState, ReactNode, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  tabs?: Tab[];
  defaultValue?: string;
  value?: string;
  onChange?: (tabId: string) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  variant?: 'line' | 'pill' | 'segmented';
  children: ReactNode;
}

export function Tabs({
  tabs,
  defaultValue,
  value,
  onChange,
  onValueChange,
  className,
  variant = 'line',
  children,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultValue || (tabs && tabs[0]?.id) || ''
  );
  const activeTab = value ?? internalActiveTab;

  const handleTabChange = (id: string) => {
    setInternalActiveTab(id);
    onChange?.(id);
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>
        {tabs && tabs.length > 0 && (
          <div
            className={cn(
              'flex gap-1',
              variant === 'line' && 'border-b border-border',
              variant === 'pill' && 'bg-muted p-1 rounded-lg',
              variant === 'segmented' && 'bg-muted p-1 rounded-lg'
            )}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative',
                  variant === 'line' && [
                    'border-b-2 -mb-px rounded-none',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  ],
                  variant === 'pill' && [
                    'rounded-md',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  ],
                  variant === 'segmented' && [
                    'rounded-md flex-1 justify-center',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  ],
                  tab.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted-foreground/10 text-muted-foreground'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </TabsContext.Provider>
  );
}

interface TabPanelProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  const context = useContext(TabsContext);
  if (!context) return <>{children}</>;
  if (context.activeTab !== id) return null;
  return <div className={className}>{children}</div>;
}

export function TabsContent({ 
  children, 
  value, 
  className 
}: { 
  children: ReactNode; 
  value: string; 
  className?: string 
}) {
  const context = useContext(TabsContext);
  if (!context) return null;
  if (context.activeTab !== value) return null;
  return <div className={className}>{children}</div>;
}

export function TabsList({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('flex border-b border-border', className)}>{children}</div>
  );
}

export function TabsTrigger({ 
  children, 
  value, 
  disabled, 
  className 
}: { 
  children: ReactNode; 
  value: string; 
  disabled?: boolean; 
  className?: string 
}) {
  const context = useContext(TabsContext);
  if (!context) return null;
  
  return (
    <button
      onClick={() => !disabled && context.setActiveTab(value)}
      disabled={disabled}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
        context.activeTab === value
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

export function useTabState(defaultTab?: string) {
  const [activeTab, setActiveTab] = useState(defaultTab || '');
  return { activeTab, setActiveTab };
}

interface SimpleTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SimpleTabs({ tabs, activeTab, onChange, className }: SimpleTabsProps) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs?.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
