import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'submitted' | 'reviewed' | 'checkin' | 'checkout';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<Status, { label: string, variant: "secondary" | "default" | "outline" | "destructive", className: string }> = {
    pending: { label: 'Pending', variant: 'outline', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    submitted: { label: 'Submitted', variant: 'secondary', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    reviewed: { label: 'Reviewed', variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    checkin: { label: 'Checked In', variant: 'default', className: 'bg-emerald-500 text-white' },
    checkout: { label: 'Checked Out', variant: 'outline', className: 'bg-zinc-500 text-white' },
  };

  const item = config[status];

  return (
    <Badge 
      variant={item.variant} 
      className={cn("font-medium", item.className, className)}
    >
      {item.label}
    </Badge>
  );
}
