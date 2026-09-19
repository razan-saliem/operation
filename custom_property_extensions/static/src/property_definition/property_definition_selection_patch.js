/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { PropertyDefinitionSelection } from "@web/views/fields/properties/property_definition_selection";
import { COLOR_PRESETS, resolveOptionColorHex } from "@custom_property_extensions/shared/color_presets";

/**
 * IMPORTANT - why colors are NOT stored inside the option tuple
 * ------------------------------------------------------------------
 * `fields.Properties` validates the *shape* of `selection` server-side
 * (odoo/fields.py, `_validate_properties_definition`): every entry must
 * be a plain 2-element `[value, label]` pair, or it raises
 * `ValueError('Wrong options ...')`. That check is hardcoded in core and
 * not something a module can register into.
 *
 * So a 3rd, color, element on the option tuple is a dead end - it will
 * always fail validation the moment the record is saved. Instead, the
 * color for option `value` is stored in a *sibling* key on the property
 * definition dict: `x_selection_colors = { [value]: colorIndex, ... }`.
 * `selection` itself is therefore left completely untouched (still pure
 * 2-tuples, exactly what core expects) and `x_selection_colors` rides
 * along as an ordinary extra key - the same, already-working pattern
 * used for `x_widget` on the Color/Icon property type (see
 * property_definition_patch.js for the full explanation of why extra
 * keys are safe but the validated ones are not).
 *
 * `colorIndex` follows the same convention already used elsewhere in
 * this module: `0`/absent = "No color", `1..COLOR_PRESETS.length` map to
 * a preset swatch - `COLOR_PRESETS` is shared with the Color property
 * type so both features draw from one palette.
 */

// Register the extra sub-component this patch needs; PropertyDefinitionSelection
// has no `static components` of its own in core, so start from an empty object.
PropertyDefinitionSelection.components = {
    ...PropertyDefinitionSelection.components,
    Dropdown,
};

// The component's props are validated by Owl; declare the two new ones
// the parent (PropertyDefinition) now passes down, see
// property_definition_templates.xml.
PropertyDefinitionSelection.props = {
    ...PropertyDefinitionSelection.props,
    optionColors: { type: Object, optional: true },
    onOptionColorsChange: { type: Function, optional: true },
};

/**
 * Re-exported for convenience / backward compatibility with existing
 * imports (e.g. tests); the implementation now lives in the shared module
 * so property_value_patch.js can use it too without a circular import.
 */
export { resolveOptionColorHex };

patch(PropertyDefinitionSelection.prototype, {
    /**
     * The color-swatch indexes offered in the picker: 0 = "No color",
     * followed by one entry per preset.
     * @returns {number[]}
     */
    get colorSwatchIndexes() {
        return [0, ...COLOR_PRESETS.map((color, i) => i + 1)];
    },

    /**
     * @param {Array} option a `[value, label]` tuple
     * @returns {number}
     */
    getOptionColorIndex(option) {
        const colors = this.props.optionColors || {};
        return (option && colors[option[0]]) || 0;
    },

    /**
     * @param {number} colorIndex
     * @returns {string|null}
     */
    getOptionColorHex(colorIndex) {
        return resolveOptionColorHex(colorIndex);
    },

    /**
     * Assign (or, if re-clicking the currently active swatch, clear) a
     * color for one selection option. This only ever touches
     * `x_selection_colors`; the `selection` tuples themselves are never
     * mutated, so they always stay in the exact 2-element shape core
     * validates.
     *
     * @param {integer} optionIndex index into `optionsVisible`
     * @param {integer} colorIndex
     */
    onOptionColorSelected(optionIndex, colorIndex) {
        const option = this.optionsVisible[optionIndex];
        if (!option || !option[0]) {
            // still-empty placeholder row: nothing to key the color on yet
            return;
        }
        if (!this.props.onOptionColorsChange) {
            return;
        }

        const optionId = option[0];
        const newColors = { ...(this.props.optionColors || {}) };
        const current = newColors[optionId] || 0;
        if (current === colorIndex || !colorIndex) {
            delete newColors[optionId];
        } else {
            newColors[optionId] = colorIndex;
        }
        this.props.onOptionColorsChange(newColors);
    },
});
