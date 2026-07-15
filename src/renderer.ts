import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import { IViewModel, IChartLayout, IDataPoint } from "./interfaces";
import { VisualConstants } from "./constants";
import { calculateLayout } from "./utils";
import { AxisRenderer } from "./axis";
import { BarsRenderer } from "./bars";
import { LineRenderer } from "./line";
import { TargetLineRenderer } from "./targetLine";
import { LabelsRenderer } from "./labels";
import { TableRenderer } from "./table";
import { CardsRenderer } from "./cards";
import { TooltipRenderer } from "./tooltip";
import { VisualSelectionManager } from "./selection";

/**
 * VisualRenderer acts as the central orchestrator for all drawing operations.
 * It manages the main SVG element, calculates layouts, and delegates rendering
 * tasks to specialized sub-renderers (Bars, Line, Axes, Cards, Table, etc.).
 */
export class VisualRenderer {
    private container: HTMLElement;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private chartArea: d3.Selection<SVGGElement, unknown, null, undefined>;
    
    private axisRenderer: AxisRenderer;
    private barsRenderer: BarsRenderer;
    private lineRenderer: LineRenderer;
    private targetLineRenderer: TargetLineRenderer;
    private labelsRenderer: LabelsRenderer;
    private cardsRenderer: CardsRenderer;
    private tableRenderer: TableRenderer;
    private tooltipRenderer: TooltipRenderer;
    private selectionManager: VisualSelectionManager;

    /**
     * Initializes the VisualRenderer and sets up the core DOM elements and sub-renderers.
     * 
     * @param container The root HTML element provided by Power BI.
     * @param tooltipService The Power BI tooltip service.
     * @param selectionManager The visual's selection manager.
     */
    constructor(
        container: HTMLElement,
        tooltipService: powerbi.extensibility.ITooltipService,
        selectionManager: VisualSelectionManager
    ) {
        this.container = container;
        this.selectionManager = selectionManager;
        
        // Setup main container class
        d3.select(this.container).attr("class", VisualConstants.ClassNames.Container);

        // Initialize SVG
        this.svg = d3.select(this.container).select(`svg.${VisualConstants.ClassNames.SVG}`).empty()
            ? d3.select(this.container).append("svg").attr("class", VisualConstants.ClassNames.SVG)
            : d3.select(this.container).select(`svg.${VisualConstants.ClassNames.SVG}`);

        // Initialize Chart Area group inside SVG
        this.chartArea = this.svg.select("g.chart-area").empty()
            ? this.svg.append("g").attr("class", "chart-area")
            : this.svg.select("g.chart-area");

        // Initialize Sub-renderers
        this.axisRenderer = new AxisRenderer(this.svg, this.getDummyLayout());
        this.barsRenderer = new BarsRenderer(this.svg, this.getDummyLayout());
        this.lineRenderer = new LineRenderer(this.svg);
        this.targetLineRenderer = new TargetLineRenderer(this.svg);
        this.labelsRenderer = new LabelsRenderer(this.svg);
        
        // HTML-based renderers
        this.cardsRenderer = new CardsRenderer(this.container);
        this.tableRenderer = new TableRenderer(this.container);
        this.tooltipRenderer = new TooltipRenderer(tooltipService);
    }

