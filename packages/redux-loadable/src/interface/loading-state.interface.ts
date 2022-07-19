export interface LoadingStateInterface {
    /**
     * Error message if loading has failed.
     */
    error: string;
    /**
     * Flag showing that loading has started.
     */
    isLoading: boolean;
    /**
     * Flag showing that loading has never started for this state slice, changes only once to false on first loading.
     */
    isPristine: boolean;
}

export const initialLoadingState: LoadingStateInterface = {
    isPristine: true,
    isLoading: false,
    error: '',
};
