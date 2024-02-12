# Rxindi release notes

## This release

**Version 1.4.1**

- Correctly apply `tcstyle` and `tcrstyle` ACTION in ROWREPEAT
- Corrections in manual

**Version 1.4.0**

- Table styling actions | [details](#table-styling-actions)
- Improved mapping for JSON, CSV and XLSX | [details](#improved-mapping)
- Improved behavior of LOOP and ROWREPEAT | [details](#improved-behavior-for-loop-and-rowrepeat)
- Removed support for Frame Statements | [details](#removed-support-for-frame-statements)
- Improved and extended QR Code support for OUTPUT | [details](#improved-and-extended-qr-code-support-for-output)
- Support referencing grouped styles for ACTION | [details](#support-grouped-styles-for-action)
- Options menu with logging level and compatibility mode | [details](#options-menu)
- Improved stability of data file conversion
- Improved help file and added option to open in browser
- Correctly clean-up COMPONENT content on process
- Correctly handle NaN in LOOP and ROWREPEAT
- Correctly replace XML root node for Load into XML Structure
- Fix escaping of comma, semicolon and closing curly braces
- Fix processing error on a document with no text frames
- Correctly report error location in case of overset text
- Various other robustness and stability improvements

[Previous releases](#previous-releases)

## Changes in detail

### Table styling actions
The ACTION statement now has four new types for changing the styling of a table dynamically: `tstyle` (Table Style), `tcstyle` (Table Cell Style), `tcrstyle` (Table Cell Row Style) and `tccstyle` (Table Cell Column Style). All these must be specified in a cell in the part of the table you want to change the styling of. As with other ACTIONs, you'd typically embed these in an `IF` to get conditional styling.

### Improved mapping
The ability to use data files of type JSON, CSV or XLSX (besides the native XML input format) has been in Rxindi for a long time already, but unfortunately the number of systems on which this worked correctly had been low. Additionally, even if it _did_ work, the mapping projection used for these file types had some usability concerns. With this release all this has been addressed. The JSON, CSV and XLSX mapping has been rewritten from the ground up, which should result in a much better experience this time around. Also, the default mapping has been changed, making it much more capable and usable. In addition, Rxindi now offers more choice when it comes to how data is mapped. Besides the new Default mapping mode, you can switch back to the Classic mapping from v1.3 and with the "Raw" mapping mode Rxindi can now even process CSVs and XLSX without headers. The mapping mode can be switched using a new option in the Rxindi panel menu.

> Note that the new default mapping mode is a **breaking change** please consult the Migration guide.

### Improved behavior for LOOP and ROWREPEAT
The behavior of LOOP and ROWREPEAT has been changed to make it more consistent, less reliant on variations in data and more compliant with standard XPath. This should fix most if not all "surprises" you might have encountered while working with repeating content via LOOP or ROWREPEAT. This change does mean that in some cases you have to be a bit more specific when writing paths to indicate to Rxindi what your intentions are.

> This is a **breaking change** please consult the Migration guide or enable `Compatibility Mode` in Rxindi for existing documents.

Take the following example:
```xml
<data>
  <productlist>
    <product>A</product>
    <product>B</product>
    <product>C</product>
  </productlist>
  <stock>5</stock>
</data>
```

If you want to loop over all `product` elements then in previous versions, you'd write a path to `productlist`, e.g. `/data/productlist`. Starting from this version you'd write something like `/data/productlist/product` (or `/data/productlist/*` or even `//product` will work too in this particular example). This new behavior ensures that custom XPath filters and paths that resolve to either a single or to multiple elements (or attributes) now always give correct and consistent results.

Looping a set number of times based on a number from data now requires the actual result type from the path to be explicitly of type number, boolean or string. In previous versions you could point it to any element or attribute and Rxindi tried to interpret the contents automatically. This logic could lead to unintended results in certain cases, which is why it now has been removed. Instead, you explicitly state the desired behavior in the path. 

Given the earlier example, if you want to loop the number of times (5) specified in the `stock` element, then the correct way to do this is: `number(/data/stock)`. Specifying the path just as `/data/stock` will loop just once, as it will loop over the `stock` element instead (of which there is one).

### Removed support for Frame Statements
Support for Rxindi statements in Script Labels of frames has been removed in this version. This decision has been made to allow Rxindi to focus on a single, uniform way and place for statements going forward. 

> This is a **breaking change** please consult the Migration guide or enable `Compatibility Mode` in Rxindi for existing documents.

Frame Statements had some fundamental flaws both from a conceptual and implementation perspective, which made them awkward and error-prone to use, and hard to maintain from a development and test perspective. Additionally, they didn't offer any _actual_ benefits. Anything (and more) that could be achieved with Frame Statements can be done as well using "regular" statements in placeholders in a text frame, using targets.

What this means in practice (if you were using them in templates): Frame names starting with a `$` are no longer treated in any special way and any Rxindi statements in their Script Label are ignored. 

### Improved and extended QR Code support for OUTPUT
The QR Code support for OUTPUT has been reworked to make it more stable. Additionally, _all_ QR Code Types available in InDesign (including those taking multiple input fields, like Email) are now supported. The manual has a dedicated section which has much more detail on how to update QR Codes using Rxindi.

### Support grouped styles for ACTION
The style changing ACTION types (e.g. `pstyle`, `cstyle`, ...) refer to a style name in InDesign. In previous versions Rxindi did not support styles defined in a Style Group in InDesign. With this version you can now refer to styles in groups by simply specifying the full path to the style using a forward slash `/` as separator between group name(s) and the actual style name. For example: `${!pstyle:StyleGroupA/StyleGroupB/MyStyle}`.

### Options menu
Starting from this version Rxindi has a couple of options that can be configured from within its user interface. In the Rxindi panel menu (top-right) you will find a new `Options` item, which is in the same location as the `Reinitialize` menu item from previous versions (this has moved inside the Options menu). In the sub-menus you can now change the Logging level, the Compatibility mode (for backwards compatibility) and mapping mode.

--- 
# Previous releases

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