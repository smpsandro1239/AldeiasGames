import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const GameCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-24 w-full" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
      <Icon className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-md mb-4">{description}</p>
    {action}
  </motion.div>
);
