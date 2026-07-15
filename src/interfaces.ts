import powerbi from "powerbi-visuals-api";
import { interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";

/**
 * Represents a single data point in the Pareto chart.
 */
export interface IDataPoint {
    /** The category name (e.g., Defect Type) */
    category: string;
    /** The primary measure value for the category */
    value: number;
    /** The highlighted value (for cross-highlighting) */
    highlightValue?: number;
    /** The cumulative running total up to this category */
    cumulativeValue: number;
    /** The cumulative percentage (0-100) up to this category */
    cumulativePercentage: number;
    /** The individual percentage (0-100) of this category relative to the total */
    individualPercentage: number;
    /** The rank of this category (1-based, descending by value) */
    rank: number;
    /** The ABC classification ('A' for top 80%, 'B' for 80-95%, 'C' for 95-100%) */
    abcClass: "A" | "B" | "C";
    /** Indicates if this data point is an aggregated "Others" category */
    isOthers: boolean;
    /** Power BI selection identifier for cross-filtering and highlighting */
    identity: powerbi.extensibility.ISelectionId;
    /** Indicates if the data point is currently selected */
    selected: boolean;
    /** The difference in cumulative percentage from the previous data point */
    differenceFromPrevious: number;
    /** Tooltip values if secondary measures are provided */
    tooltipValues?: { displayName: string; value: string }[];
}

/**
 * Represents the processed view model for the entire visual.
 */
export interface IViewModel {
    /** Array of processed data points */
    dataPoints: IDataPoint[];
    /** The total sum of all measure values */
    totalValue: number;
    /** The target cumulative percentage (default 80) */
    targetPercentage: number;
    /** The maximum value in the measure column (for primary Y-axis scale) */
    maxValue: number;
    /** All formatting and visual settings */
    settings: ParetoProSettings;
    /** Indicates if the visual has valid data to display */
    hasData: boolean;
    /** Legend data points if a legend dimension is provided */
    legendData?: interactivityBaseService.LegendDataPoint[];
    /** Legend title */
    legendTitle?: string;
}

/**
 * Main settings interface grouping all visual settings.
 */
export interface ParetoProSettings {
    theme: IThemeSettings;
    bars: IBarsSettings;
    paretoLine: IParetoLineSettings;
    targetLine: ITargetLineSettings;
    labels: ILabelsSettings;
    cards: ICardsSettings;
    legend: ILegendSettings;
    table: ITableSettings;
    animation: IAnimationSettings;
    axes: IAxesSettings;
}

export interface IThemeSettings {
    mode: "auto" | "light" | "dark" | "corporate";
}

export interface IBarsSettings {
    fillColor: string;
    transparency: number;
    strokeColor: string;
    strokeWidth: number;
    cornerRadius: number;
    barGap: number;
    gradientEnabled: boolean;
    gradientStartColor: string;
    gradientEndColor: string;
    abcColorsEnabled: boolean;
    colorA: string;
    colorB: string;
    colorC: string;
}

export interface IParetoLineSettings {
    show: boolean;
    lineColor: string;
    lineWidth: number;
    smooth: boolean;
    markerShape: "none" | "circle" | "square" | "diamond";
    markerSize: number;
    markerColor: string;
}

export interface ITargetLineSettings {
    show: boolean;
    value: number;
    lineColor: string;
    lineWidth: number;
    dashArray: string;
    label: string;
}

export interface ILabelsSettings {
    show: boolean;
    position: "outside" | "inside" | "center";
    color: string;
    fontSize: number;
    displayUnits: number;
    decimalPlaces: number;
}

export interface ICardsSettings {
    show: boolean;
    backgroundColor: string;
    fontColor: string;
    fontSize: number;
}

export interface ILegendSettings {
    show: boolean;
    position: "top" | "bottom" | "left" | "right";
    fontColor: string;
    fontSize: number;
}

export interface ITableSettings {
    show: boolean;
    fontColor: string;
    fontSize: number;
    headerColor: string;
    headerBackgroundColor: string;
}

export interface IAnimationSettings {
    enable: boolean;
    duration: number;
    type: "fade" | "grow" | "slide";
}

export interface IAxesSettings {
    showXAxis: boolean;
    showYAxis: boolean;
    showY2Axis: boolean;
    xAxisTitle: string;
    yAxisTitle: string;
    y2AxisTitle: string;
    showGridLines: boolean;
    fontSize: number;
    fontColor: string;
    xAxisLabelAngle: number;
}

/**
 * Represents the layout dimensions for the SVG chart area.
 */
export interface IChartLayout {
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    innerWidth: number;
    innerHeight: number;
}
