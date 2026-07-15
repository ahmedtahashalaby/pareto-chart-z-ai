import * as d3 from "d3";
import { IDataPoint, IParetoLineSettings, IAnimationSettings } from "./interfaces";
import { VisualConstants } from "./constants";

/**
 * LineRenderer is responsible for rendering the Pareto cumulative percentage line,
 * including the line path and optional markers (circle, square, diamond).
 */
export class LineRenderer {
    private lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private markersGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    /**
     * Initializes the LineRenderer and appends the necessary SVG groups.
     * @param svg The main SVG selection.
     */
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        const chartArea = svg.select("g.chart-area");
        
        this.lineGroup = chartArea.select("g.pareto-line").empty()
            ? chartArea.append("g").attr("class", `pareto-line ${VisualConstants.ClassNames.Line}`)
            : chartArea.select("g.pareto-line");

        this.markersGroup = chartArea.select("g.pareto-markers").empty()
            ? chartArea.append("g").attr("class", "pareto-markers")
            : chartArea.select("g.pareto-markers");
    }

    /**
     * Renders the Pareto line and markers based on the provided data and scales.
     * 
     * @param dataPoints The array of data points to render.
     * @param xScale The D3 band scale for the X-axis.
     * @param y2Scale The D3 linear scale for the secondary Y-axis (percentage).
     * @param settings The Pareto line settings.
     * @param animationSettings The animation settings.
     * @param hasSelection Indicates if there is an active selection.
     */
    public render(
        dataPoints: IDataPoint[],
        xScale: d3.ScaleBand<string>,
        y2Scale: d3.ScaleLinear<number, number>,
        settings: IParetoLineSettings,
        animationSettings: IAnimationSettings,
        hasSelection: boolean
    ): void {
        if (!settings.show) {
            this.lineGroup.style("display", "none");
            this.markersGroup.style("display", "none");
            return;
        }

        this.lineGroup.style("display", null);
        this.markersGroup.style("display", null);

        // Define the line generator
        const lineGen = d3.line<IDataPoint>()
            .x((d: IDataPoint) => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
            .y((d: IDataPoint) => y2Scale(d.cumulativePercentage))
            .curve(settings.smooth ? d3.curveMonotoneX : d3.curveLinear);

        // Bind data to path
        const path = this.lineGroup.selectAll<SVGPathElement, IDataPoint[]>(`path.${VisualConstants.ClassNames.Line}`)
            .data([dataPoints]);

        // Enter
        const pathEnter = path.enter()
            .append("path")
            .attr("class", VisualConstants.ClassNames.Line)
            .attr("fill", "none")
            .attr("stroke", settings.lineColor)
            .attr("stroke-width", settings.lineWidth)
            .style("opacity", 0);

        // Update + Enter
        const mergedPath = pathEnter.merge(path);

        // Apply animation or direct attributes
        if (animationSettings.enable) {
            const totalLength = (mergedPath.node() as SVGPathElement)?.getTotalLength() || 1000;
            mergedPath
                .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(animationSettings.duration)
                .ease(d3.easeCubicInOut)
                .attr("stroke-dashoffset", 0)
                .style("opacity", 1);
        } else {
            mergedPath
                .attr("stroke-dasharray", "none")
                .attr("stroke-dashoffset", 0)
                .style("opacity", 1);
        }

        // Update path data
        mergedPath.attr("d", lineGen);

        // Render Markers
        if (settings.markerShape !== "none") {
            this.renderMarkers(dataPoints, xScale, y2Scale, settings, animationSettings, hasSelection);
        } else {
            this.markersGroup.selectAll("*").remove();
        }
    }

    /**
     * Renders the markers on the Pareto line.
     * 
     * @param dataPoints The array of data points to render.
     * @param xScale The D3 band scale for the X-axis.
     * @param y2Scale The D3 linear scale for the secondary Y-axis.
     * @param settings The Pareto line settings.
     * @param animationSettings The animation settings.
     * @param hasSelection Indicates if there is an active selection.
     */
    private renderMarkers(
        dataPoints: IDataPoint[],
        xScale: d3.ScaleBand<string>,
        y2Scale: d3.ScaleLinear<number, number>,
        settings: IParetoLineSettings,
        animationSettings: IAnimationSettings,
        hasSelection: boolean
    ): void {
        const markers = this.markersGroup.selectAll<SVGPathElement, IDataPoint>(`path.${VisualConstants.ClassNames.Marker}`)
            .data(dataPoints, (d: IDataPoint) => d.category);

        // Exit
        markers.exit().remove();

        // Enter
        const markersEnter = markers.enter()
            .append("path")
            .attr("class", VisualConstants.ClassNames.Marker)
            .style("pointer-events", "none") // Let bars handle mouse events
            .attr("fill", settings.markerColor)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

        // Update + Enter
        const mergedMarkers = markersEnter.merge(markers);

        // Apply shape based on settings
        const symbolGen = d3.symbol().size(settings.markerSize * 4); // Multiply for better visual size
        switch (settings.markerShape) {
            case "circle":
                symbolGen.type(d3.symbolCircle);
                break;
            case "square":
                symbolGen.type(d3.symbolSquare);
                break;
            case "diamond":
                symbolGen.type(d3.symbolDiamond);
                break;
            default:
                symbolGen.type(d3.symbolCircle);
        }

        // Apply attributes and animations
        if (animationSettings.enable) {
            mergedMarkers
                .transition()
                .duration(animationSettings.duration)
                .ease(d3.easeCubicOut)
                .attr("d", symbolGen)
                .attr("transform", (d: IDataPoint) => `translate(${(xScale(d.category) || 0) + xScale.bandwidth() / 2}, ${y2Scale(d.cumulativePercentage)})`)
                .style("opacity", (d: IDataPoint) => (hasSelection && !d.selected ? 0.3 : 1));
        } else {
            mergedMarkers
                .attr("d", symbolGen)
                .attr("transform", (d: IDataPoint) => `translate(${(xScale(d.category) || 0) + xScale.bandwidth() / 2}, ${y2Scale(d.cumulativePercentage)})`)
                .style("opacity", (d: IDataPoint) => (hasSelection && !d.selected ? 0.3 : 1));
        }
    }
}