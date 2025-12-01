# Rxindi Migration Guide

This document explains how to migrate template documents from an earlier version of Rxindi to the latest version.

Note that while migrating template documents to be compatible with the latest Rxindi version is highly recommended, Rxindi also offers a "Compatibility Mode" that allows you to process templates made for an older version without changes in the latest version.

## From v1.5

### Line breaks

Rxindi v2.0 features new behavior when mapping line break characters from the data source. The type of line break character in the data source now determines how the content ends up in the document via the `OUTPUT` statement. To regain the old behavior, you can switch the compatibility mode to `v1.5` in the panel menu.

### API

For automation, Rxindi v2.0 has a completely new scripting API. The classic API from v1.5 is not supported at all (also not in compatibility mode). For more information, please read the dedicated API section in the manual.

### Script Triggers

Triggers for the `SCRIPT` statement, via the `:init`, `:start` and `:end` suffix, have been removed. To select a data source via a script, which was possible with the `init` trigger previously, create a custom script which calls Rxindi through its extensive new API and execute that script directly instead. 

Functionality for triggering statements on `start` and `end` remains available in a different form: Auto Trigger Components. For example, instead of `${&myscript:start}`, use: `${#on:start}${&myscript}${.}`. The available Component triggers are: `on:start`, `on:end` and `on:after`. To run scripts or other statements that act upon a fully processed document (e.g. to save/export), use the `on:after` trigger, which is the closest functional equivalent to the `:end` legacy script trigger.

### Component Names

Component names in Rxindi v2.0 have stricter rules, to ensure correct matching behavior and avoid blocking potential future use-cases. The name was (mostly) unrestricted in previous versions. The allowed name for a component in Rxindi v2.0 now follows the same rules that apply to an XML Element name: It must start with a letter or underscore, and can only contain letters, digits, underscores, hyphens, or dots. The colon is only allowed as a (known) prefix separator. The only allowed prefixes are `fn:` and `on:`.

## From v1.0-v1.4

### Script Arguments
The `scriptArgs` object exposed to scripts is no longer available. Instead, use the `script` object.
- The new `script` object has the same `document`, `target`, and `name` properties as `scriptArgs`.
- The `args` array property replaces the `params` property.
  - The values in this array are always of type `string`, `number`, or `boolean`.
  - (For `scriptArgs`, it could also be of type XML - this is not the case for `script`.)
- There is no direct alternative for the `context` property from `scriptArgs` on `script`. Instead, pass the desired state as custom arguments to the SCRIPT statement and use the `args` array.

### Script File Lookup
File extensions can now be supplied to indicate the type of script to load; previously, they were not _allowed_.
- ExtendScript: `.js` or `.jsx`
- UXP: `.idjs`

If no file extension is supplied, then the lookup order is now as follows (until a match is found):
- `<name>.js`
- `<name>.jsx`
- `<name>.idjs`
- `scripts/<name>.js`
- `scripts/<name>.jsx`
- `scripts/<name>.idjs`

### Script Return Values
Previously, any return value except for a `boolean` value of `false` was ignored. This has now changed. The following return values can be used:
- `return false` - Halt processing (existing)
- `return "string"` - Continue but log message
- `return [true, "string"]` - Continue but log custom message
- `return [false, "string"]` - Halt processing with custom message
- `return [false]` - Halt processing
- `throw Error("string")` - Halt processing and log message

### Frame Statements
#### Change
- All statements need to be placed in text frames
- Statements in scripting labels of frames are ignored

#### This affects you only when
- You have frames with a name starting with `$...`
- The scripting label of the frame has Rxindi statements which you expect to execute 

#### Migration Steps
- Make sure that the frame that you want to target has a unique name (InDesign Layers panel)
- Create a new text frame or use an existing one (can be off-page or on a hidden layer)
- Move the statements from the scripting label into a text frame (make sure to surround them with placeholders `${...}`)
- Add the name of the frame you want to target on as an argument for `OUTPUT`, `ACTION`, and `SCRIPT`

### Path Behavior for LOOP and ROWREPEAT

#### Change
- The path supplied for LOOP/ROWREPEAT needs to:
    - Point directly to the elements themselves that need to be looped over (not their container/parent)
    - _or_ be of actual type `number`, `string`, or `boolean` (e.g. via cast) to loop that number of times
        - In case of `string` or `boolean` it will loop either 0 times (empty string/false) or 1 time (non-empty string/true).
        - A numeric value in a string (e.g. the straight value of an element/attribute) is no longer used as a number, it needs to be explicitly cast to one via `number(...)`
