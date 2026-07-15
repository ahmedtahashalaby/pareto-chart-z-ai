import powerbi from "powerbi-visuals-api";
import { IDataPoint } from "./interfaces";

/**
 * Manages Power BI selection state, cross-filtering, and bookmark integration.
 * Encapsulates the native Power BI ISelectionManager to handle interactions cleanly.
 */
export class VisualSelectionManager {
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private selectionIds: powerbi.extensibility.ISelectionId[] = [];

    /**
     * Initializes a new instance of the VisualSelectionManager.
     * @param host The Power BI visual host services.
     */
    constructor(host: powerbi.extensibility.visual.IVisualHost) {
        this.selectionManager = host.createSelectionManager();
        
        // Register callback for bookmark and external selection changes
        this.selectionManager.registerOnSelectCallback((ids: powerbi.extensibility.ISelectionId[]) => {
            this.handleExternalSelection(ids);
        });
    }

    /**
     * Handles selection changes originating from bookmarks or other visuals.
     * @param ids The array of selection IDs from the external source.
     */
    private handleExternalSelection(ids: powerbi.extensibility.ISelectionId[]): void {
        this.selectionIds = ids || [];
        // The visual's update method will be called automatically by Power BI,
        // which will read the current selection state using hasSelection().
    }

    /**
     * Selects or deselects a specific data point.
     * Supports Ctrl+Click (multi-select) based on the Power BI native behavior.
     * 
     * @param dataPoint The data point to select.
     * @param multiSelect Whether multi-select is active (Ctrl key pressed).
     */
    public select(dataPoint: IDataPoint, multiSelect: boolean): void {
        const id = dataPoint.identity;
        
        if (!id) {
            return;
        }

        // Check if already selected
        const isAlreadySelected = this.selectionIds.some(selectedId => selectedId.equals(id));

        if (isAlreadySelected) {
            // Deselect if multi-selecting, otherwise clear and select just this one
            if (multiSelect) {
                this.selectionIds = this.selectionIds.filter(selectedId => !selectedId.equals(id));
            } else {
                this.selectionIds = [];
            }
        } else {
            if (!multiSelect) {
                this.selectionIds = [];
            }
            this.selectionIds.push(id);
        }

        // Apply to Power BI (triggers cross-filtering and bookmark updates)
        this.selectionManager.select(this.selectionIds, multiSelect);
    }

    /**
     * Clears all current selections.
     */
    public clear(): void {
        this.selectionIds = [];
        this.selectionManager.clear();
    }

    /**
     * Checks if a specific data point is currently selected.
     * @param dataPoint The data point to check.
     * @returns True if the data point is selected or if no selection exists (default state).
     */
    public isSelected(dataPoint: IDataPoint): boolean {
        if (!this.hasSelection()) {
            return true; // If nothing is selected, everything is "selected" (full opacity)
        }
        return this.selectionIds.some(id => id.equals(dataPoint.identity));
    }

    /**
     * Determines if there are any active selections.
     * @returns True if there is at least one active selection.
     */
    public hasSelection(): boolean {
        return this.selectionIds.length > 0;
    }

    /**
     * Gets the array of currently selected IDs.
     * @returns Array of Power BI Selection IDs.
     */
    public getSelectionIds(): powerbi.extensibility.ISelectionId[] {
        return this.selectionIds;
    }

    /**
     * Synchronizes the selection state with an array of data points.
     * This is used to apply the 'selected' flag to the data model before rendering.
     * 
     * @param dataPoints The data points to update.
     * @returns The updated data points with selection state applied.
     */
    public applySelectionState(dataPoints: IDataPoint[]): IDataPoint[] {
        const hasSelection = this.hasSelection();
        return dataPoints.map(dp => {
            dp.selected = !hasSelection || this.selectionIds.some(id => id.equals(dp.identity));
            return dp;
        });
    }
}