import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { defaultLocale } from '@/lib/i18n/config';

export default function RootPage() {
  const cookieStore = cookies();
  const savedLocale = cookieStore.get('goalbangla_locale')?.value;
  const locale = savedLocale === 'en' ? 'en' : defaultLocale;
  redirect(`/${locale}`);
}