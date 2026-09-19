# -*- coding: utf-8 -*-
#
# A previous version of this module claimed no Python overrides were
# needed, on the assumption that `fields.Properties` tolerates arbitrary
# extra keys on a property definition. That assumption was wrong:
# `fields.PropertiesDefinition._validate_properties_definition` checks
# every definition's keys against a closed whitelist (`ALLOWED_KEYS`) and
# raises `ValueError` for anything else. See
# models/fields_properties_definition_patch.py for the narrow, additive
# patch this actually requires.
from . import models
