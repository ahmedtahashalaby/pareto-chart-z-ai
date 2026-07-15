import * as d3 from "d3";
import { IDataPoint, IBarsSettings, IAnimationSettings, IChartLayout } from "./interfaces";
import { VisualConstants } from "./constants";
import { createGradient } from "./utils";

/**
 * BarsRenderer is responsible for rendering the clustered bar chart elements.
 * Implements the D3 enter-update-exit pattern for high performance with large datasets.
 */
export class BarsRenderer {
    private barsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private gradientId: string = "pareto-bar-gradient";

    /**
     * Initializes the BarsRenderer and appends the necessary SVG group.
     * @param svg The main SVG selection.
     * @param layout The chart layout dimensions.
     */
    constructor(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        layout: IChartLayout
    ) {
        const chartArea = svg.select("g.chart-area");
        this.barsGroup = chartArea.select("g.bars").empty()
            ? chartArea.insert("g", ".grid").attr("class", "bars")
            : chartArea.select("g.bars");
    }

    /**
     * Renders the bars based on the provided data and scales.
     * 
     * @param dataPoints The array of data points to render.
     * @param xScale The D3 band scale for the X-axis.
     * @param yScale The D3 linear scale for the primary Y-axis.
     * @param settings The bar settings.
     * @param animationSettings The animation settings.
     * @param hasSelection Indicates if there is an active selection.
     * @param layout The chart layout dimensions.
     */
    public render(
        dataPoints: IDataPoint[],
        xScale: d3.ScaleBand<string>,
        yScale: d3.ScaleLinear<number, number>,
        settings: IBarsSettings,
        animationSettings: IAnimationSettings,
        hasSelection: boolean,
        layout: IChartLayout
    ): void {
        // Setup gradient if enabled
        const svgNode = this.barsGroup.node()?.ownerSVGElement;
        if (svgNode && settings.gradientEnabled) {
            const svgSelection = d3.select(svgNode);
            createGradient(svgSelection, this.gradientId, settings.gradientStartColor, settings.gradientEndColor);
        }

        // Bind data
        const bars = this.barsGroup.selectAll<SVGRectElement, IDataPoint>(`rect.${VisualConstants.ClassNames.Bar}`)
            .data(dataPoints, (d: IDataPoint) => d.category);

        // Exit
        bars.exit()
            .transition()
            .duration(animationSettings.enable ? animationSettings.duration / 2 : 0)
            .attr("height", 0)
            .attr("y", layout.innerHeight)
            .remove();

        // Enter
        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", VisualConstants.ClassNames.Bar)
            .style("cursor", "pointer")
            .attr("x", (d: IDataPoint) => xScale(d.category) || 0)
            .attr("width", xScale.bandwidth())
            .attr("y", layout.innerHeight)
            .attr("height", 0);

        // Update + Enter
        const mergedBars = barsEnter.merge(bars);

        // Apply styling and attributes
        mergedBars
            .attr("fill", (d: IDataPoint) => {
                if (hasSelection && !d.selected) return "#cccccc"; // Muted color for unselected
                if (settings.abcColorsEnabled) {
                    if (d.abcClass === "A") return settings.colorA;
                    if (d.abcClass === "B") return settings.colorB;
                    return settings.colorC;
                }
                if (settings.gradientEnabled) return `url(#${this.gradientId})`;
                return settings.fillColor;
            })
            .attr("stroke", settings.strokeColor)
            .attr("stroke-width", settings.strokeWidth)
            .attr("rx", settings.cornerRadius)
            .attr("ry", settings.cornerRadius)
            .style("opacity", (d: IDataPoint) => {
                if (hasSelection && !d.selected) return 0.5;
                return 1 - (settings.transparency / 100);
            })
            // Hover Effects
            .on("mouseover", function(event: MouseEvent, d: IDataPoint) {
                if (!hasSelection || d.selected) {
                    d3.select(this).transition().duration(150).style("opacity", 0.8);
                }
            })
            .on("mouseout", function(event: MouseEvent, d: IDataPoint) {
                if (!hasSelection || d.selected) {
                    d3.select(this).transition().duration(150).style("opacity", 1 - (settings.transparency / 100));
                }
            });

        // Apply animation transition
        if (animationSettings.enable) {
            mergedBars
                .transition()
                .duration(animationSettings.duration)
                .ease(d3.easeCubicOut)
                .attr("x", (d: IDataPoint) => xScale(d.category) || 0)
                .attr("width", xScale.bandwidth())
                .attr("y", (d: IDataPoint) => yScale(Math.max(0, d.value)))
                .attr("height", (d: IDataPoint) => Math.abs(yScale(d.value) - yScale(0)));
        } else {
            mergedBars
                .attr("x", (d: IDataPoint) => xScale(d.category) || 0)
                .attr("width", xScale.bandwidth())
                .attr("y", (d: IDataPoint) => yScale(Math.max(0, d.value)))
                .attr("height", (d: IDataPoint) => Math.abs(yScale(d.value) - yScale(0)));
        }
    }

    /**
     * Retrieves the SVG group containing the bars for tooltip interception.
     * @returns The D3 selection of the bars group.
     */
    public getBarsGroup(): d3.Selection<SVGGElement, unknown, null, undefined> {
        return this.barsGroup;
    }
}