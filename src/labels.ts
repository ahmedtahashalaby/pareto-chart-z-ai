import * as d3 from "d3";
import { IDataPoint, ILabelsSettings, IAnimationSettings } from "./interfaces";
import { VisualConstants } from "./constants";
import { Formatter } from "./formatter";

/**
 * LabelsRenderer is responsible for rendering the data labels on top of or inside the bars.
 * It handles positioning, formatting, and styling based on user settings.
 */
export class LabelsRenderer {
    private labelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    /**
     * Initializes the LabelsRenderer and appends the necessary SVG group.
     * @param svg The main SVG selection.
     */
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        const chartArea = svg.select("g.chart-area");
        this.labelsGroup = chartArea.select("g.data-labels").empty()
            ? chartArea.append("g").attr("class", "data-labels")
            : chartArea.select("g.data-labels");
    }

    /**
     * Renders the data labels based on the provided data and scales.
     * 
     * @param dataPoints The array of data points to render.
     * @param xScale The D3 band scale for the X-axis.
     * @param yScale The D3 linear scale for the primary Y-axis.
     * @param settings The data labels settings.
     * @param animationSettings The animation settings.
     * @param hasSelection Indicates if there is an active selection.
     */
    public render(
        dataPoints: IDataPoint[],
        xScale: d3.ScaleBand<string>,
        yScale: d3.ScaleLinear<number, number>,
        settings: ILabelsSettings,
        animationSettings: IAnimationSettings,
        hasSelection: boolean
    ): void {
        if (!settings.show) {
            this.labelsGroup.style("display", "none");
            return;
        }

        this.labelsGroup.style("display", null);

        // Bind data
        const labels = this.labelsGroup.selectAll<SVGTextElement, IDataPoint>(`text.${VisualConstants.ClassNames.DataLabel}`)
            .data(dataPoints, (d: IDataPoint) => d.category);

        // Exit
        labels.exit().remove();

        // Enter
        const labelsEnter = labels.enter()
            .append("text")
            .attr("class", VisualConstants.ClassNames.DataLabel)
            .style("pointer-events", "none") // Prevent labels from blocking mouse events on bars
            .style("font-size", `${settings.fontSize}px`)
            .attr("text-anchor", "middle");

        // Update + Enter
        const mergedLabels = labelsEnter.merge(labels);

        // Calculate X position (center of the band)
        const calculateX = (d: IDataPoint) => (xScale(d.category) || 0) + xScale.bandwidth() / 2;

        // Calculate Y position based on settings
        const calculateY = (d: IDataPoint) => {
            const yVal = yScale(Math.max(0, d.value));
            if (settings.position === "outside") {
                // If value is positive, put label above bar. If negative, put below.
                return d.value >= 0 ? yVal - 5 : yVal + 15; 
            } else if (settings.position === "inside") {
                return d.value >= 0 ? yVal + 15 : yVal - 5;
            } else { // center
                return yScale(d.value / 2);
            }
        };

        // Apply styling and text
        mergedLabels
            .text((d: IDataPoint) => Formatter.formatValue(d.value, settings.displayUnits, settings.decimalPlaces))
            .attr("fill", settings.color)
            .style("opacity", (d: IDataPoint) => (hasSelection && !d.selected ? 0.3 : 1));

        // Apply animation or direct attributes
        if (animationSettings.enable) {
            mergedLabels
                .transition()
                .duration(animationSettings.duration)
                .ease(d3.easeCubicOut)
                .attr("x", calculateX)
                .attr("y", calculateY);
        } else {
            mergedLabels
                .attr("x", calculateX)
                .attr("y", calculateY);
        }
    }
}