import type { Node } from 'typescript';

export interface PublicApiInterface {
    readonly exported: ReadonlySet<Node>;
    readonly referenced: ReadonlySet<Node>;
    readonly exportedNamesByFile: ReadonlyMap<string, ReadonlySet<string>>;
}
