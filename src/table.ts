import * as d3 from "d3";
import { IDataPoint, ITableSettings } from "./interfaces";
import { VisualConstants } from "./constants";
import { Formatter } from "./formatter";
import { escapeHtml } from "./utils";

/**
 * TableRenderer is responsible for rendering the summary table below the chart.
 * It displays detailed metrics (Category, Value, %, Running Total, ABC, Rank) and a Total row.
 */
export class TableRenderer {
    private tableContainer: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private table: d3.Selection<HTMLTableElement, unknown, null, undefined>;

    /**
     * Initializes the TableRenderer.
     * @param container The HTML container element where the table will be appended.
     */
    constructor(container: HTMLElement) {
        this.tableContainer = d3.select(container).select(`div.${VisualConstants.ClassNames.TableContainer}`).empty()
            ? d3.select(container).append("div").attr("class", VisualConstants.ClassNames.TableContainer)
            : d3.select(container).select(`div.${VisualConstants.ClassNames.TableContainer}`);

        this.table = this.tableContainer.select("table").empty()
            ? this.tableContainer.append("table").attr("class", VisualConstants.ClassNames.Table)
            : this.tableContainer.select("table");
    }

    /**
     * Renders the summary table based on the provided data and settings.
     * 
     * @param dataPoints The array of data points to display.
     * @param totalValue The total sum of all measure values (for the footer row).
     * @param settings The table settings.
     */
    public render(dataPoints: IDataPoint[], totalValue: number, settings: ITableSettings): void {
        if (!settings.show) {
            this.tableContainer.style("display", "none");
            return;
        }

        this.tableContainer.style("display", "block");

        // Apply global table styling
        this.table
            .style("font-size", `${settings.fontSize}px`)
            .style("color", settings.fontColor);

        // Render Header
        const header = this.table.select("thead").empty() ? this.table.append("thead") : this.table.select("thead");
        const headerRow = header.select("tr").empty() ? header.append("tr") : header.select("tr");
        
        const headers = ["Category", "Value", "Percent", "Running Total", "ABC", "Rank"];
        const headerCells = headerRow.selectAll("th").data(headers);
        
        headerCells.enter()
            .append("th")
            .merge(headerCells)
            .style("color", settings.headerColor)
            .style("background-color", settings.headerBackgroundColor)
            .text(d => d);

        // Render Body
        const tbody = this.table.select("tbody").empty() ? this.table.append("tbody") : this.table.select("tbody");
        const rows = tbody.selectAll("tr").data(dataPoints, (d: IDataPoint) => d.category);

        rows.exit().remove();

        const rowsEnter = rows.enter().append("tr");
        const mergedRows = rowsEnter.merge(rows);

        // Clear existing cells to prevent duplication on update, then append fresh
        mergedRows.selectAll("td").remove();

        // Append cells in order
        mergedRows.append("td").text(d => escapeHtml(d.category));
        mergedRows.append("td").text(d => Formatter.formatValue(d.value, 0, 2));
        mergedRows.append("td").text(d => Formatter.formatPercentage(d.individualPercentage, 2));
        mergedRows.append("td").text(d => Formatter.formatValue(d.cumulativeValue, 0, 2));
        mergedRows.append("td").text(d => d.abcClass);
        mergedRows.append("td").text(d => d.rank.toString());

        // Render Footer (Total Row)
        const tfoot = this.table.select("tfoot").empty() ? this.table.append("tfoot") : this.table.select("tfoot");
        const footerRow = tfoot.select("tr").empty() ? tfoot.append("tr") : tfoot.select("tr");
        
        const footerData = [
            "Total", 
            Formatter.formatValue(totalValue, 0, 2), 
            "100.00%", 
            Formatter.formatValue(totalValue, 0, 2), 
            "", 
            ""
        ];
        
        const footerCells = footerRow.selectAll("td").data(footerData);
        footerCells.enter()
            .append("td")
            .merge(footerCells)
            .text(d => d);
    }
}