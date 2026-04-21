import type { Observable } from 'rxjs';

export type ObservableEmissionType<T> = T extends Observable<infer U> ? U : never;