    /**
     * Main update method called by the visual to re-render everything based on the new data.
     * 
     * @param viewModel The processed view model containing data and settings.
     * @param viewport The current viewport dimensions.
     */
    public update(viewModel: IViewModel, viewport: powerbi.IViewport): void {
        if (!viewModel.hasData || viewModel.dataPoints.length === 0) {
            this.clear();
            this.renderNoDataMessage();
            return;
        }

        // Clear any previous error/no-data messages
        d3.select(this.container).selectAll("p.no-data-message").remove();

        // Apply selection state to data points
        viewModel.dataPoints = this.selectionManager.applySelectionState(viewModel.dataPoints);
        const hasSelection = this.selectionManager.hasSelection();

        // Render HTML Components (Cards and Table)
        this.cardsRenderer.render(
            viewModel.dataPoints,
            viewModel.totalValue,
            viewModel.targetPercentage,
            viewModel.settings.cards
        );

        this.tableRenderer.render(
            viewModel.dataPoints,
            viewModel.totalValue,
            viewModel.settings.table
        );

        // Calculate layout based on what components are visible
        const layout = calculateLayout(
            viewport.width,
            viewport.height,
            viewModel.settings,
            false, // Legend is not implemented in this version for simplicity, can be expanded
            viewModel.settings.cards.show,
            viewModel.settings.table.show
        );

        // Update SVG dimensions and chart area transform
        this.svg.attr("width", layout.width).attr("height", layout.height);
        this.chartArea.attr("transform", `translate(${layout.margin.left},${layout.margin.top})`);

        // Create D3 Scales
        const xScale = d3.scaleBand<string>()
            .domain(viewModel.dataPoints.map(d => d.category))
            .range([0, layout.innerWidth])
            .padding(viewModel.settings.bars.barGap);

        // Ensure maxValue is at least 1 to prevent invalid scale domains
        const maxY = Math.max(viewModel.maxValue * 1.1, 1); 
        
        const yScale = d3.scaleLinear()
            .domain([0, maxY])
            .range([layout.innerHeight, 0]);

        const y2Scale = d3.scaleLinear()
            .domain([0, 100]) // Pareto line is always 0-100%
            .range([layout.innerHeight, 0]);

        // Render SVG Components
        this.axisRenderer.render(xScale, yScale, y2Scale, layout, viewModel.settings.axes, viewModel.dataPoints.map(d => d.category));
        
        this.barsRenderer.render(
            viewModel.dataPoints,
            xScale,
            yScale,
            viewModel.settings.bars,
            viewModel.settings.animation,
            hasSelection,
            layout
        );

        this.lineRenderer.render(
            viewModel.dataPoints,
            xScale,
            y2Scale,
            viewModel.settings.paretoLine,
            viewModel.settings.animation,
            hasSelection
        );

        this.targetLineRenderer.render(
            y2Scale,
            layout,
            viewModel.settings.targetLine,
            viewModel.settings.animation
        );

        this.labelsRenderer.render(
            viewModel.dataPoints,
            xScale,
            yScale,
            viewModel.settings.labels,
            viewModel.settings.animation,
            hasSelection
        );

        // Bind interactive events to bars
        this.bindInteractivity();
    }

    /**
     * Binds mouse events (click, mouseover, mouseout, context menu) to the rendered bars.
     */
    private bindInteractivity(): void {
        const self = this;
        const bars = this.svg.selectAll<SVGRectElement, IDataPoint>(`rect.${VisualConstants.ClassNames.Bar}`);

        bars
            .on("click", function(event: MouseEvent, d: IDataPoint) {
                event.preventDefault();
                event.stopPropagation();
                self.selectionManager.select(d, event.ctrlKey || event.metaKey);
            })
            .on("mouseover", function(event: MouseEvent, d: IDataPoint) {
                if (!d.isOthers) {
                    self.tooltipRenderer.showTooltip(event, d);
                }
            })
            .on("mouseout", function() {
                self.tooltipRenderer.hideTooltip();
            })
            .on("contextmenu", function(event: MouseEvent, d: IDataPoint) {
                event.preventDefault();
                // Power BI context menu handling could be added here if needed
            });
    }

    /**
     * Renders a standard message when there is no data to display.
     */
    private renderNoDataMessage(): void {
        d3.select(this.container)
            .append("p")
            .attr("class", "no-data-message")
            .style("text-align", "center")
            .style("margin-top", "40px")
            .style("font-family", "Segoe UI, sans-serif")
            .style("color", "#666")
            .text("No data available. Please assign a Category and a Measure.");
    }

    /**
     * Clears all rendered elements from the visual.
     */
    public clear(): void {
        this.svg.selectAll("*").remove();
        d3.select(this.container).select(`div.${VisualConstants.ClassNames.CardsContainer}`).remove();
        d3.select(this.container).select(`div.${VisualConstants.ClassNames.TableContainer}`).remove();
        d3.select(this.container).selectAll("p.no-data-message").remove();
        
        // Re-append chart area since we removed all children from SVG
        this.chartArea = this.svg.append("g").attr("class", "chart-area");
        
        // Re-initialize renderers as their base groups were removed
        this.axisRenderer = new AxisRenderer(this.svg, this.getDummyLayout());
        this.barsRenderer = new BarsRenderer(this.svg, this.getDummyLayout());
        this.lineRenderer = new LineRenderer(this.svg);
        this.targetLineRenderer = new TargetLineRenderer(this.svg);
        this.labelsRenderer = new LabelsRenderer(this.svg);
        this.cardsRenderer = new CardsRenderer(this.container);
        this.tableRenderer = new TableRenderer(this.container);
    }

    /**
     * Provides a dummy layout for initial renderer instantiation.
     * @returns A default IChartLayout object.
     */
    private getDummyLayout(): IChartLayout {
        return {
            width: 0,
            height: 0,
            margin: VisualConstants.DefaultMargin,
            innerWidth: 0,
            innerHeight: 0
        };
    }
}