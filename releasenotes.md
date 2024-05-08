# Rxindi release notes

## This release

**Version 1.5.0**

- Auto trigger scripts on init, start or end | [details](#script-triggers)
- Allow custom data source selection in (init trigger) script | [details](#script-triggers)
- SCRIPT statement now supports UXP scripts | [details](#uxp-scripts)
- Optional custom processing parameter | [details](#processing-parameter)
- Public API, invoke Process via an external script/application | [details](#public-api)
- Show only the filename of the data source by default | [details](#more-options)
- Add new Display menu options | [details](#more-options)
- Allow custom errors and logging from scripts | [details](#script-return-values)
- Change SCRIPT object: 'script' var instead of 'scriptArgs'
- Show Mapping Mode in UI if different from Default
- Fix lookup of images in template directory for OUTPUT
- Validate data source before making changes to document
- Various minor UI fixes and improvements
- Major internal restructuring for better stability and maintainability
- Reduced physical plugin size
- Minimum supported version is now InDesign 2019 (14.0)

[Previous releases](#previous-releases)

## Changes in detail

The key changes in this release all revolve around scripting and automation.

### UXP Scripts
In previous versions scripts for the `SCRIPT` statement had to be written in the ExtendScript scripting language. Starting from this release you can also write them as [UXP script](https://developer.adobe.com/indesign/uxp/scripts/getting-started/) by explicitly specifying the `idjs` extension for the script to execute. UXP Script uses much more modern and standardized JavaScript and can make use of powerful libraries for file system and network requests. Do note that UXP scripts are generally a bit slower to execute than traditional ExtendScript.

To harmonize the incoming arguments for scripts written in ExtendScript and UXP Script, and to be more future-proof, the `scriptArgs` global object has been replaced with `script` which provides slightly different properties. Be sure to check the manual.

### Processing Parameter
In previous version of Rxindi only the data source could be specified when processing a document. With this release you can now also include an arbitrary string parameter as input for processing. This value can be used in scripts but is also mapped as an attribute onto the root context when processing the template, meaning it can be accessed via the path `/@rxc-parameter` on any statement type that expects an XPath.

Use-cases for this are:
- Providing context (e.g. an ID) when invoking Rxindi through automation 
- Selecting a specific record or row from the file used a data source

### Script Return Values
Previously, returning details about errors in a script or getting some sort of logging information out of a script could be quite cumbersome. With this version you can simply return a string with a message (either on success or failure) or throw an Error with a message and that message will be shown in the Rxindi panel (on failure) and be logged in the log file (always).

### Script Triggers
Rxindi now has the concept of scripts that get automatically triggered during certain phases of processing: `init`, `start` and `end`. By including the trigger in the SCRIPT statement, like so: `${&myscript.js:end}`, a script will be automatically executed in the given phase, regardless of where it was defined in the document. The guaranteed execution order allows you to perform operations that would previously been more difficult. For example, it is now trivial to save and export your documents using an `end` trigger. 

And using an `init` trigger, which executes even before the Data Source is loaded, you can switch to, convert or even create your own Data Source (or Parameter) and then have it loaded by Rxindi as part of a processing action. 

### Public API
A simple asynchronous API for invoking Processing of the currently loaded template document with optionally a (different) Data Source and Parameter is now available. The actual API call must be invoked from ExtendScript but, via the `doScript` InDesign DOM method, can be wrapped and called from other (scripting) languages as well.

### More Options
The Options menu has been expanded with a new Sub-menu: `Display`. It contains toggles for showing or hiding the full path of the selected Data Source and for showing or hiding the new processing Parameter input control.

--- 
# Previous releases

**Version 1.4.1** | _2024-02-12_

- Correctly apply `tcstyle` and `tcrstyle` ACTION in ROWREPEAT
- Corrections in manual

**Version 1.4.0** | _2024-01-23_

- Table styling actions
- Improved mapping for JSON, CSV and XLSX
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
- Fix escaping of comma, semicolon and closing curly braces
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
Copyright ® 2020-2024 Rxcle. All Rights reserved.
