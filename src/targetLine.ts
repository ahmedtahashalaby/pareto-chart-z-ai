import * as d3 from "d3";
import { ITargetLineSettings, IChartLayout, IAnimationSettings } from "./interfaces";
import { VisualConstants } from "./constants";

/**
 * TargetLineRenderer is responsible for rendering the horizontal target line
 * (typically at 80%) on the secondary Y-axis, including its label.
 */
export class TargetLineRenderer {
    private targetGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    /**
     * Initializes the TargetLineRenderer and appends the necessary SVG group.
     * @param svg The main SVG selection.
     */
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        const chartArea = svg.select("g.chart-area");
        this.targetGroup = chartArea.select("g.target-line-container").empty()
            ? chartArea.append("g").attr("class", "target-line-container")
            : chartArea.select("g.target-line-container");
    }

    /**
     * Renders the target line based on the provided scales and settings.
     * 
     * @param y2Scale The D3 linear scale for the secondary Y-axis (percentage).
     * @param layout The chart layout dimensions.
     * @param settings The target line settings.
     * @param animationSettings The animation settings.
     */
    public render(
        y2Scale: d3.ScaleLinear<number, number>,
        layout: IChartLayout,
        settings: ITargetLineSettings,
        animationSettings: IAnimationSettings
    ): void {
        // Clear group if not shown
        if (!settings.show) {
            this.targetGroup.style("display", "none");
            return;
        }

        this.targetGroup.style("display", null);

        // Calculate Y position based on the target percentage value
        const yPos = y2Scale(settings.value);

        // Select or append the line
        const lineSelection = this.targetGroup.select<SVGLineElement>(`line.${VisualConstants.ClassNames.TargetLine}`);
        const line = lineSelection.empty()
            ? this.targetGroup.append("line").attr("class", VisualConstants.ClassNames.TargetLine)
            : lineSelection;

        // Apply attributes and animations
        if (animationSettings.enable) {
            line.transition()
                .duration(animationSettings.duration)
                .ease(d3.easeCubicOut)
                .attr("x1", 0)
                .attr("x2", layout.innerWidth)
                .attr("y1", yPos)
                .attr("y2", yPos)
                .attr("stroke", settings.lineColor)
                .attr("stroke-width", settings.lineWidth)
                .attr("stroke-dasharray", settings.dashArray === "none" ? null : settings.dashArray);
        } else {
            line
                .attr("x1", 0)
                .attr("x2", layout.innerWidth)
                .attr("y1", yPos)
                .attr("y2", yPos)
                .attr("stroke", settings.lineColor)
                .attr("stroke-width", settings.lineWidth)
                .attr("stroke-dasharray", settings.dashArray === "none" ? null : settings.dashArray);
        }

        // Render Label
        if (settings.label && settings.label.trim().length > 0) {
            const textSelection = this.targetGroup.select<SVGTextElement>(`text.${VisualConstants.ClassNames.TargetLabel}`);
            const text = textSelection.empty()
                ? this.targetGroup.append("text")
                    .attr("class", VisualConstants.ClassNames.TargetLabel)
                    .style("font-size", "11px")
                    .style("font-weight", "bold")
                : textSelection;

            if (animationSettings.enable) {
                text.transition()
                    .duration(animationSettings.duration)
                    .ease(d3.easeCubicOut)
                    .attr("x", layout.innerWidth - 5) // Align to the right
                    .attr("y", yPos - 5) // Slightly above the line
                    .attr("text-anchor", "end")
                    .attr("fill", settings.lineColor)
                    .text(settings.label);
            } else {
                text
                    .attr("x", layout.innerWidth - 5)
                    .attr("y", yPos - 5)
                    .attr("text-anchor", "end")
                    .attr("fill", settings.lineColor)
                    .text(settings.label);
            }
        } else {
            this.targetGroup.select(`text.${VisualConstants.ClassNames.TargetLabel}`).remove();
        }
    }
}