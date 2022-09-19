export interface HmrModuleInterface {
    hot?: {
        accept: () => void;
        dispose: (callback: () => Promise<void>) => void;
    };
}
