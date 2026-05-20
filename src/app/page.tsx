import { redirect } from 'next/navigation';

// This page only renders when the app is built statically (output: 'export')
// For dynamic deployments, the middleware will intercept requests to `/`
// and redirect to the default locale (e.g. `/zh`).
export default function RootPage() {
  redirect('/zh');
}