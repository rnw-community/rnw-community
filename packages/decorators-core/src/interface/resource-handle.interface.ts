export interface ResourceHandleInterface {
    readonly release: () => void | Promise<void>;
}
