import type { RequestOptionsInterface } from '../interface/request-options.interface';

export type RequestOptionToggleType = Exclude<keyof RequestOptionsInterface, 'totalValue'>;
