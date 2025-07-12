'use client';
import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('./app-shell'), { ssr: false });

export default function HomePage() {
  return <ClientApp />;
}