- In general, the behavior has become much more sensible and consistent as it much more closely follows common XPath behavior.

#### This affects you only when
- You have paths on LOOP or ROWREPEAT that point to a container/parent element, and you expect it to loop over its children
- You have a path to an element/attribute value containing a numeric value (as text) and expect it to loop that number of times

#### Migration Steps
- For looping over elements:
    - Adjust all paths to point to the actual elements you want to repeat.
        - Typically, the path should end with the actual element name. 
        - For example, if the path in a previous version was `orderdata/productlist` and you expect to loop over the `product` elements contained in `productlist` then adjust the path to: `orderdata/productlist/product`
- For looping a number of times:
    - In case it is a hard-coded value (not coming from the data), e.g. `5` then you don't have to do anything
    - In case the value comes from data, you must explicitly cast the result to a number
        - For example, if in data the element `orderdata/productcount` has a value of `"5"` and you want to loop that number of times then you need to change the path to `number(orderdata/productcount)`.

### Data Mapping Changes

#### Change
- Rxindi has new default mapping conversion behavior when using JSON, CSV, or XLSX (Excel) data files
- The new mapping is more consistent and handles edge cases in input data in a better way
- Rxindi now has a total of 3 possible mapping modes: Default, Raw, and Classic
    - Raw mapping mode will not map property/column names onto XML element names
    - Classic mapping mode retains the mapping behavior from previous versions

#### This affects you only when
- You use input data of type JSON, CSV, or XLSX
- For input data of type XML, there is no change in behavior

#### Migration Steps
##### Option 1: Switch the Mapping Mode to `Classic`
- The original mapping behavior is also still available in Rxindi 1.4 as an option
- This can be toggled separately from the general Compatibility Mode
- Go to the Rxindi panel Menu and select `Options` `>` `Mapping Mode` `>` `Classic`
    - Note that when in v1.3 Compatibility Mode this option cannot be toggled (it will always use Classic mapping mode)
- With this mapping mode, all paths for data coming from JSON, CSV, or XLSX can remain the same as in previous versions and no further changes are needed

##### Option 2: Change paths for one of the new mappings `Default` or `Raw`
- **JSON - Mode Default**
    - Element name changes:
        - Root element: `Root` -> `data`
        - Array elements: `Item` -> `p`
    - All JSON property names that are not a valid XML Element name will now get (prefixed with) the character `p` for a name
    - The `@name` attribute is added on all elements, it contains the original JSON property name and array index number for array items
- **JSON - Mode Raw**
    - Element name changes:
        - Root element: `Root` -> `data`
        - Array elements: `Item` -> `p`
    - All property elements are named `p`
    - The `@name` attribute is added on all elements, it contains the original JSON property name and array index number for array items
- **CSV - Mode Default**
    - Element name changes:
        - Root element: `Root` -> `data`
        - Row element: `Row` -> `row` (casing)
    - Attribute `@index` on row and column (starting at `1`)
    - Attribute `@name` on column, contains the original name of the column
    - All column names that are empty or not a valid XML Element name will now get (prefixed with) the character `c` for a name
    - Elements have no `@type` attribute (the actual type is not known in CSV)
- **CSV - Mode Raw**
    - Element name changes:
        - Root element: `Root` -> `data`
        - Row element: `Row` -> `row` (casing)
    - The header row (if present) is treated as a regular row
        - In this mode columns have no name, only an index
    - All column elements are named `c`
    - Attribute `@index` on row and column (starting at `1`)
    - Elements have no `@type` attribute (the actual type is not known in CSV)
- **XLSX - Mode Default**
    - Element name changes:
        - Root element: `Root` -> `data`
        - Sheet element: `Sheet` -> `sheet` (casing)
        - Row element: `Row` -> `row` (casing)
    - Attribute `@index` on row, sheet, and column (starting at `1`)
    - Attribute `@name` on sheet and column, contains the original name of the sheet/column
    - All column names that are empty or not a valid XML Element name will now get (prefixed with) the character `c` for a name
    - Attribute `@type` is only available on column elements, it indicates the type as specified in the original file.
- **For XLSX - Mode Raw**
    - Element name changes:
        - Root element: `Root` -> `data`
        - Sheet element: `Sheet` -> `sheet` 
        - Row element: `Row` -> `row`
    - The header row (if present) is treated as a regular row
        - In this mode columns have no name, only an index
    - All column elements are named `c`
    - Attribute `@index` on row, sheet, and column (starting at `1`)
    - Attribute `@type` is only available on column elements, it indicates the type as specified in the original file.

---
Copyright ® 2020-2025 Rxcle. All Rights Reserved.
