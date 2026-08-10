import { useCallback, useState } from 'react';

import { defaultRequestOptions } from '../constant/default-request-options';

import type { RequestOptionsStateInterface } from '../interface/request-options-state.interface';
import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type { RequestOptionToggleType } from '../type/request-option-toggle.type';

export const useRequestOptions = (): RequestOptionsStateInterface => {
    const [options, setOptions] = useState<RequestOptionsInterface>(defaultRequestOptions);

    const toggleOption = useCallback((option: RequestOptionToggleType): void => {
        setOptions(currentOptions => ({ ...currentOptions, [option]: !currentOptions[option] }));
    }, []);

    const setTotalValue = useCallback((totalValue: string): void => {
        setOptions(currentOptions => ({ ...currentOptions, totalValue }));
    }, []);

    return { options, setTotalValue, toggleOption };
};
