import * as d3 from "d3";
import { ParetoProSettings, IChartLayout } from "./interfaces";
import { VisualConstants } from "./constants";

/**
 * Utility functions for the Pareto Pro visual.
 */

/**
 * Converts a hex color string to an RGB object.
 * 
 * @param hex The hex color string (e.g., "#RRGGBB").
 * @returns An object with r, g, b properties.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          }
        : { r: 0, g: 0, b: 0 };
}

/**
 * Calculates an RGBA color string from a hex color and a transparency value.
 * 
 * @param hex The hex color string.
 * @param transparency The transparency percentage (0-100).
 * @returns An RGBA color string (e.g., "rgba(255, 0, 0, 0.5)").
 */
export function calculateColorWithOpacity(hex: string, transparency: number): string {
    const rgb = hexToRgb(hex);
    const alpha = 1 - (transparency / 100);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Creates or updates an SVG linear gradient.
 * 
 * @param svg The main SVG selection.
 * @param id The unique ID for the gradient.
 * @param startColor The starting color of the gradient.
 * @param endColor The ending color of the gradient.
 */
export function createGradient(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    id: string,
    startColor: string,
    endColor: string
): void {
    const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
    
    const gradient = defs.select(`#${id}`).empty()
        ? defs.append("linearGradient").attr("id", id)
        : defs.select(`#${id}`);
        
    gradient.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");

    gradient.selectAll("stop").remove();
    gradient.append("stop").attr("offset", "0%").attr("stop-color", startColor);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", endColor);
}

/**
 * Truncates a text string if it exceeds a maximum length.
 * 
 * @param text The text to truncate.
 * @param maxChars The maximum allowed characters.
 * @returns The truncated text with "..." if necessary.
 */
export function truncateText(text: string, maxChars: number): string {
    if (text && text.length > maxChars) {
        return text.substring(0, maxChars - 3) + "...";
    }
    return text;
}

/**
 * Calculates the layout dimensions for the chart based on viewport and settings.
 * 
 * @param viewportWidth The total width of the visual viewport.
 * @param viewportHeight The total height of the visual viewport.
 * @param settings The visual settings.
 * @param hasLegend Indicates if the legend is visible.
 * @param hasCards Indicates if KPI cards are visible.
 * @param hasTable Indicates if the summary table is visible.
 * @returns An IChartLayout object with calculated dimensions.
 */
export function calculateLayout(
    viewportWidth: number,
    viewportHeight: number,
    settings: ParetoProSettings,
    hasLegend: boolean,
    hasCards: boolean,
    hasTable: boolean
): IChartLayout {
    let availableHeight = viewportHeight;
    let availableWidth = viewportWidth;

    if (hasCards && settings.cards.show) {
        availableHeight -= 60; // Approximate height of cards row
    }
    if (hasTable && settings.table.show) {
        availableHeight -= 180; // Approximate height of table
    }
    if (hasLegend && settings.legend.show) {
        if (settings.legend.position === "top" || settings.legend.position === "bottom") {
            availableHeight -= 30;
        } else {
            availableWidth -= 80;
        }
    }

    availableHeight = Math.max(availableHeight, 100);
    availableWidth = Math.max(availableWidth, 100);

    const margin = {
        top: VisualConstants.DefaultMargin.top,
        right: VisualConstants.DefaultMargin.right,
        bottom: VisualConstants.DefaultMargin.bottom,
        left: VisualConstants.DefaultMargin.left
    };

    // Hide secondary Y axis if setting is off, save space
    if (!settings.axes.showY2Axis) {
        margin.right = 10;
    }
    if (!settings.axes.showYAxis) {
        margin.left = 10;
    }
    if (!settings.axes.showXAxis) {
        margin.bottom = 10;
    }

    return {
        width: availableWidth,
        height: availableHeight,
        margin,
        innerWidth: Math.max(10, availableWidth - margin.left - margin.right),
        innerHeight: Math.max(10, availableHeight - margin.top - margin.bottom)
    };
}

/**
 * Determines the appropriate text color (black or white) based on background luminance.
 * 
 * @param hexBackgroundColor The background hex color.
 * @returns "#000000" or "#FFFFFF".
 */
export function getContrastTextColor(hexBackgroundColor: string): string {
    const rgb = hexToRgb(hexBackgroundColor);
    // Standard luminance calculation
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * 
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function escapeHtml(str: string): string {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}