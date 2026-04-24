import type { Observable } from 'rxjs';

export type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;
