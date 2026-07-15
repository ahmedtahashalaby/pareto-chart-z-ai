import * as d3 from "d3";
import { IDataPoint, ICardsSettings } from "./interfaces";
import { VisualConstants } from "./constants";
import { Formatter } from "./formatter";

/**
 * CardsRenderer is responsible for rendering the top KPI cards.
 * It displays key metrics: Total Defects, Top 80% Causes, Current Cumulative %, and Target %.
 */
export class CardsRenderer {
    private cardsContainer: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    /**
     * Initializes the CardsRenderer.
     * @param container The HTML container element where the cards will be appended.
     */
    constructor(container: HTMLElement) {
        // Ensure the cards container is the first element in the visual container
        this.cardsContainer = d3.select(container).select(`div.${VisualConstants.ClassNames.CardsContainer}`).empty()
            ? d3.select(container).insert("div", ":first-child").attr("class", VisualConstants.ClassNames.CardsContainer)
            : d3.select(container).select(`div.${VisualConstants.ClassNames.CardsContainer}`);
    }

    /**
     * Renders the KPI cards based on the provided data and settings.
     * 
     * @param dataPoints The array of data points to derive metrics from.
     * @param totalValue The total sum of all measure values.
     * @param targetPercentage The target cumulative percentage (e.g., 80).
     * @param settings The cards settings.
     */
    public render(
        dataPoints: IDataPoint[],
        totalValue: number,
        targetPercentage: number,
        settings: ICardsSettings
    ): void {
        if (!settings.show) {
            this.cardsContainer.style("display", "none");
            return;
        }

        this.cardsContainer.style("display", "flex");

        // Calculate KPI values
        const top80Causes = dataPoints.filter(d => d.abcClass === "A").length;
        
        // "Current Cumulative %" represents the cumulative percentage achieved by the top 80% causes.
        // If no class A items exist, it falls back to the max cumulative percentage in the data.
        const classAItems = dataPoints.filter(d => d.abcClass === "A");
        const currentCumulative = classAItems.length > 0 
            ? classAItems[classAItems.length - 1].cumulativePercentage 
            : (dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].cumulativePercentage : 0);

        // Define the 4 KPI cards
        const cardsData = [
            {
                title: "Total Defects",
                value: Formatter.formatValue(totalValue, 0, 0)
            },
            {
                title: "Top 80% Causes",
                value: top80Causes.toString()
            },
            {
                title: "Current Cumulative %",
                value: Formatter.formatPercentage(currentCumulative, 1)
            },
            {
                title: "Target %",
                value: Formatter.formatPercentage(targetPercentage, 0)
            }
        ];

        // Bind data to cards
        const cards = this.cardsContainer.selectAll(`div.${VisualConstants.ClassNames.Card}`).data(cardsData);

        // Exit
        cards.exit().remove();

        // Enter
        const cardsEnter = cards.enter()
            .append("div")
            .attr("class", VisualConstants.ClassNames.Card);

        cardsEnter.append("div").attr("class", VisualConstants.ClassNames.CardTitle);
        cardsEnter.append("div").attr("class", VisualConstants.ClassNames.CardValue);

        // Update + Enter
        const mergedCards = cardsEnter.merge(cards);

        // Apply styling
        mergedCards
            .style("background-color", settings.backgroundColor)
            .style("color", settings.fontColor);

        // Update content
        mergedCards.select(`div.${VisualConstants.ClassNames.CardTitle}`)
            .text(d => d.title)
            .style("color", settings.fontColor)
            .style("opacity", 0.7); // Slightly dim the title

        mergedCards.select(`div.${VisualConstants.ClassNames.CardValue}`)
            .text(d => d.value)
            .style("font-size", `${settings.fontSize}px`)
            .style("color", settings.fontColor);
    }
}