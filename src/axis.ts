import * as d3 from "d3";
import { IAxesSettings, IChartLayout } from "./interfaces";
import { Formatter } from "./formatter";
import { VisualConstants } from "./constants";
import { truncateText } from "./utils";

/**
 * AxisRenderer is responsible for rendering and managing the X, Y, and secondary Y (Y2) axes,
 * as well as the gridlines and axis titles using D3.js.
 */
export class AxisRenderer {
    private xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private y2AxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private gridGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    /**
     * Initializes the AxisRenderer and creates the necessary SVG groups for axes and grids.
     * @param svg The main SVG selection.
     * @param layout The chart layout dimensions.
     */
    constructor(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        _layout: IChartLayout
    ) {
        const chartArea = svg.select("g.chart-area").empty()
            ? svg.append("g").attr("class", "chart-area")
            : svg.select("g.chart-area");

        this.gridGroup = chartArea.select("g.grid").empty() ? chartArea.append("g").attr("class", `grid ${VisualConstants.ClassNames.Grid}`) : chartArea.select("g.grid");
        this.xAxisGroup = chartArea.select("g.x-axis").empty() ? chartArea.append("g").attr("class", `x-axis ${VisualConstants.ClassNames.Axis}`) : chartArea.select("g.x-axis");
        this.yAxisGroup = chartArea.select("g.y-axis").empty() ? chartArea.append("g").attr("class", `y-axis ${VisualConstants.ClassNames.Axis}`) : chartArea.select("g.y-axis");
        this.y2AxisGroup = chartArea.select("g.y2-axis").empty() ? chartArea.append("g").attr("class", `y2-axis ${VisualConstants.ClassNames.Axis}`) : chartArea.select("g.y2-axis");
    }

    /**
     * Renders all axes (X, Y, Y2) and gridlines based on the provided scales and settings.
     * 
     * @param xScale The D3 scale for the X-axis (Band scale).
     * @param yScale The D3 scale for the primary Y-axis (Linear scale).
     * @param y2Scale The D3 scale for the secondary Y-axis (Linear scale).
     * @param layout The chart layout dimensions.
     * @param settings The axes settings.
     * @param categories The array of category names for the X-axis.
     */
    public render(
        xScale: d3.ScaleBand<string>,
        yScale: d3.ScaleLinear<number, number>,
        y2Scale: d3.ScaleLinear<number, number>,
        layout: IChartLayout,
        settings: IAxesSettings,
        categories: string[]
    ): void {
        // Apply font styling to all axes
        [this.xAxisGroup, this.yAxisGroup, this.y2AxisGroup].forEach(group => {
            group.selectAll("text")
                .style("font-size", `${settings.fontSize}px`)
                .style("fill", settings.fontColor);
        });

        // Render X Axis
        if (settings.showXAxis) {
            this.xAxisGroup.attr("transform", `translate(0,${layout.innerHeight})`).style("display", null);
            const xAxis = d3.axisBottom(xScale);
            
            // Apply tick formatting and rotation
            this.xAxisGroup.call(xAxis);
            this.xAxisGroup.selectAll("text")
                .attr("transform", `rotate(${settings.xAxisLabelAngle})`)
                .style("text-anchor", settings.xAxisLabelAngle > 0 ? "start" : "middle")
                .text((d: d3.AxisDomain) => {
                    const label = String(d);
                    const bandwidth = xScale.bandwidth();
                    const charLimit = Math.max(5, Math.floor(bandwidth / 6));
                    return truncateText(label, charLimit);
                });

            // X Axis Title
            this.renderAxisTitle(this.xAxisGroup, settings.xAxisTitle, layout.innerWidth / 2, layout.innerHeight + 40, "middle");
        } else {
            this.xAxisGroup.style("display", "none");
        }

        // Render Primary Y Axis
        if (settings.showYAxis) {
            this.yAxisGroup.style("display", null);
            const yAxis = d3.axisLeft(yScale).ticks(5)
                .tickFormat((d: d3.NumberValue) => Formatter.formatValue(Number(d), 0, 0));
            
            this.yAxisGroup.call(yAxis);
            
            // Y Axis Title
            this.renderAxisTitle(this.yAxisGroup, settings.yAxisTitle, -layout.innerHeight / 2, -40, "middle", -90);
        } else {
            this.yAxisGroup.style("display", "none");
        }

        // Render Secondary Y Axis (Y2 - Percentage)
        if (settings.showY2Axis) {
            this.y2AxisGroup.attr("transform", `translate(${layout.innerWidth},0)`).style("display", null);
            const y2Axis = d3.axisRight(y2Scale).ticks(5)
                .tickFormat((d: d3.NumberValue) => Formatter.formatPercentage(Number(d), 0));
            
            this.y2AxisGroup.call(y2Axis);
            
            // Y2 Axis Title
            this.renderAxisTitle(this.y2AxisGroup, settings.y2AxisTitle, -layout.innerHeight / 2, 40, "middle", 90);
        } else {
            this.y2AxisGroup.style("display", "none");
        }

        // Render Gridlines
        if (settings.showGridLines) {
            this.gridGroup.style("display", null);
            const yGrid = d3.axisLeft(yScale).ticks(5).tickSize(-layout.innerWidth).tickFormat(() => "");
            this.gridGroup.call(yGrid);
            this.gridGroup.selectAll("line").style("stroke", "#eaeaea").style("stroke-dasharray", "2,2");
            this.gridGroup.select("path").remove(); // Remove axis line
        } else {
            this.gridGroup.style("display", "none");
        }
    }

    /**
     * Helper method to render or update an axis title.
     * 
     * @param axisGroup The SVG group of the axis.
     * @param title The title text.
     * @param x The X coordinate.
     * @param y The Y coordinate.
     * @param anchor The text anchor ('start', 'middle', 'end').
     * @param rotation Optional rotation angle.
     */
    private renderAxisTitle(
        axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
        title: string,
        x: number,
        y: number,
        anchor: string,
        rotation: number = 0
    ): void {
        const titleSelection = axisGroup.select("text.axis-title");
        if (title && title.trim().length > 0) {
            if (titleSelection.empty()) {
                axisGroup.append("text")
                    .attr("class", "axis-title")
                    .attr("fill", "#666")
                    .style("font-size", "12px")
                    .style("font-weight", "bold")
                    .text(title)
                    .attr("text-anchor", anchor)
                    .attr("x", x)
                    .attr("y", y)
                    .attr("transform", rotation ? `rotate(${rotation})` : null);
            } else {
                titleSelection
                    .text(title)
                    .attr("text-anchor", anchor)
                    .attr("x", x)
                    .attr("y", y)
                    .attr("transform", rotation ? `rotate(${rotation})` : null);
            }
        } else {
            titleSelection.remove();
        }
    }
}