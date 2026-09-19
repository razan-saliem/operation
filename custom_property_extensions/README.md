# Custom Property Extensions

Extends Odoo's built-in "Properties" field widget (`fields.Properties`, implemented client-side by `PropertyDefinition` / `PropertyValue`) with two additional property value types:

* **Color** - pick a hex color from a preset palette or a native color picker. The value is stored as a plain hex string (e.g. `#F06050`).
* **Icon** - pick a FontAwesome icon class from a curated preset list, or type a custom one (e.g. `fa-star`). The value is stored as the bare FontAwesome class string.

Both types reuse the same generic `PropertyValue` component that Odoo already uses everywhere a property is rendered (the definition popover's "Default Value", form view fields, list view cells and Kanban card badges), so no extra view wiring is required: wherever properties are displayed today, the new Color / Icon badges show up automatically.

This module also adds a **per-option color picker** to the "Selection" property type's option editor (`PropertyDefinitionSelection`): each option can be tagged with a color from the same preset palette used by the Color type, so selection values can be told apart at a glance.

---

## Server-side constraint and how it's handled

`fields.Properties` / `fields.PropertiesDefinition` validate, in core, against **closed whitelists**:

* the `type` of every property (a fixed set of backend types),
* the *shape* of `selection` options (plain 2-element `[value, label]` pairs), and
* the **set of keys** allowed on a property definition dict at all (`PropertiesDefinition.ALLOWED_KEYS`).

None of these checks can be extended by registering into them - they are hardcoded in `odoo/fields.py`. This module works within all three:

* Color/Icon properties are stored with `type: "char"` (a value the ORM already accepts) plus an extra `x_widget` key (`"color"` / `"icon"`) that tells the widget which UI to use.
* Per-option selection colors are stored in a sibling `x_selection_colors` map (`{optionValue: colorIndex}`) next to `selection`, never inside the option tuples themselves - so `selection` keeps the exact 2-element shape core validates.
* `x_widget` and `x_selection_colors` are additionally whitelisted via `models/fields_properties_definition_patch.py`, which appends them to `PropertiesDefinition.ALLOWED_KEYS` at import time. This is the one narrowly-scoped, additive monkey-patch this module needs: `Field` classes aren't recordset models, so there is no `_inherit` mechanism to hook into for this whitelist, and it cannot otherwise be widened from a downstream module.

---

## Where colors actually render

`PropertyValue` only shows a colored badge when it's given the right props, so this module patches every place core instantiates it with a record's live data:

* the "Default Value" row of the definition popover (`web.PropertyDefinition`),
* the Form view's property widget (`web.PropertiesField`), and
* the Kanban card badge (`web.CardPropertiesField`).

Each gets `type` redirected through the effective type (`x_widget` when set) and an `optionColors` prop sourced from `x_selection_colors`, so Color/Icon properties and colored Selection options display consistently everywhere a property appears - not just inside the definition editor.