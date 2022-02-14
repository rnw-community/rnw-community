export type LabelsConfig<M, E extends string = string> = Record<keyof M, readonly E[]>;
