# Rxindi

> Note: If you find issues or have suggestions for improving Rxindi then [give your feedback](https://github.com/rxcle/rxindi/issues).

## What is it
Rxindi is an [Adobe InDesign Extension](https://exchange.adobe.com/creativecloud.details.103684.rxindi.html) that allows for powerful one-click data merge, document composition and dynamic processing of reusable InDesign templates based on content coming from a variety of formats.

## How does it work
1. Get the [Rxindi InDesign Extension](https://exchange.adobe.com/creativecloud.details.103684.rxindi.html) on Adobe Marketplace
2. Open its interface via `Window > Extensions > Rxindi`
3. Create a template InDesign document with special placeholder statements inside text and on frames for any variable data or special automation that needs to occur
4. Select a Data Source file
    - Excel (XLSX)
    - CSV (Comma separated plain text)
    - XML
    - JSON
5. Process the template

Rxindi is simple to use, very lightweight and portable. The statements used for the processing instructions are all plain text and stored within you regular InDesign documents. No special plugins are needed to write them or to open/edit documents that contain them.

Processing a prepared template document is an incredibly simple 2 step process: Select the data file and click "Process".

## What about built in XML Import / Data Merge?
Rxindi is not intended as a simple drop-in replacement for those. What Rxindi provides is a much more flexible approach to document composition. The input format can be anything (and be vastly different from the document structure) and automation using conditional/repeating behavior and special actions that need to occur based on the data can be specified. Because of the flexible nature of you can even combine XML Import / Data Merge with Rxcle, by doing a bulk import first and then do a fine-tune run using Rxcle.

## What kind of statements/actions does Rxindi allow me to perform?
- Output arbitrary content from the source document
- Reusable content components (define a text snippet once and use it many times with different content)
- Conditional content (if-else)
- Repeating content (loops)
- Automatically execute custom scripts on inline text or frames
- Dynamically Hide/Show frames
- Dynamically apply Object/Paragraph/Character styles
- Dynamically choose a State for Multi-state objects

## Do I need programming experience
Not at all. Although Rxindi is based on industry standards like XML and XPath, its statement syntax is simple enough for anyone to learn and use. If you do have some programming knowledge you can leverage more advanced techniques like creating custom scripts that can be easily integrated into processing. 

## Statement syntax
Rxindi Statements consist of a single character (e.g. `=`, `?`) followed by arguments and can be used in inline text anywhere in the document. To distinguish them from regular content in text they are placed in a `${...}` placeholder, e.g. `${=FirstName}`. Statements may also be used on frames, in this case the target frame is referenced by its name using the `${}` statement. 

Multiple statements can be separated with a semicolon or a newline: `=FirstName;=LastName`. For inline statements cab also be separated by placing them in separate placeholders: `${=FirstName} ${=LastName}`. Anything outside placeholders is treated as story content but a powerful feature of Rxindi is that it does participate in processing, e.g. when using conditionals (if-else), repeating content (loops) or components.

The following is an example with various statements an example that outputs "_FirstName_ _LastName_" or just "LastName"
```
?HasFirstName; =FirstName; :;    =' ';   .;   =LastName
^IF            ^OUTPUT     ^ELSE ^OUTPUT ^END ^OUTPUT
```

In this example, _HasFirstName_, _FirstName_ and _LastName_ are XPath queries (the path to an element) for the data source document that is to be used

## FAQ

### Where do I get it
Download Rxindi from the Adobe Marketplace. During the preview phase Rxindi is available for free.

### Which versions of InDesign does it support
Rxindi requires InDesign CC 2019 or newer. Both the MacOS and Windows versions are supported.

### More?
This only scratches the surface of possibilities. Want to know more? See the included full user manual that is included with Rxindi.

---
Copyright &copy; 2016-2020 [Rxcle](https://www.rxcle.com)