import type { RequestOptionsInterface } from '../interface/request-options.interface.js';

export type RequestOptionToggleType = Exclude<keyof RequestOptionsInterface, 'totalValue'>;
