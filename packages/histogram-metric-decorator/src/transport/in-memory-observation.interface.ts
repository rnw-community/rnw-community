export interface InMemoryObservationInterface {
    readonly name: string;
    readonly durationMs: number;
    readonly labels?: Readonly<Record<string, string>>;
}
