import * as d3 from "d3";
import { IAnimationSettings } from "./interfaces";

/**
 * AnimationManager provides centralized D3 transition configurations
 * to ensure consistent animation behavior across all visual components.
 * It adheres to the DRY principle by offering reusable transition methods.
 */
export class AnimationManager {
    /**
     * Applies a standard D3 transition to a selection based on the visual's animation settings.
     * If animations are disabled, it applies a zero-duration transition for consistent state updates.
     * 
     * @param selection The D3 selection to animate.
     * @param settings The animation settings.
     * @param name Optional name for the transition.
     * @returns A configured D3 Transition object.
     */
    public static applyTransition<T extends d3.BaseType, U>(
        selection: d3.Selection<T, U, null, undefined>,
        settings: IAnimationSettings,
        name?: string
    ): d3.Transition<T, U, null, undefined> {
        const transition = selection.transition(name);

        if (settings.enable) {
            transition.duration(settings.duration).ease(this.getEaseFunc(settings.type));
        } else {
            transition.duration(0);
        }

        return transition;
    }

    /**
     * Retrieves the appropriate D3 easing function based on the animation type.
     * 
     * @param type The animation type ('fade', 'grow', 'slide').
     * @returns A D3 easing function.
     */
    public static getEaseFunc(type: "fade" | "grow" | "slide"): (normalizedTime: number) => number {
        switch (type) {
            case "fade":
                return d3.easeLinear;
            case "grow":
                return d3.easeCubicOut;
            case "slide":
                return d3.easeBackOut.overshoot(1.1);
            default:
                return d3.easeCubicInOut;
        }
    }

    /**
     * Calculates the initial attributes for an element based on the animation type.
     * Useful for setting the starting state before the transition begins.
     * 
     * @param type The animation type.
     * @param baseValue The target value (e.g., height or y coordinate).
     * @returns An object containing initial attribute values.
     */
    public static getInitialAnimationState(type: "fade" | "grow" | "slide", baseValue: number): { opacity: number; offset: number } {
        switch (type) {
            case "fade":
                return { opacity: 0, offset: 0 };
            case "grow":
                return { opacity: 1, offset: baseValue }; // Grow from bottom (requires specific handling in renderer)
            case "slide":
                return { opacity: 0, offset: 20 }; // Slide from left/bottom by 20px
            default:
                return { opacity: 1, offset: 0 };
        }
    }
}