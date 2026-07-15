import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

/**
 * Formatter class responsible for handling all numeric and string formatting
 * using Power BI's native formatting utilities to ensure consistency with the host.
 */
export class Formatter {
    /**
     * Formats a numeric value based on display units and decimal places.
     * 
     * @param value The numeric value to format.
     * @param displayUnits The display unit (0 for auto, 1000 for K, 1000000 for M, etc.).
     * @param decimalPlaces The number of decimal places.
     * @param formatString Optional Power BI format string (e.g., "#,0.00").
     * @returns The formatted string.
     */
    public static formatValue(
        value: number,
        displayUnits: number,
        decimalPlaces: number,
        formatString?: string
    ): string {
        if (value === null || value === undefined || isNaN(value)) {
            return "";
        }

        const options: valueFormatter.ValueFormatterOptions = {
            format: formatString ? formatString : "g",
            value: displayUnits > 0 ? displayUnits : value,
            displayUnits: displayUnits,
            precision: decimalPlaces,
            allowFormatBeOverwritten: true,
            columnType: { numeric: true }
        };

        const formatter = valueFormatter.create(options);
        return formatter.format(value);
    }

    /**
     * Formats a numeric value as a percentage.
     * 
     * @param value The numeric value (e.g., 80.5 for 80.5%).
     * @param decimalPlaces The number of decimal places.
     * @returns The formatted percentage string (e.g., "80.50%").
     */
    public static formatPercentage(value: number, decimalPlaces: number): string {
        if (value === null || value === undefined || isNaN(value)) {
            return "";
        }

        // Use standard formatting for percentage to ensure consistency
        const options: valueFormatter.ValueFormatterOptions = {
            format: "0.00%;-0.00%;0.00%",
            value: value,
            precision: decimalPlaces,
            displayUnits: 0
        };

        const formatter = valueFormatter.create(options);
        // Power BI's formatter expects decimal for percentage (e.g., 0.8 for 80%)
        // Since our calculations use 0-100 scale, we divide by 100 before formatting.
        return formatter.format(value / 100);
    }
}