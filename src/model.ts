import powerbi from "powerbi-visuals-api";
import { ParetoProSettings } from "./interfaces";

/**
 * VisualFormattingModel is responsible for constructing the Power BI Formatting Model
 * using the modern Formatting Model API (API 5.7+).
 * It dynamically builds the format pane cards and slices based on the visual's settings interface.
 */
export class VisualFormattingModel {
    /**
     * Builds the formatting model for the visual.
     * @param settings The current visual settings.
     * @returns The Power BI FormattingModel object.
     */
    public buildFormattingModel(settings: ParetoProSettings): powerbi.visuals.FormattingModel {
        const cards: powerbi.visuals.FormattingCard[] = [];

        // 1. Theme Card
        cards.push(this.buildCard("theme", "Theme", [
            this.buildEnumSlice("theme", "mode", "Theme Mode", settings.theme.mode, [
                { displayName: "Auto", value: "auto" },
                { displayName: "Light", value: "light" },
                { displayName: "Dark", value: "dark" },
                { displayName: "Corporate", value: "corporate" }
            ])
        ]));

        // 2. Bars Card
        cards.push(this.buildCard("bars", "Bars", [
            this.buildColorSlice("bars", "fillColor", "Color", settings.bars.fillColor),
            this.buildNumSlice("bars", "transparency", "Transparency", settings.bars.transparency, 0, 100),
            this.buildColorSlice("bars", "strokeColor", "Border Color", settings.bars.strokeColor),
            this.buildNumSlice("bars", "strokeWidth", "Border Width", settings.bars.strokeWidth, 0, 10),
            this.buildNumSlice("bars", "cornerRadius", "Corner Radius", settings.bars.cornerRadius, 0, 20),
            this.buildNumSlice("bars", "barGap", "Bar Gap (0-1)", settings.bars.barGap, 0, 1),
            this.buildToggleSlice("bars", "gradientEnabled", "Enable Gradient", settings.bars.gradientEnabled),
            this.buildColorSlice("bars", "gradientStartColor", "Gradient Start", settings.bars.gradientStartColor),
            this.buildColorSlice("bars", "gradientEndColor", "Gradient End", settings.bars.gradientEndColor),
            this.buildToggleSlice("bars", "abcColorsEnabled", "ABC Conditional Colors", settings.bars.abcColorsEnabled),
            this.buildColorSlice("bars", "colorA", "Class A Color", settings.bars.colorA),
            this.buildColorSlice("bars", "colorB", "Class B Color", settings.bars.colorB),
            this.buildColorSlice("bars", "colorC", "Class C Color", settings.bars.colorC)
        ]));

        // 3. Pareto Line Card
        cards.push(this.buildCard("paretoLine", "Pareto Line", [
            this.buildToggleSlice("paretoLine", "show", "Show Line", settings.paretoLine.show),
            this.buildColorSlice("paretoLine", "lineColor", "Line Color", settings.paretoLine.lineColor),
            this.buildNumSlice("paretoLine", "lineWidth", "Line Width", settings.paretoLine.lineWidth, 1, 10),
            this.buildToggleSlice("paretoLine", "smooth", "Smooth Line", settings.paretoLine.smooth),
            this.buildEnumSlice("paretoLine", "markerShape", "Marker Shape", settings.paretoLine.markerShape, [
                { displayName: "None", value: "none" },
                { displayName: "Circle", value: "circle" },
                { displayName: "Square", value: "square" },
                { displayName: "Diamond", value: "diamond" }
            ]),
            this.buildNumSlice("paretoLine", "markerSize", "Marker Size", settings.paretoLine.markerSize, 1, 20),
            this.buildColorSlice("paretoLine", "markerColor", "Marker Color", settings.paretoLine.markerColor)
        ]));

        // 4. Target Line Card
        cards.push(this.buildCard("targetLine", "Target Line", [
            this.buildToggleSlice("targetLine", "show", "Show Target Line", settings.targetLine.show),
            this.buildNumSlice("targetLine", "value", "Target Value (%)", settings.targetLine.value, 1, 100),
            this.buildColorSlice("targetLine", "lineColor", "Line Color", settings.targetLine.lineColor),
            this.buildNumSlice("targetLine", "lineWidth", "Line Width", settings.targetLine.lineWidth, 1, 10),
            this.buildEnumSlice("targetLine", "dashArray", "Dash Style", settings.targetLine.dashArray, [
                { displayName: "Solid", value: "none" },
                { displayName: "Dashed", value: "5,5" },
                { displayName: "Dotted", value: "1,5" }
            ]),
            this.buildTextSlice("targetLine", "label", "Label Text", settings.targetLine.label)
        ]));

        // 5. Labels Card
        cards.push(this.buildCard("labels", "Data Labels", [
            this.buildToggleSlice("labels", "show", "Show Labels", settings.labels.show),
            this.buildEnumSlice("labels", "position", "Position", settings.labels.position, [
                { displayName: "Outside", value: "outside" },
                { displayName: "Inside", value: "inside" },
                { displayName: "Center", value: "center" }
            ]),
            this.buildColorSlice("labels", "color", "Color", settings.labels.color),
            this.buildNumSlice("labels", "fontSize", "Text Size", settings.labels.fontSize, 8, 36),
            this.buildNumSlice("labels", "displayUnits", "Display Units", settings.labels.displayUnits, 0, 1000000000),
            this.buildNumSlice("labels", "decimalPlaces", "Decimal Places", settings.labels.decimalPlaces, 0, 10)
        ]));

        // 6. Cards Card
        cards.push(this.buildCard("cards", "KPI Cards", [
            this.buildToggleSlice("cards", "show", "Show Cards", settings.cards.show),
            this.buildColorSlice("cards", "backgroundColor", "Background", settings.cards.backgroundColor),
            this.buildColorSlice("cards", "fontColor", "Font Color", settings.cards.fontColor),
            this.buildNumSlice("cards", "fontSize", "Text Size", settings.cards.fontSize, 8, 36)
        ]));

        // 7. Legend Card
        cards.push(this.buildCard("legend", "Legend", [
            this.buildToggleSlice("legend", "show", "Show Legend", settings.legend.show),
            this.buildEnumSlice("legend", "position", "Position", settings.legend.position, [
                { displayName: "Top", value: "top" },
                { displayName: "Bottom", value: "bottom" },
                { displayName: "Left", value: "left" },
                { displayName: "Right", value: "right" }
            ]),
            this.buildColorSlice("legend", "fontColor", "Font Color", settings.legend.fontColor),
            this.buildNumSlice("legend", "fontSize", "Text Size", settings.legend.fontSize, 8, 36)
        ]));

        // 8. Table Card
        cards.push(this.buildCard("table", "Summary Table", [
            this.buildToggleSlice("table", "show", "Show Table", settings.table.show),
            this.buildColorSlice("table", "fontColor", "Font Color", settings.table.fontColor),
            this.buildNumSlice("table", "fontSize", "Text Size", settings.table.fontSize, 8, 36),
            this.buildColorSlice("table", "headerColor", "Header Font Color", settings.table.headerColor),
            this.buildColorSlice("table", "headerBackgroundColor", "Header Background", settings.table.headerBackgroundColor)
        ]));

        // 9. Animation Card
        cards.push(this.buildCard("animation", "Animation", [
            this.buildToggleSlice("animation", "enable", "Enable Animation", settings.animation.enable),
            this.buildNumSlice("animation", "duration", "Duration (ms)", settings.animation.duration, 0, 5000),
            this.buildEnumSlice("animation", "type", "Animation Type", settings.animation.type, [
                { displayName: "Fade", value: "fade" },
                { displayName: "Grow", value: "grow" },
                { displayName: "Slide", value: "slide" }
            ])
        ]));

        // 10. Axes Card
        cards.push(this.buildCard("axes", "Axes", [
            this.buildToggleSlice("axes", "showXAxis", "Show X Axis", settings.axes.showXAxis),
            this.buildToggleSlice("axes", "showYAxis", "Show Y Axis", settings.axes.showYAxis),
            this.buildToggleSlice("axes", "showY2Axis", "Show Secondary Y Axis", settings.axes.showY2Axis),
            this.buildTextSlice("axes", "xAxisTitle", "X Axis Title", settings.axes.xAxisTitle),
            this.buildTextSlice("axes", "yAxisTitle", "Y Axis Title", settings.axes.yAxisTitle),
            this.buildTextSlice("axes", "y2AxisTitle", "Secondary Y Axis Title", settings.axes.y2AxisTitle),
            this.buildToggleSlice("axes", "showGridLines", "Show Gridlines", settings.axes.showGridLines),
            this.buildNumSlice("axes", "fontSize", "Text Size", settings.axes.fontSize, 8, 36),
            this.buildColorSlice("axes", "fontColor", "Font Color", settings.axes.fontColor),
            this.buildNumSlice("axes", "xAxisLabelAngle", "X Axis Label Angle", settings.axes.xAxisLabelAngle, -90, 90)
        ]));

        return { cards: cards };
    }

