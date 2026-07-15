import * as d3 from "d3";
import { ILegendSettings } from "./interfaces";
import { interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import { VisualConstants } from "./constants";

/**
 * LegendRenderer is responsible for rendering and managing the visual's legend.
 * It handles the positioning, styling, and interactivity (click to filter) of legend items.
 */
export class LegendRenderer {
    private legendContainer: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private onLegendClickCallback: (dataPoint: interactivityBaseService.LegendDataPoint) => void;

    /**
     * Initializes the LegendRenderer.
     * @param container The HTML container element where the legend will be appended.
     * @param onLegendClick Callback function to handle legend item clicks.
     */
    constructor(
        container: HTMLElement,
        onLegendClick: (dataPoint: interactivityBaseService.LegendDataPoint) => void
    ) {
        // Select or create the legend container
        this.legendContainer = d3.select(container).select(`div.${VisualConstants.ClassNames.Legend}`).empty()
            ? d3.select(container).append("div").attr("class", VisualConstants.ClassNames.Legend)
            : d3.select(container).select(`div.${VisualConstants.ClassNames.Legend}`);

        this.onLegendClickCallback = onLegendClick;
    }

    /**
     * Renders the legend based on the provided data and settings.
     * 
     * @param legendData The array of legend data points.
     * @param settings The legend settings.
     */
    public render(
        legendData: interactivityBaseService.LegendDataPoint[],
        settings: ILegendSettings
    ): void {
        // If legend is hidden or no data, hide the container
        if (!settings.show || !legendData || legendData.length === 0) {
            this.legendContainer.style("display", "none");
            return;
        }

        this.legendContainer.style("display", "flex");
        
        // Apply positioning styles based on settings
        let justifyContent = "center";
        let flexDirection = "row";
        
        switch (settings.position) {
            case "top":
                flexDirection = "row";
                justifyContent = "center";
                break;
            case "bottom":
                flexDirection = "row";
                justifyContent = "center";
                break;
            case "left":
                flexDirection = "column";
                justifyContent = "flex-start";
                break;
            case "right":
                flexDirection = "column";
                justifyContent = "flex-start";
                break;
        }

        // Apply CSS styles
        this.legendContainer
            .style("flex-direction", flexDirection)
            .style("justify-content", justifyContent)
            .style("color", settings.fontColor)
            .style("font-size", `${settings.fontSize}px`)
            // Adjust order to flex the container correctly in the main layout
            .style("order", settings.position === "top" || settings.position === "left" ? "0" : "2");

        // Bind data to legend items
        const items = this.legendContainer.selectAll<HTMLDivElement, interactivityBaseService.LegendDataPoint>(`div.${VisualConstants.ClassNames.LegendItem}`)
            .data(legendData, (d: interactivityBaseService.LegendDataPoint) => d.label);

        // Exit
        items.exit().remove();

        // Enter
        const itemsEnter = items.enter()
            .append("div")
            .attr("class", VisualConstants.ClassNames.LegendItem)
            .style("cursor", "pointer")
            .on("click", (event: MouseEvent, d: interactivityBaseService.LegendDataPoint) => {
                event.stopPropagation();
                this.onLegendClickCallback(d);
            });

        // Append color box and label text for new items
        itemsEnter.append("div").attr("class", VisualConstants.ClassNames.LegendColor);
        itemsEnter.append("span").attr("class", "legend-label");

        // Update (Merge enter + update selections)
        const mergedItems = itemsEnter.merge(items);
        
        // Update color box style
        mergedItems.select(`div.${VisualConstants.ClassNames.LegendColor}`)
            .style("background-color", (d: interactivityBaseService.LegendDataPoint) => d.color)
            .style("opacity", (d: interactivityBaseService.LegendDataPoint) => (d.selected === false ? 0.3 : 1));

        // Update label text and opacity
        mergedItems.select("span.legend-label")
            .text((d: interactivityBaseService.LegendDataPoint) => d.label)
            .style("opacity", (d: interactivityBaseService.LegendDataPoint) => (d.selected === false ? 0.3 : 1));
    }
}