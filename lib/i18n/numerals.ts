const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input: number | string | null | undefined): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

export function formatScore(
  home: number | null | undefined,
  away: number | null | undefined,
  locale: 'bn' | 'en' = 'bn'
): string {
  if (home === null || home === undefined || away === null || away === undefined) {
    return 'VS';
  }
  if (locale === 'bn') {
    return `${toBengaliDigits(home)} - ${toBengaliDigits(away)}`;
  }
  return `${home} - ${away}`;
}

export function formatMinute(minute: number | string | null | undefined, locale: 'bn' | 'en' = 'bn'): string {
  if (!minute) return '';
  const val = String(minute);
  if (locale === 'bn') {
    return `${toBengaliDigits(val)}'`;
  }
  return `${val}'`;
}

const bnMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export function formatLocalizedDate(dateInput: Date | string | number, locale: 'bn' | 'en' = 'bn'): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (locale === 'bn') {
    return `${toBengaliDigits(day)} ${bnMonths[monthIdx]}, ${toBengaliDigits(year)}`;
  }

  const enMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${day} ${enMonths[monthIdx]}, ${year}`;
}