import type { ChromeDemoItemInterface } from '../interface/chrome-demo-item.interface';

export const CHROME_DEMO_ITEMS: readonly ChromeDemoItemInterface[] = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    detail: `Row detail ${String(index + 1)}`,
    title: `Ledger entry ${String(index + 1)}`,
}));
