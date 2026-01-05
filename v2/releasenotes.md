# Rxindi Release Notes

**Version 2.1** | _2026-01-04_

- Custom data root | [details](#custom-data-root)
- Multi-record processing | [details](#multi-record-processing)
- Simplified literal strings for XPaths | [details](#simplified-literal-strings-for-xpaths)

[Previous releases](#previous-releases)

## Changes in detail

### Custom Data Root

Path arguments for statements in the template refer to data in the Data Source and are relative to the "data root" element. By default this is the XML root element, which is `/data` on JSON, CSV and XSLX Data Sources. 

Starting with this release, any element in the Data Source can be selected as the data root. This is done using the new `SET` `ACTION` and the `dataroot` option, for which you can specify an XPath. For example `${!set:dataroot,/Custom/MyData}`; This sets the data root to the `MyData` child element and all other paths in the template will be relative to that.

### Multi-record processing

With Rxindi v2.1 you can now process the same template multiple times, using the records/rows from the same Data Source. When used in combination with the `EXPORT` `ACTION`, this allows for easy batch processing of many documents in one go. This functionality is implicitly enabled by specifying an XPath that results in multiple elements for the `dataroot`. For example, for CSV Data Sources, the following statement would cause the template document to be processed for every row in the CSV: `${!set:dataroot,/data/row}`.

### Simplified literal strings for XPaths

For any statement that takes an XPath as argument, e.g. `OUTPUT` and `EXPORT` `ACTION`, you can now just use double or single quoted strings to specify a literal text value. Previously you would have to use the XPath function `string("...")` - which is also still valid. This means that e.g. `${=string("Hello World")}` can now be written as `${="Hello World"}`

---
# Previous releases

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
Copyright ® 2020-2025 Rxcle. All Rights Reserved.
