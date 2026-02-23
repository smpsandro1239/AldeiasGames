import React from 'react';
import { Card, CardContent } from './card';
import { Aldeia } from '@/types/project';

interface OrgCardProps {
  org: Aldeia;
}

/**
 * Card de organização
 */
export function OrgCard({ org }: OrgCardProps) {
  return (
    <Card className="hover:bg-muted/50 cursor-pointer">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-600">
          {org.nome.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold">{org.nome}</h4>
          <p className="text-xs text-muted-foreground capitalize">{org.tipoOrganizacao}</p>
        </div>
      </CardContent>
    </Card>
  );
}
