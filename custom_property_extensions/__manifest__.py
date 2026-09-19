{
    "name": "Custom Property Extensions",
    "version": "18.0.1.0.0",
    "category": "Tools",
    "summary": "Add Color and Icon value types to the generic Properties field",
    "description": """
Custom Property Extensions
===========================
Enhances Odoo's generic "Properties" fields with intuitive visual tools to make your data easier to organize and distinguish at a glance.

Key Features:
-------------
* **Color Picker**: Choose a color from a simple preset palette or pick a custom color to highlight important property values.
* **Icon Selection**: Add visual context by picking a predefined icon or entering a custom icon name.
* **Colored Selection Options**: Assign colors to individual options inside selection dropdowns for quick visual identification.
* **Seamless Visual Consistency**: Custom colors and icons automatically appear everywhere properties are displayed, including Form views, Kanban card badges, and definition popovers—no extra setup required.

Changelog:
----------
* **v18.0.1.0.0** (2026-09-19): Initial release.
""",
    'author': 'Eng.Razan Salim',
    'support': "razan.saliem98@gmail.com",
    "license": "LGPL-3",
    "depends": ["base", "web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "custom_property_extensions/static/src/shared/color_presets.js",
            "custom_property_extensions/static/src/property_value/property_value_patch.js",
            "custom_property_extensions/static/src/property_definition/property_definition_patch.js",
            "custom_property_extensions/static/src/property_definition/property_definition_selection_patch.js",
            "custom_property_extensions/static/src/xml/property_definition_templates.xml",
            "custom_property_extensions/static/src/xml/property_value_templates.xml",
            "custom_property_extensions/static/src/xml/property_definition_selection_templates.xml",
            "custom_property_extensions/static/src/xml/property_live_value_templates.xml",
            "custom_property_extensions/static/src/scss/property_extensions.scss",
        ]
    },
    "images": ["static/description/icon.png"],
    "installable": True,
    "application": False,
    "auto_install": False,
}
