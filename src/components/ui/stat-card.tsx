import React from 'react';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

/**
 * Card de estatística reutilizável
 */
export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
