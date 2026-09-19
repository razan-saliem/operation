# -*- coding: utf-8 -*-
"""
`fields.PropertiesDefinition` (the field that stores a Properties
container's list of property definitions) validates every definition
dict against a closed whitelist, `ALLOWED_KEYS`, in
`_validate_properties_definition`:

    REQUIRED_KEYS = ('name', 'type')
    ALLOWED_KEYS = (
        'name', 'string', 'type', 'comodel', 'default',
        'selection', 'tags', 'domain', 'view_in_cards',
    )

    @classmethod
    def _validate_properties_definition(cls, properties_definition, env):
        for property_definition in properties_definition:
            invalid_keys = set(property_definition) - set(cls.ALLOWED_KEYS)
            if invalid_keys:
                raise ValueError('Some key are not allowed ...')
            ...

Any key outside that tuple raises `ValueError`, no matter which model or
module put it there. `Field` classes are not recordset models, so the
usual `_inherit` mechanism does not apply here - there is no supported
extension point for this whitelist.

This module therefore performs a narrowly-scoped, purely additive
monkey-patch: it only *widens* the whitelist tuple to also accept the two
extra keys the JS side of this module stores on a property definition:

* ``x_widget``           - "color" / "icon", see
                            static/src/property_definition/property_definition_patch.js
* ``x_selection_colors``  - ``{optionValue: colorIndex}``, see
                            static/src/property_definition/property_definition_selection_patch.js

No method logic is overridden, no other whitelist entry is touched, and
nothing changes for any property that doesn't use these two keys. The
patch is idempotent (safe if this module is reloaded / imported twice).
"""
from odoo.fields import PropertiesDefinition

EXTRA_ALLOWED_KEYS = ("x_widget", "x_selection_colors")

_missing_keys = tuple(
    key for key in EXTRA_ALLOWED_KEYS if key not in PropertiesDefinition.ALLOWED_KEYS
)
if _missing_keys:
    PropertiesDefinition.ALLOWED_KEYS = tuple(PropertiesDefinition.ALLOWED_KEYS) + _missing_keys
