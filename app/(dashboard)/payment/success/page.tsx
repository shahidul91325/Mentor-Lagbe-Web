import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center px-4">Loading…</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}