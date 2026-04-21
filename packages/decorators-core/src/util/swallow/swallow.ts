export const swallow = (fn: () => void): void => {
    try {
        fn();
    } catch {
        void 0;
    }
};