    /**
     * Helper method to create a FormattingCard.
     */
    private buildCard(name: string, displayName: string, slices: powerbi.visuals.FormattingSlice[]): powerbi.visuals.FormattingCard {
        return {
            name: name,
            displayName: displayName,
            uid: `card_${name}`,
            groups: [{ displayName: undefined, uid: `group_${name}`, slices: slices }],
            revertToDefaultDescriptors: slices.map(s => ({ uid: s.uid, selector: null }))
        };
    }

    /**
     * Helper method to create a ToggleSlice.
     */
    private buildToggleSlice(objectName: string, propertyName: string, displayName: string, value: boolean): powerbi.visuals.ToggleSlice {
        return {
            uid: `slice_${objectName}_${propertyName}`,
            objectName: objectName,
            propertyName: propertyName,
            displayName: displayName,
            control: {
                type: powerbi.visuals.FormattingComponent.ToggleSwitch,
                properties: { descriptor: { objectName: objectName, propertyName: propertyName }, value: value }
            }
        } as powerbi.visuals.ToggleSlice;
    }

    /**
     * Helper method to create a ColorPickerSlice.
     */
    private buildColorSlice(objectName: string, propertyName: string, displayName: string, value: string): powerbi.visuals.ColorPickerSlice {
        return {
            uid: `slice_${objectName}_${propertyName}`,
            objectName: objectName,
            propertyName: propertyName,
            displayName: displayName,
            control: {
                type: powerbi.visuals.FormattingComponent.ColorPicker,
                properties: { descriptor: { objectName: objectName, propertyName: propertyName }, value: { solid: { color: value } } }
            }
        } as powerbi.visuals.ColorPickerSlice;
    }

