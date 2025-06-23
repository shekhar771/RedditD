import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { formatDistanceToNowStrict } from 'date-fns'
import locale from 'date-fns/locale/en-US'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
