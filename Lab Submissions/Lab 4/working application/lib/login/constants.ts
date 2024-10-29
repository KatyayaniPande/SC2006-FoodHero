/**
 * Contains constants that will be used throughout the forms.
 */

import { z } from 'zod';

export const LOGIN_TYPES = ['donor', 'beneficiary', 'admin'];
export const QUERY_PARAM_NAME = 'type';
export const HYGIENE_RATING = z.enum(['A', 'B', 'C', 'D']);
export type HygieneRating = z.infer<typeof HYGIENE_RATING>;
