import powerbi from "powerbi-visuals-api";
import { ParetoProSettings } from "./interfaces";
import { VisualConstants } from "./constants";

/**
 * Default settings for the Pareto Pro visual.
 * These values are used when no user-defined settings are present in the format pane.
 */
export const DefaultSettings: ParetoProSettings = {
    theme: {
        mode: "auto"
    },
    bars: {
        fillColor: "#1F77B4",
        transparency: 0,
        strokeColor: "#FFFFFF",
        strokeWidth: 0,
        cornerRadius: 4,
        barGap: 0.2,
        gradientEnabled: false,
        gradientStartColor: VisualConstants.DefaultGradientColors.start,
        gradientEndColor: VisualConstants.DefaultGradientColors.end,
        abcColorsEnabled: false,
        colorA: VisualConstants.DefaultABCColors.A,
        colorB: VisualConstants.DefaultABCColors.B,
        colorC: VisualConstants.DefaultABCColors.C
    },
    paretoLine: {
        show: true,
        lineColor: "#D62728",
        lineWidth: 2,
        smooth: false,
        markerShape: "circle",
        markerSize: 5,
        markerColor: "#D62728"
    },
    targetLine: {
        show: true,
        value: VisualConstants.DefaultTargetPercentage,
        lineColor: "#888888",
        lineWidth: 2,
        dashArray: "5,5",
        label: "Target (80%)"
    },
    labels: {
        show: false,
        position: "outside",
        color: "#333333",
        fontSize: 10,
        displayUnits: 0,
        decimalPlaces: 0
    },
    cards: {
        show: true,
        backgroundColor: "#FFFFFF",
        fontColor: "#333333",
        fontSize: 14
    },
    legend: {
        show: false,
        position: "top",
        fontColor: "#666666",
        fontSize: 12
    },
    table: {
        show: false,
        fontColor: "#666666",
        fontSize: 12,
        headerColor: "#333333",
        headerBackgroundColor: "#F8F8F8"
    },
    animation: {
        enable: true,
        duration: VisualConstants.AnimationDefaults.duration,
        type: VisualConstants.AnimationDefaults.type as "fade" | "grow" | "slide"
    },
    axes: {
        showXAxis: true,
        showYAxis: true,
        showY2Axis: true,
        xAxisTitle: "",
        yAxisTitle: "",
        y2AxisTitle: "Cumulative %",
        showGridLines: true,
        fontSize: 11,
        fontColor: "#666666",
        xAxisLabelAngle: 0
    }
};

/**
 * Retrieves a specific property from the Power BI DataView objects.
 */
function getObjectValue<T>(objects: powerbi.DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
    if (objects && objects[objectName] && objects[objectName][propertyName] !== undefined) {
        return <T>objects[objectName][propertyName];
    }
    return defaultValue;
}

/**
 * Extracts a hex color string from a Power BI fill property.
 * Fill values are stored as { solid: { color: "#RRGGBB" } } in the data view.
 */
function getFillColor(objects: powerbi.DataViewObjects, objectName: string, propertyName: string, defaultValue: string): string {
    const raw = getObjectValue<unknown>(objects, objectName, propertyName, null);
    if (typeof raw === "string") {
        return raw;
    }
    if (raw && typeof raw === "object" && "solid" in raw) {
        const solid = (raw as { solid?: { color?: string } }).solid;
        if (solid?.color) {
            return solid.color;
        }
    }
    return defaultValue;
}

/**
 * Extracts an enumeration value from a Power BI enum property.
 */
function getEnumValue(objects: powerbi.DataViewObjects, objectName: string, propertyName: string, defaultValue: string): string {
    const raw = getObjectValue<unknown>(objects, objectName, propertyName, null);
    if (typeof raw === "string") {
        return raw;
    }
    if (raw && typeof raw === "object" && "value" in raw) {
        const value = (raw as { value?: string }).value;
        if (typeof value === "string") {
            return value;
        }
    }
    return defaultValue;
}

/**
 * Parses the Power BI DataView objects into a strongly typed ParetoProSettings object.
 * Uses the Formatting Model API structure provided by Power BI.
 * 
 * @param dataView The Power BI DataView.
 * @returns A populated ParetoProSettings object.
 */
