/**
 * The loading flags and error text a Redux state slice extends to track an asynchronous request.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#loadingstateinterface
 */
export interface LoadingStateInterface {
    /** The last request error message, or an empty string when there is no error. */
    error: string;
    /** Whether a request is in progress. */
    isLoading: boolean;
    /** Whether the slice is still in its initial state with no request made yet. */
    isPristine: boolean;
}

/**
 * The pristine, not-loading, error-free starting value for a slice implementing `LoadingStateInterface`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#initialloadingstate
 */
export const initialLoadingState: LoadingStateInterface = {
    isPristine: true,
    isLoading: false,
    error: '',
};
