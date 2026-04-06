# Rxindi Migration Guide

This document explains how to migrate template documents from an earlier version of Rxindi to the latest version.

Note that while migrating template documents to be compatible with the latest Rxindi version is highly recommended, Rxindi also offers a "Compatibility Mode" that allows you to process templates made for an older version without changes.

## From v2.1 and v2.0

### Escaping commas and semicolons

Previous versions of Rxindi required prefixing commas and semicolons in Rxindi arguments with a backslash in all cases. Starting from v2.2, the intention of these characters is determined from their context automatically and a backslash followed by either a comma or a semicolon is not treated in any special way (it is seen as a literal backslash followed by a comma/semicolon).

**To Migrate:**
- In XPath function calls and quoted strings: Simply remove the backslash, Rxindi will understand that it is part of the XPath expression and not a Rxindi argument/statement separator.
- In other Rxindi arguments: Quote the entire argument with either double or single quotes.

| Before                           | After                          |
| -------------------------------- | ------------------------------ |
| `${=concat("Hello"\,"World\;")}` | `${=concat("Hello","World;")}` |
| `${&my\,script.jsx}`.            | `${&"my,script.jsx"}`          |

> Note: there is no change to the closing brace escape behavior. It **always** needs to be preceded by a backslash when it is part of a Rxindi statement argument: `\}`

### Removal of Classic mapping mode

As of v2.2, `Classic` Mapping mode is deprecated and can no longer be selected through the Rxindi user interface. It is currently still offered as an option through the Rxindi scripting API, but it is _highly_ recommended to migrate templates that rely on it to either `Default` or `Raw` mapping mode as soon as possible. These mapping modes have been available since Rxindi v1.4 and offer many benefits over the legacy `Classic` mapping mode.

**To Migrate:**

When switching from Classic to Default mapping mode, the primary impact is on the **XPath expressions** used to reference data in your templates. The XML structure generated from JSON, CSV, and XLSX files changes significantly. Data sources in XML format are unaffected.

#### JSON

**Root Element Change**
- Old: `/Root/...`
- New: `/data/...`

Replace all paths starting with `/Root` with `/data`.

**Array Items**
- Old: Array items use element name `Item`
- New: Array items use element name `p` with index attribute

Example:
```
Old:  /Root/myItems/Item[1]
New:  /data/myItems/p[1]  OR  /data/myItems/p[@name="0"]
```

**Special Character Handling**
- Old: Spaces and special characters are encoded (e.g., `Time_x0020_Zone`, `First_x002D_Name`)
- New: Disallowed characters are removed (e.g., `TimeZone`, `FirstName`)

Update all property references that contain spaces or special characters.

#### CSV

**Root and Row Elements**
- Old: `Root` (array) containing `Row` (object) elements
- New: `data` containing `row` elements with `index` attributes

Path changes: `/Root/Row[1]/Location` → `/data/row[1]/Location`

**Column Names with Spaces**
- Old: `Time_x0020_Zone`
- New: `TimeZone`

**Unnamed Columns**
- Old: Auto-named using spreadsheet convention (A, B, C, D...) → `<C>`, `<D>`
- New: Fixed name `c` with `name=""` and `index` attributes

Example: `/Root/Row[1]/C` → `/data/row[1]/c[@index=3]`

#### XLSX

**Root and Sheet Structure**
- Old: `Root` containing `Sheet` elements (sequential)
- New: `data` containing `sheet` elements with `name` and `index` attributes

Path changes: `/Root/Sheet[1]/Row[1]/Location` → `/data/sheet[1]/row[1]/Location`

**Sheet Name References** (new capability)
- Default: `/data/sheet[@name="DataSheet"]/row[1]/Location`

**Column Names and Unnamed Columns**
- Same as CSV mappings above

#### Quick Reference

| Scenario         | Classic (Old)         | Default (New)                           |
| ---------------- | --------------------- | --------------------------------------- |
| JSON root        | `/Root/...`           | `/data/...`                             |
| JSON arrays      | `/Root/items/Item[1]` | `/data/items/p[1]`                      |
| Field with space | `Time_x0020_Zone`     | `TimeZone`                              |
| CSV/XLSX rows    | `/Root/Row[1]`        | `/data/row[1]`                          |
| CSV empty column | `/Root/Row[1]/C`      | `/data/row[1]/c[@index=3]`              |
| XLSX by name     | _(not possible)_      | `/data/sheet[@name="DataSheet"]/row[1]` |

## From v1.5

### Line breaks

Rxindi v2.0+ features new behavior when mapping line break characters from the data source. The type of line break character in the data source now determines how the content ends up in the document via the `OUTPUT` statement. To regain the old behavior, you can switch the compatibility mode to `v1.5` in the panel menu.

### API

For automation, Rxindi v2.0+ has a completely new scripting API. The classic API from v1.5 is not supported at all (also not in compatibility mode). For more information, please read the dedicated API section in the manual.

### Script Triggers

Triggers for the `SCRIPT` statement, via the `:init`, `:start` and `:end` suffix, have been removed. To select a data source via a script, which was possible with the `init` trigger previously, create a custom script which calls Rxindi through its extensive new API and execute that script directly instead. 

Functionality for triggering statements on `start` and `end` remains available in a different form: Auto Trigger Components. For example, instead of `${&myscript:start}`, use: `${#on:start}${&myscript}${.}`. The available Component triggers are: `on:start`, `on:end` and `on:after`. To run scripts or other statements that act upon a fully processed document (e.g. to save/export), use the `on:after` trigger, which is the closest functional equivalent to the `:end` legacy script trigger.

### Component Names

Component names in Rxindi v2.0+ have stricter rules, to ensure correct matching behavior and avoid blocking potential future use-cases. The name was (mostly) unrestricted in previous versions. The allowed name for a component in Rxindi v2.0+ now follows the same rules that apply to an XML Element name: It must start with a letter or underscore, and can only contain letters, digits, underscores, hyphens, or dots. The colon is only allowed as a (known) prefix separator. The only allowed prefixes are `fn:` and `on:`.

## From v1.4 and older

To migrate pre v1.5 templates, it is recommended to install the latest version of Rxindi Classic (v1.x) and follow its include migration guide to first migrate the template to v1.5 or newer. 

---
Copyright © 2020-2026 Rxcle. All Rights Reserved.
