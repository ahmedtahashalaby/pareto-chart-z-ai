import powerbi from "powerbi-visuals-api";
import { VisualConstructorOptions, VisualUpdateOptions } from "powerbi-visuals-api";
import { DataProcessor } from "./dataProcessor";
import { DefaultSettings, parseSettings } from "./settings";
import { VisualRenderer } from "./renderer";
import { VisualSelectionManager } from "./selection";
import { VisualFormattingModel } from "./model";
import { ParetoProSettings } from "./interfaces";

/**
 * The main entry point for the Pareto Pro Power BI Custom Visual.
 * Implements the IVisual interface required by the Power BI Visual SDK.
 */
export class Visual implements powerbi.extensibility.IVisual {
    private host: powerbi.extensibility.visual.IVisualHost;
    private settings: ParetoProSettings = DefaultSettings;
    private selectionManager: VisualSelectionManager;
    private renderer: VisualRenderer;
    private formattingModelService: VisualFormattingModel;

    /**
     * Initializes a new instance of the Visual class.
     * Sets up the host services, selection manager, renderer, and formatting model.
     * @param options The constructor options provided by Power BI.
     */
    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        
        // Initialize the custom selection manager (handles cross-filtering & bookmarks)
        this.selectionManager = new VisualSelectionManager(this.host);
        
        // Initialize the rendering engine
        this.renderer = new VisualRenderer(
            options.element,
            this.host.tooltipService,
            this.selectionManager
        );
        
        // Initialize the formatting model builder for the format pane
        this.formattingModelService = new VisualFormattingModel();
    }

    /**
     * Called by Power BI whenever there is a change in the data, settings, or viewport.
     * Parses settings, processes data, and delegates rendering to the VisualRenderer.
     * @param options The update options provided by Power BI.
     */
    public update(options: VisualUpdateOptions): void {
        // Ensure we have valid data views before proceeding
        if (!options || !options.dataViews || options.dataViews.length === 0 || !options.dataViews[0]) {
            this.renderer.clear();
            return;
        }

        const dataView = options.dataViews[0];

        // Parse formatting settings from the data view
        this.settings = parseSettings(dataView);

        // Process the data into a view model
        const viewModel = DataProcessor.process(dataView, this.settings, this.host);

        // Render the visual
        this.renderer.update(viewModel, options.viewport);
    }

    /**
     * Builds and returns the formatting model for the visual's format pane.
     * This method is called by Power BI to populate the formatting options.
     * @returns The Power BI FormattingModel.
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingModelService.buildFormattingModel(this.settings);
    }

    /**
     * Called by Power BI when the visual is removed from the report.
     * Used for cleaning up event listeners and resources.
     */
    public destroy(): void {
        // Perform any necessary cleanup here (e.g., removing DOM elements, event listeners)
        // D3 handles most of the DOM cleanup automatically, but it's good practice to nullify references.
        this.renderer.clear();
    }
}