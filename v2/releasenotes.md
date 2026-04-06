# Rxindi Release Notes

**Version 2.2** | _2026-04-04_

- Variables | [details](#variables)
- Many new expression functions (50 in total) | [details](#functions)
- Number formatting and parsing | [details](#number-formatting)
- Date formatting and parsing | [details](#date-formatting)
- System Variables replace System Attributes | [details](#system-variables)
- Character constants for breaks and more | [details](#character-constants)
- Strict XPath mode | [details](#xpath-mode)
- Support for XML namespaces | [details](#xml-namespaces)
- Extended pre-process validation | [details](#extended-validation)
- Commas and semicolons no longer need an escape | [details](#no-escapes)
- Fix optional filename for Export action
- Mapping mode Classic has been removed
- Legacy scriptArgs removed for JSX

[Previous releases](#previous-releases)

## Changes in detail

### Variables

You can now declare, update, and use named variables in your document templates. Declare a new, or update an existing variable using the new `var` action. For example: `${!var:myVar,"Hello!"}`. The value of a variable can be set to the result of any expression and are type-aware. Besides strings, numbers and booleans, you can also assign a set of elements from the data source to them.

Declared variables can then be used in any argument that takes a path expression using a dollar-sign followed directly by the variable name, e.g. `$myVar`. All variables are global for the document, so you can declare/update a variable in one frame and use it from another.

The combination of variables and powerful new [functions](#functions) open up a whole new level of what can be achieved directly from within InDesign itself, without having to resort to custom scripts.

### Functions

Rxindi now supports 50 functions that can be used in any argument that takes an expression path. This now includes full XPath 1.0 compliance, and many additional functions for working with strings, numbers, node-sets and dates. Some highlights are:

- `parse-number` / `format-number` and `parse-datetime` / `format-datetime`
  - Parse numbers and dates from any locale from the data source and convert them to text using full flexibility.
- `choose`
  - Choose between the result of two different expressions based on a condition (an 'if-else' statement within an expression).
- `string-split` / `string-join`
  - Split and join elements in a string based on a delimiter.
- `lower-case` / `upper-case`
  - Convert the text to lowercase or uppercase.
- `list`
  - Build a custom list of text values.

See the manual for the full set of available functions.

### Number formatting

Support for formatting and parsing of numbers with locale-aware decimals/grouping using the new `format-number` and `parse-number` functions. The syntax for formatting numbers is very flexible and is similar to that used in Excel and other spreadsheet applications.

Examples:
- `${=format-number(1234.5,'#,##0.00')}` => `1,234.50`
- `${=format-number(1234.5,'#,##0.00',',', '.')}` => `1.234,50`
- `${=parse-number('1.234,50',',', '.')}` => `1234.5`

> Note that for simplicity the first argument here is a hardcoded number, but typically this will be path to a value in the data source.

### Date formatting

Format and parse dates and times in any input and desired output format using the highly flexible `format-datetime` and `parse-datetime` functions. Full localization support with complete flexibility on naming of Months and Days.

Examples:
- `${=format-datetime('2025-06-15T14:30:00','[D] [MNn] [Y]')}` => `15 Jun 2025`
- `${=format-datetime('2025-06-15T14:30:00','[FH]:[fm] [PN]')}` => `14:30 PM`
- `${=parse-datetime('15/06/2025 14:30','[d]/[m]/[Y] [H]:[M]')}` => `2025-06-15T14:30:00`

> Note that for simplicity the first argument here is a hardcoded date, but typically this will be path to a value in the data source.

### System Variables

In previous releases, Rxindi provided special System Attributes like `@rxc-index` to obtain runtime values like the current index in a LOOP. With this version these have now been migrated and further expanded to so-called System Variables, like `$x:index`. This offers several benefits:
- System Variables have an explicit type (e.g. `number` for `$x:index`), while the old Attributes were always text-based.
- Names of used System Variables are explicitly checked prior to processing, while incorrect Attributes would just silently give no value.
- System Attributes "polluted" the data source context by adding processing information, System Variables keep the data source pure and clean. 

The set of System Variables is significantly more extensive than the handful of System Attributes previous versions offered. All System Variables have the format `$x:<name>`. See the manual for info.

> To ensure compatibility and a gradual transition, System Attributes will remain supported in this version. They are considered _deprecated_ though, and support for them may be removed in a future version. In [XPath mode](#xpath-mode) `strict` they are _not_ available.

### Character Constants

Rxindi now has an extensive set of useful constants that can be used directly, or as a part of a path expression for statements like OUTPUT. Constants have the format `$c:<name>`. Examples of constants are:
- `$c:cr` - Paragraph Return 
- `$c:lf` - Line Break
- `$c:tab` - Tab

See the manual for the full list.

### XPath Mode

Path expressions in templates are evaluated using `compatible` mode by default. This matches the custom string handling and boolean evaluation behavior of earlier versions of Rxindi, making upgrades smooth without requiring template changes.

Mode `strict` follows the pure XPath 1.0 specification exactly and will give results that closer aligns to what you might expect if you are very familiar with XPath and/or using external XPath tooling. To enable `strict` mode for a template, add the following at root level (outside any block):

```
${!set:xpath-mode,strict}
```

See the `set` ACTION in the manual for details.

### XML Namespaces

XML namespaces are an integral part of many standard-compliant and enterprise XML documents. Previous versions of Rxindi could load XML documents with namespaces without issues, but due to lack of true support, using them in path expressions could be problematic.

This version adds full support for XML Namespaces. Elements and attributes in a namespace can be addressed either using the full URI of the namespace as prefix: e.g. `{http://somenamespace}MyElement` or using the namespace prefix as it is defined in the XML document: e.g. `ns:MyElement`.

### Extended Validation

While Rxindi always has had a useful pre-processing validator that helped with incorrect statements, many other checks were previously only performed during actual processing. With this release a couple of important validations are now performed upfront, giving immediate feedback on issues:
- Expression path syntax
- Functions, including number of arguments
- Variables
- References to Components in PLACE statement

Note that there are still many validations that still only happen during processing, but these new validations should provide much earlier feedback on some of the more frequent causes of issues during the template development phase.

### No Escapes

All previous versions of Rxindi required commas and semicolons, that were part of an argument to a Rxindi statement, to be "escaped" by preceding each one with a backslash - in all cases. This was necessary because commas and semicolons are also used to separate Rxindi statement arguments, and statements within a placeholder, respectively.

Starting with this release, Rxindi is much smarter about understanding what the intention of commas and semicolons is, based on the context where they are used. Commas can now be used without any special prefix in expression function calls (e.g. `concat("Hello", "World")`), and both commas and semicolons can be used as-is in any quoted string: `'Hello, world;'`. 

Both `\,` and `\;` are no longer recognized escape sequences with this release. If you want to use commas and semicolons in a Rxindi argument, just quote the entire argument.

> This is a breaking change. To upgrade existing templates, remove the backslash prefixes in path expression function calls and ensure that commas and semicolons are quoted for other arguments. Alternatively, switch to v2.1 compatibility mode to process existing template without changes.

Note: The only character that remains to **always** need explicit escaping is the closing brace: `\}`.

---
# Previous releases

**Version 2.1** | _2026-01-04_

- Custom data root
- Multi-record processing
- Simplified literal strings for XPaths

**Version 2.0.2** | _2025-11-28_

- Fixes issue with Rxindi Panel Menu not being shown under certain circumstances
- Fixes minor issues in documentation

**Version 2.0.1** | _2025-08-27_

- Fixes critical issues in CSV and XLSX data source loading

**Version 2.0** | _2025-05-23_

- Improved line break handling for data source text
- Export ACTION type for saving to PDF or INDD
- PLACE statement can now target frames
- Function Components
- Auto Trigger Components
- New extensive scripting API based on UXP
- Manual is always opened directly in the browser
- Show actual compatibility version in UI
- Requires InDesign 2025 (20.0) or newer
- Minimum backward compatibility version is now v1.5
- Removed support for SCRIPT "init" trigger
- Using the latest Adobe plugin framework

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
Copyright © 2020-2026 Rxcle. All Rights Reserved.
