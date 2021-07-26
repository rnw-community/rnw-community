export interface LoadingStateInterface {
    /**
     * Flag showing that loading has never started yet
     */
    isPristine: boolean;
    /**
     * Flag showing that loading has started
     */
    isLoading: boolean;
    /**
     * Error message if loading has failed
     */
    error: string;
}

export const initialLoadingState: LoadingStateInterface = {
    isPristine: true,
    isLoading: false,
    error: '',
};
