/**
 * Constant values used throughout the Pareto Pro visual.
 */

export const VisualConstants = {
    /** 
     * Default margins for the main SVG chart area.
     * Adjusted to accommodate axes, labels, and target line.
     */
    DefaultMargin: {
        top: 20,
        right: 50, // Space for secondary Y-axis
        bottom: 40, // Space for X-axis labels
        left: 50    // Space for primary Y-axis
    },

    /** Default colors for ABC classifications if conditional colors are enabled */
    DefaultABCColors: {
        A: "#1F77B4", // Blue
        B: "#FF7F0E", // Orange
        C: "#D62728"  // Red
    },

    /** Default gradient colors for bars */
    DefaultGradientColors: {
        start: "#1F77B4",
        end: "#AEC7E8"
    },

    /** Thresholds for ABC classification (in percentage) */
    ABCThresholds: {
        A: 80,
        B: 95,
        C: 100
    },

    /** Default target line value in percentage */
    DefaultTargetPercentage: 80,

    /** Maximum number of data points before aggregating into "Others" */
    MaxDataPointsBeforeOthers: 30,

    /** Minimum height for bars to remain visible (prevents rendering issues) */
    MinBarHeight: 1,

    /** DOM Element IDs and Classes */
    ClassNames: {
        Container: "pareto-pro-container",
        CardsContainer: "pareto-pro-cards-container",
        Card: "pareto-pro-card",
        CardTitle: "pareto-pro-card-title",
        CardValue: "pareto-pro-card-value",
        ChartContainer: "pareto-pro-chart-container",
        SVG: "pareto-pro-svg",
        Axis: "pareto-pro-axis",
        Grid: "pareto-pro-grid",
        TableContainer: "pareto-pro-table-container",
        Table: "pareto-pro-table",
        Legend: "pareto-pro-legend",
        LegendItem: "pareto-pro-legend-item",
        LegendColor: "pareto-pro-legend-color",
        Tooltip: "pareto-pro-tooltip",
        Bar: "pareto-pro-bar",
        Line: "pareto-pro-line",
        Marker: "pareto-pro-marker",
        TargetLine: "pareto-pro-target-line",
        TargetLabel: "pareto-pro-target-label",
        DataLabel: "pareto-pro-data-label"
    },

    /** Animation defaults */
    AnimationDefaults: {
        duration: 1000,
        type: "grow"
    },

    /** Minimum viewport dimensions where the visual hides secondary elements (like tables/cards) */
    ResponsiveBreakpoints: {
        Phone: 400,
        Tablet: 800
    }
};

/**
 * Enum for ABC Classification types.
 */
export enum ABCClass {
    A = "A",
    B = "B",
    C = "C"
}