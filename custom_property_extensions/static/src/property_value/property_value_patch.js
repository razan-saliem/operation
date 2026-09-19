/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PropertyValue } from "@web/views/fields/properties/property_value";
import {
    COLOR_PRESETS,
    ICON_PRESETS,
    FALLBACK_COLOR,
    FALLBACK_ICON,
    resolveOptionColorHex,
} from "@custom_property_extensions/shared/color_presets";

// Re-exported for backward compatibility with anything (tests, other
// patches) importing these from here; the values now live in the shared
// module - see property_definition_selection_patch.js for why.
export { COLOR_PRESETS, ICON_PRESETS, FALLBACK_COLOR, FALLBACK_ICON };

const HEX_COLOR_RE = /^#([0-9a-f]{3}){1,2}$/i;
/** A conservative allow-list pattern for a single FontAwesome class token. */
const ICON_CLASS_RE = /^fa-[a-z0-9-]+$/i;

/**
 * `optionColors` (`{ [optionValue]: colorIndex }`) is not declared on core's
 * PropertyValue.props, so it must be added here for the Selection-type
 * badge to work - same pattern as the props patch in
 * property_definition_selection_patch.js.
 *
 * It's threaded down to this component from the two places that render a
 * property's *live* value - the Form view (`web.PropertiesField`) and the
 * Kanban card (`web.CardPropertiesField`) - via
 * property_live_value_templates.xml, in addition to the "Default Value"
 * row of the definition popover (property_definition_templates.xml).
 */
PropertyValue.props = {
    ...PropertyValue.props,
    optionColors: { type: Object, optional: true },
};

patch(PropertyValue.prototype, {
    /** @returns {string[]} */
    get colorPresets() {
        return COLOR_PRESETS;
    },

    /** @returns {string[]} */
    get iconPresets() {
        return ICON_PRESETS;
    },

    /**
     * @override
     * Color/Icon values are plain strings: pass them through untouched
     * (matching how "char" values already flow through this getter).
     */
    get propertyValue() {
        if (this.props.type === "color") {
            return this.props.value || "";
        }
        if (this.props.type === "icon") {
            return this.props.value || "";
        }
        return super.propertyValue;
    },

    /**
     * @override
     * Used by parent code paths that still read `displayValue` directly
     * (e.g. tooltips); the dedicated templates use `propertyValue`.
     */
    get displayValue() {
        if (this.props.type === "color" || this.props.type === "icon") {
            return this.propertyValue || false;
        }
        return super.displayValue;
    },

    /**
     * The swatch shown for the current Color property value, with a safe
     * fallback.
     * @returns {string} inline CSS, e.g. "background-color: #F06050;"
     */
    get colorBadgeStyle() {
        const value = HEX_COLOR_RE.test(this.propertyValue) ? this.propertyValue : FALLBACK_COLOR;
        return `background-color: ${value};`;
    },

    /**
     * The FontAwesome class shown for the current Icon property value,
     * with a safe fallback.
     * @returns {string}
     */
    get iconBadgeClass() {
        return ICON_CLASS_RE.test(this.propertyValue) ? this.propertyValue : FALLBACK_ICON;
    },

    /**
     * Called when the user picks a preset swatch, uses the native
     * <input type="color">, or types a hex code manually.
     * @param {string} hexColor
     */
    onColorSelected(hexColor) {
        const value = HEX_COLOR_RE.test(hexColor) ? hexColor : this.propertyValue || FALLBACK_COLOR;
        this.onValueChange(value);
    },

    /**
     * Called when the user picks a preset icon or types a custom
     * FontAwesome class manually.
     * @param {string} iconClass
     */
    onIconSelected(iconClass) {
        const cleaned = (iconClass || "").trim();
        const value = ICON_CLASS_RE.test(cleaned) ? cleaned : this.propertyValue || FALLBACK_ICON;
        this.onValueChange(value);
    },

    /**
     * The label for a given Selection option value, e.g. to show next to
     * its color badge in readonly mode.
     * @param {string} value
     * @returns {string}
     */
    getSelectionLabel(value) {
        const found = (this.props.selection || []).find((option) => option[0] === value);
        return found ? found[1] : "";
    },

    /**
     * The color assigned (via `x_selection_colors`) to a given Selection
     * option value.
     * @param {string} value
     * @returns {string|null} hex color, or null if that option has no color
     */
    getSelectionColorHex(value) {
        const colors = this.props.optionColors || {};
        return resolveOptionColorHex(colors[value] || 0);
    },

    /**
     * Inline style for the Selection value's colored badge. Empty string
     * (default badge styling) when the option has no assigned color.
     * @param {string} value
     * @returns {string}
     */
    getSelectionBadgeStyle(value) {
        const hex = this.getSelectionColorHex(value);
        if (!hex) {
            return "";
        }
        return `background-color: ${hex}; border-color: ${hex}; color: #fff;`;
    },
});
