/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { PropertyDefinition } from "@web/views/fields/properties/property_definition";

/** Default value assigned when a property is switched to "Color". */
export const DEFAULT_PROPERTY_COLOR = "#714B67";
/** Default value assigned when a property is switched to "Icon". */
export const DEFAULT_PROPERTY_ICON = "fa-star";

/**
 * IMPORTANT - why this isn't a real new backend `type`
 * ------------------------------------------------------------------
 * `fields.Properties` validates the `type` key of every property
 * definition against a closed, hardcoded whitelist server-side
 * (odoo/fields.py, `_parse_json_types` and friends): boolean, integer,
 * float, char, date, datetime, many2one, many2many, selection, tags,
 * separator. Anything else raises `ValueError('Wrong property type ...')`
 * the moment the record is written or read - this is enforced in core,
 * not something we can register into from a module.
 *
 * So "Color" and "Icon" are NOT sent to the server as `type: 'color'` /
 * `type: 'icon'`. Instead we store the closest compatible real type,
 * `char` (the value is a plain string either way: a hex code or a
 * FontAwesome class), and remember which UI widget to use via an extra,
 * arbitrary key on the definition dict: `x_widget`. Odoo does not
 * validate or strip unknown keys on the definition dict, only `type`
 * itself, so `x_widget` round-trips through create/write/read exactly
 * like any of the other optional keys the definition already carries
 * (e.g. `view_in_cards`).
 *
 * `x_widget` is only meaningful when `type === 'char'`; every place in
 * this module that needs to know the "effective" type computes it as
 * `definition.x_widget || definition.type`.
 */
const CUSTOM_WIDGETS = ["color", "icon"];
const BACKEND_TYPE_FOR_WIDGET = "char";

/**
 * Custom "Field Type" icons for the two types added by this module.
 * Core ships its type icons at /web/static/src/views/fields/properties/icons/
 * (a read-only, core-owned folder) so instead of touching it we ship our own
 * icons and redirect the lookup for these two widgets only, see
 * `getPropertyTypeIconUrl` below and property_definition_templates.xml.
 */
const CUSTOM_TYPE_ICONS = {
    color: "/custom_property_extensions/static/src/img/color.png",
    icon: "/custom_property_extensions/static/src/img/icon.png",
};

/**
 * @param {object} propertyDefinition
 * @returns {string} the "effective" type used for UI dispatch: `x_widget`
 *  when set (color/icon), otherwise the real backend `type`.
 */
export function getEffectiveType(propertyDefinition) {
    return (propertyDefinition && propertyDefinition.x_widget) || (propertyDefinition && propertyDefinition.type);
}

patch(PropertyDefinition.prototype, {
    /**
     * Register "Color" and "Icon" as selectable entries in the "Field
     * Type" dropdown. Inserted just before "Separator" so Separator (a
     * structural, non-value type) always stays last.
     *
     * @override
     */
    get availablePropertyTypes() {
        const types = super.availablePropertyTypes;
        const separatorIndex = types.findIndex((type) => type[0] === "separator");
        const newTypes = [
            ["color", _t("Color")],
            ["icon", _t("Icon")],
        ];
        if (separatorIndex === -1) {
            return [...types, ...newTypes];
        }
        return [...types.slice(0, separatorIndex), ...newTypes, ...types.slice(separatorIndex)];
    },

    /**
     * Resolve the PNG shown next to a property type in the "Field Type"
     * dropdown / readonly header. Core types keep using core's own
     * icons; "color" / "icon" (passed here as the *effective* type -
     * see `getEffectiveType`) resolve to icons shipped by this module.
     *
     * @param {string} effectiveType
     * @returns {string} icon URL
     */
    getPropertyTypeIconUrl(effectiveType) {
        if (effectiveType in CUSTOM_TYPE_ICONS) {
            return CUSTOM_TYPE_ICONS[effectiveType];
        }
        return `/web/static/src/views/fields/properties/icons/${effectiveType}.png`;
    },

    /**
     * @override
     * Full replacement, not additive: core's version writes whatever the
     * dropdown emits straight into `type`, which would resurrect the
     * ValueError for "color"/"icon". We intercept the raw menu selection
     * here, map it to a real backend type + `x_widget` marker, and only
     * then run (a copy of) core's follow-up bookkeeping.
     */
    onPropertyTypeChange(newType) {
        const isCustomWidget = CUSTOM_WIDGETS.includes(newType);
        const backendType = isCustomWidget ? BACKEND_TYPE_FOR_WIDGET : newType;

        const propertyDefinition = {
            ...this.state.propertyDefinition,
            type: backendType,
        };

        if (isCustomWidget) {
            propertyDefinition.x_widget = newType;
            const defaultValue = newType === "color" ? DEFAULT_PROPERTY_COLOR : DEFAULT_PROPERTY_ICON;
            propertyDefinition.value = defaultValue;
            propertyDefinition.default = defaultValue;
        } else {
            delete propertyDefinition.x_widget;
            if (["integer", "float"].includes(backendType)) {
                propertyDefinition.value = 0;
                propertyDefinition.default = 0;
            } else {
                propertyDefinition.value = false;
                propertyDefinition.default = false;
            }
        }

        delete propertyDefinition.comodel;

        this.props.onChange(propertyDefinition);
        this.state.propertyDefinition = propertyDefinition;
        this.state.resModel = "";
        this.state.resModelDescription = "";
        // Label the dropdown by what the user picked ("Color"/"Icon"),
        // not by the underlying "char" we actually persist.
        this.state.typeLabel = this._typeLabel(newType);
    },

    /**
     * @override
     * `propertyType` here is whatever the various core call sites pass:
     * sometimes the raw menu type ("color"), sometimes the persisted
     * `definition.type` ("char"). Resolve via `x_widget` on the current
     * definition (falling back to props during the very first render,
     * before `this.state` exists yet) so the label is always right.
     */
    _typeLabel(propertyType) {
        const currentDefinition =
            (this.state && this.state.propertyDefinition) ||
            (this.props && this.props.propertyDefinition) ||
            {};
        const effectiveType = currentDefinition.x_widget || propertyType;
        const found = this.availablePropertyTypes.find((type) => type[0] === effectiveType);
        return found ? found[1] : propertyType;
    },

    /**
     * Update the per-option color map for a "Selection" property.
     * Purely additive - stores `x_selection_colors` as a sibling key next
     * to `selection`, never touching the validated `selection` tuples
     * themselves. See property_definition_selection_patch.js for why.
     *
     * @param {object} newOptionColors `{ [optionValue]: colorIndex }`
     */
    onSelectionColorsChange(newOptionColors) {
        const propertyDefinition = {
            ...this.state.propertyDefinition,
            x_selection_colors: newOptionColors,
        };
        this.props.onChange(propertyDefinition);
        this.state.propertyDefinition = propertyDefinition;
    },
});
