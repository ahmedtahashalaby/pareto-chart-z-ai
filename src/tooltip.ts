import powerbi from "powerbi-visuals-api";
import { IDataPoint } from "./interfaces";
import { Formatter } from "./formatter";
import { escapeHtml } from "./utils";

/**
 * TooltipRenderer is responsible for managing the Power BI native tooltip service.
 * It constructs the tooltip content and handles show/hide events based on user interaction.
 */
export class TooltipRenderer {
    private tooltipService: powerbi.extensibility.ITooltipService;

    /**
     * Initializes the TooltipRenderer.
     * @param tooltipService The Power BI tooltip service instance.
     */
    constructor(tooltipService: powerbi.extensibility.ITooltipService) {
        this.tooltipService = tooltipService;
    }

    /**
     * Shows the Power BI tooltip for a specific data point.
     * 
     * @param event The mouse event triggering the tooltip.
     * @param dataPoint The data point associated with the hovered element.
     */
    public showTooltip(event: MouseEvent, dataPoint: IDataPoint): void {
        const tooltipItems: powerbi.extensibility.VisualTooltipDataItem[] = [
            {
                displayName: "Category",
                value: escapeHtml(dataPoint.category),
                color: undefined
            },
            {
                displayName: "Value",
                value: Formatter.formatValue(dataPoint.value, 0, 2),
                color: undefined
            },
            {
                displayName: "Individual %",
                value: Formatter.formatPercentage(dataPoint.individualPercentage, 2),
                color: undefined
            },
            {
                displayName: "Running Total",
                value: Formatter.formatValue(dataPoint.cumulativeValue, 0, 2),
                color: undefined
            },
            {
                displayName: "Cumulative %",
                value: Formatter.formatPercentage(dataPoint.cumulativePercentage, 2),
                color: undefined
            },
            {
                displayName: "Rank",
                value: dataPoint.rank.toString(),
                color: undefined
            },
            {
                displayName: "ABC Class",
                value: dataPoint.abcClass,
                color: undefined
            }
        ];

        if (dataPoint.differenceFromPrevious !== undefined && !isNaN(dataPoint.differenceFromPrevious)) {
            tooltipItems.push({
                displayName: "Diff from Previous",
                value: Formatter.formatPercentage(dataPoint.differenceFromPrevious, 2),
                color: undefined
            });
        }

        // Add any additional tooltip measures provided in the data roles
        if (dataPoint.tooltipValues && dataPoint.tooltipValues.length > 0) {
            dataPoint.tooltipValues.forEach(tooltipVal => {
                tooltipItems.push({
                    displayName: tooltipVal.displayName,
                    value: tooltipVal.value,
                    color: undefined
                });
            });
        }

        const tooltipData: powerbi.extensibility.TooltipData = {
            dataItems: tooltipItems,
            identities: [dataPoint.identity],
            coordinates: [event.clientX, event.clientY],
            isTouchEvent: false,
            datum: dataPoint,
            borderColor: "#cccccc"
        };

        this.tooltipService.show(tooltipData);
    }

    /**
     * Hides the Power BI tooltip.
     * @param immediately Whether to hide the tooltip immediately or wait for a brief delay.
     */
    public hideTooltip(immediately: boolean = true): void {
        this.tooltipService.hide({ immediately, isTouchEvent: false });
    }
}