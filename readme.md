# Rxindi

Rxindi is an [Adobe InDesign Extension](https://exchange.adobe.com/apps/cc/103684/rxindi) that allows for powerful one-click data merge, document composition and dynamic processing of reusable InDesign templates based on content coming from a variety of formats.

1. Get the [Rxindi InDesign Extension](https://exchange.adobe.com/apps/cc/103684/rxindi) on Adobe Marketplace
2. Open its interface via `Window` `>` `Extensions` `>` `Rxindi`
3. Create a template InDesign document with special placeholder statements inside text frames for any variable data or automation that needs to occur
4. Select a Data Source file: Excel (XLSX), CSV, XML or JSON
5. Process the document

Rxindi is simple to use, very lightweight and portable. The statements used for the processing instructions are all plain text and stored within you regular InDesign documents. No special plugins are needed to write them or to open/edit documents that contain them.

- [Full user manual](help.md) (also included with Rxindi)
- [Release notes](releasenotes.md) for the latest version

## Capabilities
- Use XML, CSV, JSON or XLSX as input data
- OUTPUT arbitrary content from the selected data file (using XPath) to:
    - Text
    - Images
    - QR Codes
- Conditional content (IF-ELSE)
- Repeat content (LOOP)
- Generate table rows (ROWREPEAT)
- Create and reuse content COMPONENTs: Define a snippet once and use it many times with different data
- Automatically execute custom SCRIPTs on inline text or frames
- Perform special ACTIONs such as:
    - Dynamically Hide/Show frames
    - Apply Object/Paragraph/Character/Table/Cell styles
    - Dynamically choose a State for Multi-state objects

## Statement syntax
Rxindi Statements consist of a single character (e.g. `=`, `?`) followed by arguments and can be used in inline text anywhere in the document. To separate them from regular content in text they are placed in a `${...}` placeholder, e.g. `${=FirstName}`.

Multiple statements are separated by placing them in separate placeholders: `${=FirstName} ${=LastName}` or by placing them in the same placeholder separated with a semicolon or a newline: `${=FirstName;=LastName}`. Anything outside placeholders is treated as story content, but a powerful feature of Rxindi is that it does participate in processing, e.g. when using conditionals (IF-ELSE), repeating content (LOOP) or Components.

The following is an example with various statements an example that outputs "_FirstName_ _LastName_" or just "LastName"
```
${?HasFirstName}${=FirstName}${:}  ${=' ';   .;   =LastName}
  ^IF             ^OUTPUT      ^ELSE ^OUTPUT ^END ^OUTPUT
```

In this example, _HasFirstName_, _FirstName_ and _LastName_ are XPath queries (the path to an element) for the data source document that is to be used

## More info
- Tutorial videos on the [Rxcle YouTube Channel](https://www.youtube.com/channel/UCiSFFEuOoIQdk6mivM3eGkQ)
- Homepage on [Rxcle website](https://rxcle.com/rxindi)
- Issues, questions and suggestions via [GitHub Issues](https://github.com/rxcle/rxindi/issues)