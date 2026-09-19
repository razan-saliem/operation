/** @odoo-module **/

/**
 * Shared between property_value_patch.js (Color/Icon property types) and
 * property_definition_selection_patch.js (per-option Selection colors) so
 * both features draw from one palette. Pulled out to its own module to
 * avoid a circular import between those two files.
 */

/** Fallback rendered when a color property has no value yet. */
export const FALLBACK_COLOR = "#FFFFFF";
/** Fallback rendered when an icon property has no value yet. */
export const FALLBACK_ICON = "fa-circle-o";

/** Preset palette (mirrors Odoo's classic 12-color kanban palette). */
export const COLOR_PRESETS = [
    "#F06050", // Red
    "#F4A460", // Orange
    "#F7CD1F", // Yellow
    "#6CC1ED", // Cyan
    "#814968", // Purple
    "#EB7E7F", // Almond
    "#2C8397", // Teal
    "#475577", // Blue
    "#D6145F", // Raspberry
    "#30C381", // Green
    "#9365B8", // Violet
    "#8A8D93", // Grey
];

/** Preset FontAwesome icons offered in the Icon picker. */
export const ICON_PRESETS = [
    "fa-star",
    "fa-heart",
    "fa-flag",
    "fa-bell",
    "fa-bolt",
    "fa-check-circle",
    "fa-exclamation-triangle",
    "fa-tag",
    "fa-tags",
    "fa-user",
    "fa-clock-o",
    "fa-calendar",
    "fa-envelope",
    "fa-phone",
    "fa-map-marker",
    "fa-thumbs-up",
    "fa-lightbulb-o",
    "fa-rocket",
];

/**
 * Resolve a colorIndex (1-based, 0/undefined = no color) to a hex string.
 * Used both for the Color property type's own value and for per-option
 * Selection colors (`x_selection_colors`).
 *
 * @param {number} colorIndex
 * @returns {string|null} hex color, or null for "No color"
 */
export function resolveOptionColorHex(colorIndex) {
    if (!colorIndex) {
        return null;
    }
    return COLOR_PRESETS[(colorIndex - 1) % COLOR_PRESETS.length];
}
