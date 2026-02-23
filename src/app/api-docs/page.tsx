'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Aldeias Games API Documentation</h1>
        <div className="border rounded-xl overflow-hidden shadow-lg bg-white">
          <SwaggerUI url="/api/docs" />
        </div>
      </div>
    </div>
  );
}
