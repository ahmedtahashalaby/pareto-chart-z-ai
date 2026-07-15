import powerbi from "powerbi-visuals-api";
import { IDataPoint, IViewModel, ParetoProSettings } from "./interfaces";
import { VisualConstants, ABCClass } from "./constants";

/**
 * DataProcessor is responsible for transforming the raw Power BI DataView
 * into a strongly typed IViewModel suitable for rendering the Pareto chart.
 * It handles sorting, cumulative calculations, ABC classification, and 'Others' aggregation.
 */
export class DataProcessor {
    /**
     * Processes the Power BI DataView into an IViewModel.
     * 
     * @param dataView The Power BI data view.
     * @param settings The visual settings.
     * @param host The Power BI visual host services (for creating selection IDs).
     * @returns The processed IViewModel.
     */
    public static process(
        dataView: powerbi.DataView,
        settings: ParetoProSettings,
        host: powerbi.extensibility.visual.IVisualHost
    ): IViewModel {
        const emptyViewModel: IViewModel = {
            dataPoints: [],
            totalValue: 0,
            targetPercentage: settings.targetLine.value,
            maxValue: 0,
            settings: settings,
            hasData: false
        };

        if (!dataView || !dataView.categorical || !dataView.categorical.categories || !dataView.categorical.values) {
            return emptyViewModel;
        }

        const categories = dataView.categorical.categories[0];
        const values = dataView.categorical.values;
        const measureValue = values.find(v => v.source.roles && v.source.roles["Measure"])
            ?? values[0];

        if (!categories || !measureValue || !measureValue.values) {
            return emptyViewModel;
        }

        // Extract tooltip measures
        const tooltipMeasures = values.filter(v => v.source.roles && v.source.roles["Tooltip"]);

        // Map raw data to IDataPoint[]
        let dataPoints: IDataPoint[] = [];
        let totalValue = 0;

        for (let i = 0; i < categories.values.length; i++) {
            const categoryValue = categories.values[i];
            const value = measureValue.values[i] as number;

            // Skip nulls, NaN, or empty categories
            if (categoryValue === null || categoryValue === undefined || 
                value === null || value === undefined || isNaN(value)) {
                continue;
            }

            const identity = host.createSelectionIdBuilder()
                .withCategory(categories, i)
                .createSelectionId();

            // Extract tooltip values for this specific data point
            const tooltipValues = tooltipMeasures.map(tm => {
                const val = tm.values[i] as number;
                return {
                    displayName: tm.source.displayName,
                    value: val !== null && val !== undefined && !isNaN(val) ? val.toLocaleString() : "N/A"
                };
            });

            // Handle highlight values if present
            let highlightValue: number | undefined;
            if (measureValue.highlights && i < measureValue.highlights.length) {
                highlightValue = measureValue.highlights[i] as number;
            }

            dataPoints.push({
                category: categoryValue.toString(),
                value: Math.abs(value), // Pareto charts typically use absolute values
                highlightValue: highlightValue !== null && highlightValue !== undefined ? Math.abs(highlightValue) : undefined,
                cumulativeValue: 0,
                cumulativePercentage: 0,
                individualPercentage: 0,
                rank: 0,
                abcClass: ABCClass.C, // Default, will be calculated
                isOthers: false,
                identity: identity,
                selected: false,
                differenceFromPrevious: 0,
                tooltipValues: tooltipValues.length > 0 ? tooltipValues : undefined
            });

            totalValue += Math.abs(value);
        }

        if (dataPoints.length === 0) {
            return emptyViewModel;
        }

        // Sort descending by value
        dataPoints.sort((a, b) => b.value - a.value);

        // Calculate individual percentage, running total, cumulative percentage, rank, and difference
        let runningTotal = 0;
        let previousCumulativePercentage = 0;
        dataPoints.forEach((dp, index) => {
            dp.rank = index + 1;
            runningTotal += dp.value;
            dp.cumulativeValue = runningTotal;
            dp.individualPercentage = totalValue > 0 ? (dp.value / totalValue) * 100 : 0;
            dp.cumulativePercentage = totalValue > 0 ? (runningTotal / totalValue) * 100 : 0;
            dp.differenceFromPrevious = dp.cumulativePercentage - previousCumulativePercentage;
            previousCumulativePercentage = dp.cumulativePercentage;
        });

        // Aggregate into "Others" if too many data points
        if (dataPoints.length > VisualConstants.MaxDataPointsBeforeOthers) {
            const visiblePoints = dataPoints.slice(0, VisualConstants.MaxDataPointsBeforeOthers - 1);
            const othersPoints = dataPoints.slice(VisualConstants.MaxDataPointsBeforeOthers - 1);

            const othersValue = othersPoints.reduce((sum, dp) => sum + dp.value, 0);
            const othersCumulativeValue = othersPoints[othersPoints.length - 1].cumulativeValue;
            const othersCumulativePercentage = othersPoints[othersPoints.length - 1].cumulativePercentage;
            const othersIndividualPercentage = totalValue > 0 ? (othersValue / totalValue) * 100 : 0;

            // Create the "Others" data point
            const othersDataPoint: IDataPoint = {
                category: "Others",
                value: othersValue,
                cumulativeValue: othersCumulativeValue,
                cumulativePercentage: othersCumulativePercentage,
                individualPercentage: othersIndividualPercentage,
                rank: visiblePoints.length + 1,
                abcClass: othersCumulativePercentage <= VisualConstants.ABCThresholds.A ? ABCClass.A : 
                          othersCumulativePercentage <= VisualConstants.ABCThresholds.B ? ABCClass.B : ABCClass.C,
                isOthers: true,
                identity: host.createSelectionIdBuilder().createSelectionId(), // Empty identity for Others
                selected: false,
                differenceFromPrevious: othersCumulativePercentage - visiblePoints[visiblePoints.length - 1].cumulativePercentage,
                tooltipValues: undefined
            };

            dataPoints = [...visiblePoints, othersDataPoint];
        }

        // Assign ABC Classification based on cumulative percentage
        dataPoints.forEach(dp => {
            if (dp.cumulativePercentage <= VisualConstants.ABCThresholds.A) {
                dp.abcClass = ABCClass.A;
            } else if (dp.cumulativePercentage <= VisualConstants.ABCThresholds.B) {
                dp.abcClass = ABCClass.B;
            } else {
                dp.abcClass = ABCClass.C;
            }
        });

        // Determine max value for Y-axis scaling (use the highest individual value)
        const maxValue = d3Max(dataPoints, d => d.value) || 0;

        return {
            dataPoints: dataPoints,
            totalValue: totalValue,
            targetPercentage: settings.targetLine.value,
            maxValue: maxValue,
            settings: settings,
            hasData: true
        };
    }
}

/**
 * Helper utility to find the maximum value in an array (mimics D3.max).
 * Used to avoid importing full d3 array modules if not needed, though d3 is available.
 * 
 * @param array The array of objects.
 * @param accessor The function to extract the numeric value.
 * @returns The maximum numeric value.
 */
function d3Max<T>(array: T[], accessor: (item: T) => number): number | undefined {
    let max: number | undefined;
    for (const item of array) {
        const val = accessor(item);
        if (val !== null && val !== undefined && !isNaN(val)) {
            if (max === undefined || val > max) {
                max = val;
            }
        }
    }
    return max;
}