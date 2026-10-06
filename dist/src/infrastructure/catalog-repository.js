import {products} from '../content/products.js';
import {calendar, calendarWindowDays, pairings, guestOptions, testimonials, corporate} from '../content/funnel.js';
export const catalogRepository = {
  all: () => products.map(product => Object.freeze({...product})),
  funnel: () => ({calendar, calendarWindowDays, pairings, guestOptions, testimonials, corporate}),
};