    /**
     * Helper method to create a NumUpDownSlice.
     */
    private buildNumSlice(objectName: string, propertyName: string, displayName: string, value: number, min?: number, max?: number): powerbi.visuals.NumUpDownSlice {
        const options: any = { descriptor: { objectName: objectName, propertyName: propertyName }, value: value };
        if (min !== undefined) options.min = min;
        if (max !== undefined) options.max = max;
        
        return {
            uid: `slice_${objectName}_${propertyName}`,
            objectName: objectName,
            propertyName: propertyName,
            displayName: displayName,
            control: {
                type: powerbi.visuals.FormattingComponent.NumUpDown,
                properties: options
            }
        } as powerbi.visuals.NumUpDownSlice;
    }

    /**
     * Helper method to create a TextSlice.
     */
    private buildTextSlice(objectName: string, propertyName: string, displayName: string, value: string): powerbi.visuals.TextSlice {
        return {
            uid: `slice_${objectName}_${propertyName}`,
            objectName: objectName,
            propertyName: propertyName,
            displayName: displayName,
            control: {
                type: powerbi.visuals.FormattingComponent.TextInput,
                properties: { descriptor: { objectName: objectName, propertyName: propertyName }, value: value, placeholder: "" }
            }
        } as powerbi.visuals.TextSlice;
    }

    /**
     * Helper method to create an ItemDropdownSlice (Enum).
     */
    private buildEnumSlice(objectName: string, propertyName: string, displayName: string, value: string, items: { displayName: string; value: string }[]): powerbi.visuals.ItemDropdownSlice {
        return {
            uid: `slice_${objectName}_${propertyName}`,
            objectName: objectName,
            propertyName: propertyName,
            displayName: displayName,
            control: {
                type: powerbi.visuals.FormattingComponent.Dropdown,
                properties: {
                    descriptor: { objectName: objectName, propertyName: propertyName },
                    value: value,
                    items: items.map(i => ({ displayName: i.displayName, value: i.value }))
                }
            }
        } as powerbi.visuals.ItemDropdownSlice;
    }
}