export function parseSettings(dataView: powerbi.DataView): ParetoProSettings {
    const objects: powerbi.DataViewObjects = dataView.metadata ? dataView.metadata.objects : {};

    const settings: ParetoProSettings = {
        theme: {
            mode: getEnumValue(objects, "theme", "mode", DefaultSettings.theme.mode) as ParetoProSettings["theme"]["mode"]
        },
        bars: {
            fillColor: getFillColor(objects, "bars", "fillColor", DefaultSettings.bars.fillColor),
            transparency: getObjectValue(objects, "bars", "transparency", DefaultSettings.bars.transparency),
            strokeColor: getFillColor(objects, "bars", "strokeColor", DefaultSettings.bars.strokeColor),
            strokeWidth: getObjectValue(objects, "bars", "strokeWidth", DefaultSettings.bars.strokeWidth),
            cornerRadius: getObjectValue(objects, "bars", "cornerRadius", DefaultSettings.bars.cornerRadius),
            barGap: getObjectValue(objects, "bars", "barGap", DefaultSettings.bars.barGap),
            gradientEnabled: getObjectValue(objects, "bars", "gradientEnabled", DefaultSettings.bars.gradientEnabled),
            gradientStartColor: getFillColor(objects, "bars", "gradientStartColor", DefaultSettings.bars.gradientStartColor),
            gradientEndColor: getFillColor(objects, "bars", "gradientEndColor", DefaultSettings.bars.gradientEndColor),
            abcColorsEnabled: getObjectValue(objects, "bars", "abcColorsEnabled", DefaultSettings.bars.abcColorsEnabled),
            colorA: getFillColor(objects, "bars", "colorA", DefaultSettings.bars.colorA),
            colorB: getFillColor(objects, "bars", "colorB", DefaultSettings.bars.colorB),
            colorC: getFillColor(objects, "bars", "colorC", DefaultSettings.bars.colorC)
        },
        paretoLine: {
            show: getObjectValue(objects, "paretoLine", "show", DefaultSettings.paretoLine.show),
            lineColor: getFillColor(objects, "paretoLine", "lineColor", DefaultSettings.paretoLine.lineColor),
            lineWidth: getObjectValue(objects, "paretoLine", "lineWidth", DefaultSettings.paretoLine.lineWidth),
            smooth: getObjectValue(objects, "paretoLine", "smooth", DefaultSettings.paretoLine.smooth),
            markerShape: getEnumValue(objects, "paretoLine", "markerShape", DefaultSettings.paretoLine.markerShape) as ParetoProSettings["paretoLine"]["markerShape"],
            markerSize: getObjectValue(objects, "paretoLine", "markerSize", DefaultSettings.paretoLine.markerSize),
            markerColor: getFillColor(objects, "paretoLine", "markerColor", DefaultSettings.paretoLine.markerColor)
        },
        targetLine: {
            show: getObjectValue(objects, "targetLine", "show", DefaultSettings.targetLine.show),
            value: getObjectValue(objects, "targetLine", "value", DefaultSettings.targetLine.value),
            lineColor: getFillColor(objects, "targetLine", "lineColor", DefaultSettings.targetLine.lineColor),
            lineWidth: getObjectValue(objects, "targetLine", "lineWidth", DefaultSettings.targetLine.lineWidth),
            dashArray: getEnumValue(objects, "targetLine", "dashArray", DefaultSettings.targetLine.dashArray),
            label: getObjectValue(objects, "targetLine", "label", DefaultSettings.targetLine.label)
        },
        labels: {
            show: getObjectValue(objects, "labels", "show", DefaultSettings.labels.show),
            position: getEnumValue(objects, "labels", "position", DefaultSettings.labels.position) as ParetoProSettings["labels"]["position"],
            color: getFillColor(objects, "labels", "color", DefaultSettings.labels.color),
            fontSize: getObjectValue(objects, "labels", "fontSize", DefaultSettings.labels.fontSize),
            displayUnits: getObjectValue(objects, "labels", "displayUnits", DefaultSettings.labels.displayUnits),
            decimalPlaces: getObjectValue(objects, "labels", "decimalPlaces", DefaultSettings.labels.decimalPlaces)
        },
        cards: {
            show: getObjectValue(objects, "cards", "show", DefaultSettings.cards.show),
            backgroundColor: getFillColor(objects, "cards", "backgroundColor", DefaultSettings.cards.backgroundColor),
            fontColor: getFillColor(objects, "cards", "fontColor", DefaultSettings.cards.fontColor),
            fontSize: getObjectValue(objects, "cards", "fontSize", DefaultSettings.cards.fontSize)
        },
        legend: {
            show: getObjectValue(objects, "legend", "show", DefaultSettings.legend.show),
            position: getEnumValue(objects, "legend", "position", DefaultSettings.legend.position) as ParetoProSettings["legend"]["position"],
            fontColor: getFillColor(objects, "legend", "fontColor", DefaultSettings.legend.fontColor),
            fontSize: getObjectValue(objects, "legend", "fontSize", DefaultSettings.legend.fontSize)
        },
        table: {
            show: getObjectValue(objects, "table", "show", DefaultSettings.table.show),
            fontColor: getFillColor(objects, "table", "fontColor", DefaultSettings.table.fontColor),
            fontSize: getObjectValue(objects, "table", "fontSize", DefaultSettings.table.fontSize),
            headerColor: getFillColor(objects, "table", "headerColor", DefaultSettings.table.headerColor),
            headerBackgroundColor: getFillColor(objects, "table", "headerBackgroundColor", DefaultSettings.table.headerBackgroundColor)
        },
        animation: {
            enable: getObjectValue(objects, "animation", "enable", DefaultSettings.animation.enable),
            duration: getObjectValue(objects, "animation", "duration", DefaultSettings.animation.duration),
            type: getEnumValue(objects, "animation", "type", DefaultSettings.animation.type) as ParetoProSettings["animation"]["type"]
        },
        axes: {
            showXAxis: getObjectValue(objects, "axes", "showXAxis", DefaultSettings.axes.showXAxis),
            showYAxis: getObjectValue(objects, "axes", "showYAxis", DefaultSettings.axes.showYAxis),
            showY2Axis: getObjectValue(objects, "axes", "showY2Axis", DefaultSettings.axes.showY2Axis),
            xAxisTitle: getObjectValue(objects, "axes", "xAxisTitle", DefaultSettings.axes.xAxisTitle),
            yAxisTitle: getObjectValue(objects, "axes", "yAxisTitle", DefaultSettings.axes.yAxisTitle),
            y2AxisTitle: getObjectValue(objects, "axes", "y2AxisTitle", DefaultSettings.axes.y2AxisTitle),
            showGridLines: getObjectValue(objects, "axes", "showGridLines", DefaultSettings.axes.showGridLines),
            fontSize: getObjectValue(objects, "axes", "fontSize", DefaultSettings.axes.fontSize),
            fontColor: getFillColor(objects, "axes", "fontColor", DefaultSettings.axes.fontColor),
            xAxisLabelAngle: getObjectValue(objects, "axes", "xAxisLabelAngle", DefaultSettings.axes.xAxisLabelAngle)
        }
    };

    return settings;
}