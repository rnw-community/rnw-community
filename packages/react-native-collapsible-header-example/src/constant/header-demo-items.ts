import type { HeaderDemoItem } from '../interface/header-demo-item.interface';

export const HeaderDemoItems: readonly HeaderDemoItem[] = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    label: `Ledger entry ${String(index + 1)}`,
}));
