/**
 * Describes the absolute geometry of an edge-fade band extended under the safe-area inset.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadebandmetricsinterface
 */
export interface EdgeFadeBandMetricsInterface {
    /** Band height in points, safe-area inset included. */
    readonly height: number;
    /** Negative top inset offset, set only for the top band. */
    readonly top?: number;
    /** Negative bottom inset offset, set only for the bottom band. */
    readonly bottom?: number;
}
