# Rxindi

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

[Introduction Video](https://www.youtube.com/watch?v=2Aye7q93Qc0)

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

Multiple statements are separated by placing them in separate placeholders: `${=FirstName} ${=LastName}` or by placing them in the same placeholder separated with a semicolon or a newline: `${=FirstName;=LastName}`. Anything outside placeholders is treated as story content but a powerful feature of Rxindi is that it does participate in processing, e.g. when using conditionals (if-else), repeating content (loops) or components.

The following is an example with various statements an example that outputs "_FirstName_ _LastName_" or just "LastName"
```
${?HasFirstName}${=FirstName}${:}  ${=' ';   .;   =LastName}
  ^IF             ^OUTPUT      ^ELSE ^OUTPUT ^END ^OUTPUT
```

In this example, _HasFirstName_, _FirstName_ and _LastName_ are XPath queries (the path to an element) for the data source document that is to be used

## FAQ

### Where do I get it
Download Rxindi from the [Adobe Marketplace](https://exchange.adobe.com/creativecloud.details.103684.rxindi.html).

### Which versions of InDesign does it support
Rxindi requires InDesign CC 2018 through CC 2020. Both the MacOS and Windows versions are supported.

### Report bugs, request features
If you find issues or have suggestions for improving Rxindi then [give your feedback](https://github.com/rxcle/rxindi/issues).

### More?
This only scratches the surface of possibilities. Want to know more? 

- See the included full user manual that is included with Rxindi.
- Watch video's on the [Rxcle YouTube Channel](https://www.youtube.com/channel/UCiSFFEuOoIQdk6mivM3eGkQ)

## Examples

### Data Source

```xml
<Data>
    <Record id="1">
        <FirstName>Jane</FirstName>
        <LastName>Doe</LastName>
        <SpecialAccess>1</SpecialAccess>
        <Picture>imgs/001.jpg</Picture>
    </Record>
    <Record id="2">
        <FirstName>John</FirstName>
        <LastName>Smith</LastName>
        <Picture>imgs/002.jpg</Picture>
    </Record>
</Data>
```

### Example 1
Output _FirstName<SPACE>LastName_ of the first record

```
${=Record[1]/FirstName} ${=Record[1]/LastName}
```

### Example 2
Output _FirstName<SPACE>LastName_ of all records

```
${*Record}${=FirstName} ${=LastName}${.}
```

### Example 3
Output _FirstName<SPACE>LastName_ of all records. Suffix with _(SA)_ if user has SpecialAccess or _(NA)_ if user does not have special access.

```
${*Record}${=FirstName} ${=LastName} ${?SpecialAccess=1}(SA)${:}(NA)${.}${.}
```

### Example 4
Output _FirstName<SPACE>LastName_ of all records but declare the outputting part as a reusable Component.

```
${*Record}${@Comp1}${.}
${#Comp1}${=FirstName} ${=LastName}${.}
```

### Example 5

Output the picture of the first record to a picture fame named _ProfilePic_

```
${=Record[1]/Picture,ProfilePic}
```

## Release Notes

### v1.0.0
- First release

---
Copyright &copy; 2016-2020 [Rxcle](https://www.rxcle.com)