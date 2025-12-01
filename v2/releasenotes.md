# Rxindi Release Notes

**Version 2.0.2** | _2025-11-28_

- Fixes issue with Rxindi Panel Menu not being shown under certain circumstances
- Fixes minor issues in documentation

**Version 2.0.1** | _2025-08-27_

- Fixes critical issues in CSV and XLSX data source loading

**Version 2.0** | _2025-05-23_

- Improved line break handling for data source text | [details](#line-breaks)
- Export ACTION type for saving to PDF or INDD | [details](#export)
- PLACE statement can now target frames | [details](#target-for-place)
- Function Components | [details](#function-components)
- Auto Trigger Components | [details](#auto-trigger-components)
- New extensive scripting API based on UXP | [details](#api)
- Manual is always opened directly in the browser | [details](#ui-changes)
- Show actual compatibility version in UI | [details](#ui-changes)
- Requires InDesign 2025 (20.0) or newer | [details](#backward-compatibility)
- Minimum backward compatibility version is now v1.5 | [details](#backward-compatibility)
- Removed support for SCRIPT "init" trigger | [details](#removal-of-script-triggers)
- Using the latest Adobe plugin framework

[Previous releases](#previous-releases)

## Changes in detail

Rxindi v2.0 is a major version upgrade which is built on top of the latest plugin framework from Adobe. This makes Rxindi faster, more memory efficient, and future ready. Both the User Interface and much of Rxindi's behavior remains similar as previous versions, but with some notable improvements and new functionality. Rxindi v2.0 is highly backward compatible with Rxindi v1.5 through Compatibility Mode.

### Backward Compatibility

Rxindi v2.0 requires InDesign 2025 (v20) or newer. If you need to work with older versions of InDesign (2019/v14+) then please continue to use Rxindi v1.5.

Explicit backward compatibility for Rxindi Templates created for Rxindi v1.0 through v1.4 is not available in Rxindi v2.0. A Compatibility Mode setting for Rxindi v1.5 templates is available. Use Rxindi v1.5 to process older templates and/or to migrate to a v1.5 compatible template before switching to Rxindi v2.0. See the "Migration guide" document for more details.

### Line Breaks

The translation of line break characters in the data source has changed to provide more control and to be more in line with how InDesign itself treats line breaks. Depending on the document and data, this may give a different result than was the case for previous versions. To get the behavior from earlier versions, switch the compatibility mode to v1.5.

### Export

Saving or exporting a document after processing required either a manual action or a custom script in previous Rxindi releases. With this version this has become much simpler. The `ACTION` statement now has a new "export" action type: `${!export}`. Using this action the current document can be exported to either PDF or INDD. For PDF you can optionally specify the Export Preset to use and for both INDD and PDF you can specify (an expression to) the filename to export to. Typically this statement is placed in an [Auto Trigger Component](#auto-trigger-components) of type `on:after`.

### API

Rxindi v2.0 has a completely new and much more extensive scripting API, based on the Adobe UXP scripting platform. The new API allows for automation of _all_ of Rxindi's functionality and even exposes some functionality that is not available from the UI.

Due to platform incompatibilities, the legacy (ExtendScript) API from Rxindi v1.5 is _not_ supported on Rxindi v2.0 - not even in compatibility mode. The Rxindi manual now has a dedicated section that describes the API in detail.

### UI Changes

Rxindi v1.5 would show "Legacy Mode" in the panel UI when switching to compatibility mode. In Rxindi 2.0, instead, it explicitly shows the compatibility version and the mapping mode, e.g., "v1.5 Classic."

The Rxindi Manual is now always opened directly in the browser rather than in a separate plugin window in InDesign.

Rxindi v2.0 does not remember the last visibility state and position of the Rxindi panel. This is different from Rxindi v1.5, where this _would_ be remembered. This change is due to current technical restrictions in the new Adobe plugin framework. To open Rxindi, go to the "Plug-ins" menu or use the InDesign "Plugins" panel. Many of the Rxindi actions (e.g., Process Document) on the Plugins panel will also show the Rxindi Panel.

If you want to automatically show the panel always directly on InDesign startup, you can enable this via the new `Options` > `Display` > `Show on Startup` setting on the Rxindi panel menu. Note that this will always show the panel at its default location, not the location it was at in a previous InDesign session.

### Removal of Script Triggers

Previous versions of Rxindi allowed you to "auto-trigger" scripts with the `SCRIPT` statement using the `:init`, `:start` and `:end` suffix. In Rxindi v2.0 auto-triggering functionality has been moved to Auto Trigger Components instead, which allow for more flexibility. See the Migration Guide for more information.

Note: legacy Script Triggers are still available when running in v1.5 compatibility mode.

### Components

#### Target for Place

the `PLACE` statement now accepts the name of a target frame for the Component instance as its third argument, e.g. `${@CompA,,TargetFrame1}`. This works mostly in the same way as it does for the `OUTPUT` statement, where output is appended to the end of the target frame.

#### Function Components

You can now define a "Function Component" by prefixing the Component name with `fn:`. For example: `${#fn:CompA}<statements>${.}`. With Function Components only Rxindi statements are processed, any InDesign content in the Component definition is ignored when placing. 

#### Auto Trigger Components

Auto Trigger Components are automatically instantiated by Rxindi, based on a processing trigger. They are declared using a Component name with the `on:` prefix. There are three triggers available: `start`, `end` and `after`. For example, the following will automatically run a script when processing starts `${@on:start}${&myscript.jsx}${.}`. Auto Trigger Components are a more flexible approach to the "Script Trigger" functionality from previous versions, because within an Auto Trigger Component, _all_ Rxindi statements are valid. 

#### Stricter names

To reduce unintentional mistakes and to enable potential future use-cases, the naming rules for Components have become a stricter. Component names now must start with a letter or underscore, and can only contain letters, digits, underscores, hyphens, or dots.

---
# Previous releases

**Version 1.5.2** | _2025-09-30_

- InDesign 2026 support

**Version 1.5.1** | _2024-09-12_

- InDesign 2025 (20.0) support

**Version 1.5.0** | _2024-05-06_

- Auto trigger scripts on init, start, or end
- Allow custom data source selection in (init trigger) script
- SCRIPT statement now supports UXP scripts
- Optional custom processing parameter
- Public API, invoke Process via an external script/application
- Show only the filename of the data source by default
- Add new Display menu options
- Allow custom errors and logging from scripts
- Change SCRIPT object: 'script' var instead of 'scriptArgs'
- Show Mapping Mode in UI if different from Default
- Fix lookup of images in template directory for OUTPUT
- Validate data source before making changes to the document
- Various minor UI fixes and improvements
- Major internal restructuring for better stability and maintainability
- Reduced physical plugin size
- Minimum supported version is now InDesign 2019 (14.0)

**Version 1.4.1** | _2024-02-12_

- Correctly apply `tcstyle` and `tcrstyle` ACTION in ROWREPEAT
- Corrections in manual

**Version 1.4.0** | _2024-01-23_

- Table styling actions
- Improved mapping for JSON, CSV, and XLSX
- Improved behavior of LOOP and ROWREPEAT
- Removed support for Frame Statements
- Improved and extended QR Code support for OUTPUT
- Support referencing grouped styles for ACTION
- Options menu with logging level and compatibility mode
- Improved stability of data file conversion
- Improved help file and added option to open in browser
- Correctly clean-up COMPONENT content on process
- Correctly handle NaN in LOOP and ROWREPEAT
- Correctly replace XML root node for Load into XML Structure
- Fix escaping of comma, semicolon, and closing curly braces
- Fix processing error on a document with no text frames
- Correctly report error location in case of overset text
- Various other robustness and stability improvements

**Version 1.3.2** | _2023-12-30_
- Fix for data file paths containing a single quote
- Fix clearing of previous result for Load into XML Structure
- Fail instead of ignore if file for SCRIPT not found

**Version 1.3.1** | _2023-11-24_
- Fix issue with incorrectly reported multiple ROWREPEAT 

**Version 1.3.0** | _2023-11-08_
- New ROWREPEAT statement ${-...}
- Append instead of replace on OUTPUT to frame
- Fix issue with LOOP in script label
- Correct auto-closing behavior of block statements in (nested) tables
- Simplify comparison syntax on IF statements

**Version 1.2.1** | _2023-10-17_
- InDesign 2024 support

**Version 1.2.0** | _2023-05-31_
- Major internal rewrite, resulting in much better/expected results and error handling
- Validate target names before actual processing
- Better handling of decimals in XLSX input

**Version 1.1.0** | _2023-01-20_
- InDesign 2023 support
- Apple Silicon support
- Load into XML Structure
- Fix issues in manual and error messages
- Restore userInteractionLevel after processing

**Version 1.0.2** | _2021-12-20_
- InDesign 2022 support

**Version 1.0.1** | _2020-10-23_
- InDesign 2021 support

**Version 1.0.0** | _2020-04-01_
- Initial release

---
Copyright ® 2020-2025 Rxcle. All Rights Reserved.
