export interface BottomChromeHeightRegistryInterface {
    readonly publish: (footerId: symbol, height: number) => void;
    readonly withdraw: (footerId: symbol) => void;
}
