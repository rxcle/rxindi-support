# Rxindi

## Introduction

Rxindi is a plugin for Adobe InDesign. It enables you to automatically generate documents with unique data and design elements from a single template InDesign document and an external data file, which can be of type Excel, XML, CSV, or JSON. This functionality is commonly known as "Data Merge" or "Document Composition".

A unique aspect of Rxindi is that template documents can be created using only standard InDesign functionality, primarily with plain text; no special tools required. This also means that template documents for Rxindi are completely portable and can be edited or created even when you don't have Rxindi installed.

Rxindi imposes very few requirements on the actual layout of the input files. As long as your data is in one of the supported file types, you should be able to use it as-is.

There is a lot of flexibility and functionality for outputting not only text but also images and QR codes. Additionally, you can perform conditional logic and repeat structures, change styles, and much more, all based on variable external data.

## Data Source

The external data that is to be used to generate documents in Rxindi is called the _Data Source_. Templates are written with a specific data source structure in mind because inside the template you need to refer to the exact data that you want to use. You reference this data by writing _paths_. To tell Rxindi what to do with this data at this path you write Rxindi _statements_, which are types of instructions. For example, one of the statements is `OUTPUT`. You provide this statement with a path to data in the Data Source to let Rxindi know _what_ to output. When the template is complete, you select the actual data source that you want to use as variable input to generate a document with and then _Process_ with the Rxindi plugin. You can repeat this process any number of times using the same template document but different data.

Rxindi is not aware and does not care about the contents or structure of the Data Source as long as it is of a supported file type and the paths in your template match the structure of the file. These paths are written using the universal standard _XPath_. Internally all data in Rxindi is treated as XML. If the data source is of a different type, then it gets automatically and transparently converted to XML using a transparent mapping convention. See the [Data Source Reference](#data-source-reference) for more information.

The default behavior of Rxindi is to process a single document per Data Source. It is, however, also possible to automatically process multiple documents from a single Data Source when that contains multiple rows or records. See the section on [Multi-Record Processing](#multi-record-processing) for more information.

## Statements

Statements are instructions that tell Rxindi what to do. They are placed directly inside an InDesign Text Frame (or actually: Story). Rxindi supports many statements, for example: `OUTPUT`, `IF`, `LOOP`, and more. Every statement is associated with a single character, e.g. the `OUTPUT` statement is represented by the "equals" character: `=`.

In order to separate Rxindi statements from regular content in an InDesign Text Frame, they are placed in a _Placeholder_. The Rxindi placeholder format is `${...}`, where `...` represents the actual instruction statement(s) that you want to perform.

Example: 
```
Hello ${=FirstName}, your order is ${=OrderNo}
```

## Getting Started

### First Steps: Output

Content from the Data Source can be output into a story using the `${=...}` placeholder statement, where `...` is the actual reference to the content in the form of a path. In its most basic form, a path consists of element names, separated by slashes `/` for each step towards the element you want to reference.

Let's use the following example XML Data Source:
```xml
<Root>
  <Person>
    <FirstName>John</FirstName>
    <LastName>Smith</LastName>
    <Address>Baker Street 221A</Address>
  </Person>
</Root>
```

To output the first name of the person in the data source to the document, the following placeholder, statement, and path can be used in a text frame:
```
${=Person/FirstName}
```

When processing, this placeholder is replaced with the result: `John`. 
The full details of the person can be output as follows: 

```
${=Person/FirstName} ${=Person/LastName} lives at ${=Person/Address}
```

Note that the `Root` element from the Data Source is not specified in the path here. This is because `Root` is the default _Context_ and paths can be specified relative to the current context. You can also use paths by beginning the path with a slash. The absolute path to the first name then becomes: 
```
${=/Root/Person/FirstName}
```

All Data Sources are interpreted as XML on processing and all data paths in Rxindi follow the universal XPath (1.0) convention, including built-in XPath functions and conversions like `count()` and `number()`.

### Components

The person details output example from the previous chapter can be made into a more generic and reusable part by moving it into a _Component_. A Component is a uniquely named reusable set of InDesign content and/or Rxindi statements. Components have a definition part and a usage or "Placement" part. 

Components are defined in a Text Frame. It is recommended (but not necessary) to define components in a different Text Frame than where instances of it are to be placed. The Component definition Text Frame can be located anywhere, including unused Master Spreads, non-printing layers, or off-page. A Text Frame can contain multiple Component definitions. For our example, we'll define just one Component and name it `PersonDetails`. 

To define a Component, you start with the `${#PersonDetails}` statement, then write the Component contents and end with the `${.}` statement. The full definition of the example Component is as follows: 

```
${#PersonDetails}${=FirstName} ${=LastName} lives at ${=Address}${.}
```

Now in the location where we want to use this Component you use the `${@...}` statement, where `...` is the Component name. 

In this case, the full statement for placing an instance of a component is:

```
${@PersonDetails}
```

Symbols like `=`, `#`, and `@` specify the _Statement Type_ and should always be the first character in a `${...}` placeholder. 

Components typically expect certain data, which is the context on which data paths inside the Component are relative to. In our example, we have a data path to `FirstName`, so we will need a context that provides an element with that name.

If we only reference the Component and specify nothing else, then that Component will get the same data context as what is used at the location where we are referencing the component. In this case, that is the default context, which is `/Root`. In this particular case, we want to provide the Component with `/Root/Person` as context instead. If we do this, we can directly use the path to the `FirstName` element inside the Component. This makes the Component independent of a particular parent element.

In order to provide a context when placing the Component, a comma is placed directly after the Component name, followed by the path to the data that should be used as context for the Component. In this case, we want to provide `Person` (relative to `/Root`) as a context.

```
${@PersonDetails,Person}
```

To make things a bit more interesting let's use a Data Source with some more data:

```xml
<Root>
  <Person>
    <FirstName>John</FirstName>
    <LastName>Smith</LastName>
    <Address>Baker Street 221A</Address>
  </Person>
  <Person>
    <FirstName>Jane</FirstName>
    <LastName>Doe</LastName>
    <Address>Main Street 101</Address>
  </Person>
</Root>
```

The `Root` element now no longer contains a single child element but rather a _list_ of child elements. This has important implications for the data path because we now have to specify _which_ `Person` we want to show the details of. 

Data paths are in fact _XPath_ queries and within XPath, there are many ways to select a particular element. In this case, we'll keep it simple and just specify the numeric index of the element. This is done by appending the element name with `[1]` (1 here refers to the first element).

To place two separate instances of the `PersonDetails` component and fill them with the details of the two persons from the data, you can use the following statements:

```
${@PersonDetails,Person[1]}
${@PersonDetails,Person[2]}
```

In case you do _not_ provide a specific index for `Person` here but keep the statement with path simply as `${@PersonDetails,Person}`, the path on the data source would match 2 elements here. These would both be passed to the Component instance. Inside the Component, we match any `FirstName` which will also match 2 elements (one for each Person). In other words, the result would be `JohnJane SmithDoe lives at Baker Street 221AMain Street 101`. In this case, this is not what you'd want.

### Conditionals

By default, all statements in Rxindi are executed unconditionally, regardless if the specified path returns no matching data. Often, you'd only want to include certain data or perform actions in a document based on some condition though. This condition can be that data must be present or that a certain element in the data has a particular value.

Given our Person example, say that a Person may have a title, and there is another element that specifies whether that title should be output. We could use the following conditional statement set for this:

```
${?HasTitle=1}${=Title} ${.}${=LastName}
```

Let us break this down into its individual elements

| Part             | Statement | Description                                                                                                                                                                                                                                                                                                   |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `${?HasTitle=1}` | `IF`      | The `?` indicates that this is an `IF` statement. It is immediately followed by an expression, in this case `HasTitle`. If this has value "1" then consecutive statements are processed.                                                                                                                      |
| `${=Title}`      | `OUTPUT`  | Output the value of `Title`, but because it directly follows the `IF` statement, this only happens if that evaluated to _true_.                                                                                                                                                                               |
| `${.}`           | `END`     | This ends the _statement block_ started by the `IF` statement. It is necessary here because otherwise _everything_ following the `IF` would be processed only if that evaluated to _true_. We only wanted the `OUTPUT` statement for the Title to be conditional though so that is why we end the block here. |
| `${=LastName}`   | `OUTPUT`  | Output the value of `LastName`. Because this follows an `END` this statement is _not_ conditional and always processed.                                                                                                                                                                                       |

The following example shows a statement that outputs either the Title _or_ FirstName and always the LastName:

```
${?HasTitle=1}${=Title} ${:}${=FirstName} ${.}${=LastName}
```

This statement set is similar to the previous one, only the new statements will be explained.

| Part            | Statement | Description                                                                                                                                                  |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `${:}`          | `ELSE`    | Ends the _statement block_ started by the `IF` statement and starts a new statement block that only is processed if the preceding `IF` evaluated to _false_. |
| `${=FirstName}` | `OUTPUT`  | Output the value of `FirstName`. Because it follows an `ELSE` statement, it will only be processed if the initial `IF` evaluated to _false_.                 |

The example can also be written using an alternative syntax as follows:

```
${?HasTitle=1;=Title;:;=FirstName;.;=string(' ');=LastName}
```

Here the entire `IF`-`OUTPUT`-`ELSE`-`OUTPUT` statement set is placed in a single placeholder and the individual statements are separated by semicolons. The result of this is exactly the same as the previous example.

## Multi-Record Processing

Rxindi has an agnostic attitude towards the layout of the Data Source and makes no assumptions about what it represents. Meaning is given to the data by using statements that take specific data from the Data Source using paths. 

When a Data Source contains multiple logical records/rows of similar data, it could mean that you want to create a single document that contains all this data, organized in a certain way. For this, the `LOOP` and `ROWREPEAT` statements can be used to iterate over the records.

Alternatively, it could mean that you want to generate a separate document for each record. This is possible with Rxindi by indicating explicitly what the logical data "root" elements are inside the Data Source, using a path. If this path resolves to multiple elements, then the document is processed for each matching element. Setting the data root is done with the `ACTION` statement, using the [Set action](#set-action) with the `dataroot` option.

For example, including the following statement in the template document, will cause the document to be processed for each row in a CSV data source (assuming Default Mapping Mode):
```
${!set:dataroot,/data/row}
```

Note that, because Rxindi does _not_ save processed documents by default, you would typically pair this with the [Export action](#export-action):
```
${#on:after}
${!export,concat("record-", $x:record-index, ".pdf")}
${.}
```

Here, the System Variable `$x:record-index` is used. This variable is automatically set by Rxindi to the numerical record index number (starting at 1). Also available is the `$x:record-count` variable, which contains the total number of records.

Note that setting the `dataroot` to a single element (rather than a list) is also perfectly valid. In this case the document is just processed once, though all paths towards data in the template will be relative to the given root element.

---
## User Interface

The user interface of Rxindi consists of a single InDesign panel which can be opened via the `Plug-ins` `>` `Rxindi` menu in InDesign. The panel has three sections which can be expanded and collapsed.

- `Prepare`
    - This section has a quick reference guide of all available statements.
    - The `Validate Statements` button performs a quick statement validation on the current document.
        - Validation only catches basic syntax errors; it will not detect logical issues (e.g., incorrect paths to data) nor will it detect references to non-existing frames, styles, etc.
        - Validation makes no changes to the document.
- `Process`
    - Here you can (optionally) select a data source file (XML, JSON, CSV, XLSX).
      - By default, only the file name of the selected data source is shown; toggle the full path via `Options` `>` `Display`.
    - Optionally, you can also specify a custom processing parameter.
      - The input field for this is hidden by default; enable it via `Options` `>` `Display`.
    - The `Process Document` button starts the actual processing.
        - In order to process a document, it must have been _saved_ and _unmodified_.
    - In case `Compatibility Mode` is enabled, this is shown here with a text label.
      - Toggle this on/off via the Rxindi Options under `Options` `>` `Compatibility`.
- `Result`
    - This will show the result of the last Validate or Process action.
    - Some errors will include a clickable link that will (attempt to) go to the source statement in the document that caused the error.

Additionally, on the top-right of the panel, there are two buttons that open the `Options` and `Help` respectively.

In the `Options` view, the following items can be found. These are also accessible directly via the Rxindi Panel Menu.

  - `Compatibility`: Set the processing compatibility mode.
    - `Latest`: (Recommended) Templates are compatible with this version of Rxindi.
    - `Rxindi v2.1`: Process in v2.1 compatibility mode - some newer features may not be available.
    - `Rxindi v1.5`: Process in v1.5 compatibility mode - some newer features may not be available.
  - `Mapping Mode`: Sets the mode to use for data file mapping (JSON, CSV, XLSX).
    - `Default`: Default mapping behavior. Assumes headers are present for CSV and XLSX and maps them.
    - `Raw`: Do not map property/column names and treat headers for CSV and XLSX as regular data.
  - `Logging`: Set the logging level.
    - `Normal`: (Recommended) Regular logging of processing steps and errors.
    - `Verbose`: Log very detailed information during processing; log files can become large - only enable when troubleshooting.
  - `Display`: Display options.
    - `Data Source Full Path`: Show the full path of the Data Source (enabled) or only the file name (disabled).
    - `Parameter`: Show the processing Parameter input field in the panel (enabled) or hide it (disabled).
    - `Show on Startup`: Show the Rxindi panel automatically on InDesign startup (enabled) or when explicitly opened (disabled).
  - `Actions`:  Perform advanced actions
    - `Load into XML Structure`: Loads the current data source into InDesign's (XML) Structure.
    - `Reinitialize`: Reload Rxindi - Typically only needed in case of issues.
    - `Logs`: Opens the directory that contains the log files.

### Compatibility Mode
In order to add certain new features and improve the general behavior of Rxindi, some versions have breaking changes in behavior compared to a previous one. This is, for example, the case when upgrading to v2.0 from a previous version.

Unfortunately, this _can_ mean that template documents made for an earlier version of Rxindi no longer behave as expected in the latest version, depending on the features of Rxindi used.

Using the `Options` `>` `Compatibility` settings in the Rxindi Options, you can explicitly switch the processing behavior back to a previous version to allow you to process these older template documents as-is. When set to anything else but `Latest`, the main Rxindi interface will also display the applied compatibility version, e.g., `v1.5`, to indicate that processing behavior will deviate from what it would be with the latest version.

The Rxindi manual only explains the functionality and behavior for the _latest_ version, which may not match with the behavior you see in Compatibility Mode. Also, be aware that Compatibility Mode attempts to emulate the old behavior as closely as possible, meaning that newer features and processing improvements may not be available in this mode. 

### Mapping Mode
The mapping mode determines how data files from a format other than XML are converted. This impacts the paths you write in order to get data from the data files. The difference between "Default" and "Raw" mainly determines how property names and column headers map to element names. See the [Data Source Reference](#data-source-reference) section for details on each mode.

---
# Statement Details 

Rxindi performs its processing on an InDesign document based on processing instructions called _"Statements"_. These statements can be placed in the Story of any Text Frame.

In order to identify Rxindi statements in inline text, and to distinguish them from other content, they must be placed in a _placeholder_. Placeholders use a set of character combinations that is unlikely to occur in normal text. For Rxindi, the placeholder syntax is `${...}` where the `...` marks the location where the actual statements go. An example of an actual placeholder with a statement is `${=FirstName}`. On processing, this placeholder and statement are replaced with the contents of a _FirstName_ element.

> Placeholders only exist as a _container_ for Rxindi Statements; they perform no logic in itself. For instance, `${}` is a valid placeholder which does nothing and `${blabla}` is a valid placeholder which contains an _invalid_ statement.

## Statements
Statements specify the actual processing action for Rxindi to perform. All statements start with a single symbol that indicates the statement type. This must be the first non-whitespace character following either a placeholder opening `${` or multi-statement separator `;` (more on this later).

Many statements also expect one or more arguments. The main argument directly follows the statement symbol. Additional arguments follow the main argument, separated by a comma. Note that the expected arguments and their meaning vary per statement type.

An example of a statement with two arguments:

```
${@PersonDetails,Person[1]}
```

| Part            | Meaning                             |
| --------------- | ----------------------------------- |
| `${`            | Placeholder start                   |
| `@`             | Statement symbol - `PLACE`          |
| `PersonDetails` | Main argument - Component name      |
| `,`             | Argument separator                  |
| `Person[1]`     | Second argument - XPath for context |
| `}`             | Placeholder end                     |

## Blocks
Certain statements implicitly start a logical scope _Block_ in which all consecutive statements are processed until the Block is closed. Blocks are closed either implicitly or explicitly. For example, the `IF` statement (`${?...}`) will start a block. This means that everything following the `IF` statement is placed in a block and only gets processed if the `IF` is _true_. The block is either explicitly closed using an `END` statement (`.`) or implicitly by using an `ELSE` statement, which will actually start a _new_ implicit block for the `ELSE`. Additionally, the end of an InDesign story or a Table cell also implicitly closes all open blocks. 

The statement types that have block behavior are: `IF`, `ELSE`, `LOOP`, and `COMPONENT`.

Block statements may be nested, meaning that you can place an `IF` in an `IF`, etc. When closing blocks explicitly, make sure that the `END` statements match up with the opening statement to get the desired behavior.

## Multiple Statements
Multiple statements can optionally be placed in a single placeholder by separating them with a semicolon `;` sign. For example, `${=FirstName;=LastName}` will give the same result as `${=FirstName}${=LastName}`. 

InDesign content can only go between placeholders, so there are cases where combining statements in a single placeholder will not work, e.g., `${?sayHello}Hello ${=FirstName}${.}`. Here the `IF` needs to be in a separate placeholder; otherwise, the literal "Hello " cannot be included. The `OUTPUT` and `END` could be combined though: `${?sayHello}Hello ${=FirstName;.}`

## Literal Placeholder
If you want to use the _literal_ placeholder `${...}` character combination as text in an InDesign document that needs to be processed by Rxindi, you need to prefix it with a zero-width space (U+200B) or zero-width non-joiner (U+200C) character. So `<ZWPS>${...}`. This will ensure that Rxindi will ignore these placeholders completely.

Note that the zero-width space/non-joiner must be placed _immediately_ before the opening `$` character with no other characters or whitespace in between.

## Reserved Characters
The closing curly brace `}` is a reserved characters in all statement arguments within Rxindi placeholders and cannot be used directly. To use it, you must escape it by prefixing it with a backslash: `\}`. This _also_ applies to XPath literal strings and XPath function calls! All other characters can be used directly

Take special note of the characters comma `,` and semicolon `;` as these are also used to separate statement arguments and statements. The rules for these are as follows: When used in a literal string (with single or double quotes), e.g. `"Hello, world"` or, in case of XPath, in a function `concat("Hello", "World")` then they are not treated as separators. Outside of these contexts they _are_ argument/statement separators. 

## Processing Parameter

The primary inputs for processing are:
- An InDesign document, which for Rxindi is always the _current_ active document in InDesign
- An optional path to a data source file to use
- An optional processing parameter

The latter is a custom string that can be set to any value. Its value is not interpreted by Rxindi, but scripts and statements may use this value in a way that makes sense to the template or data to be processed. 

If it has a value, then the parameter is made available as the `$x:parameter` System Variable. This value may be used directly in output or as a filter for any other path. Do note that the value is always stored as a _string_; if you want to use it to, for instance, select a specific numeric index (like a row number in a spreadsheet), then you have to cast it to a number first.

Examples:
```
${=$x:parameter}
${=/data/row[number($x:parameter)]/name}
```

Scripts receive the current value as the `parameter` property on the `script` object.

The processing parameter can also be set and viewed from the Rxindi panel, but it is hidden by default. To show it, open the Rxindi Options and toggle `Display` `>` `Parameter`.

## XPath

Many arguments for many Rxindi statements are in the form of a path to certain data in the Data Source. Rxindi uses the [XPath 1.0](https://en.wikipedia.org/wiki/XPath) standard for the syntax of paths.  

XPath is a query language for navigating and selecting parts of a structured document. It treats the document as a tree of nodes and lets you write path expressions to pinpoint specific ones - similar to how a file system path locates a file. For example, `/library/book/title` drills down level by level, while `//title` finds every title node anywhere in the document regardless of depth. Attributes are accessed with @, so `//book[@genre]` selects only book nodes that have a genre attribute.

XPath also supports predicates for filtering and a built-in function library for more precise selections. Predicates are conditions in square brackets - `//book[@genre='fiction']` or `//book[price > 20]` - that narrow down results on the fly. Functions cover string operations (`contains()`, `substring()`), counting and math (`count()`, `sum()`), and positional checks (`position()`, `last()`). An XPath expression always returns one of four types: a node-set, a string, a number, or a boolean.

The section [Functions and Variables](#functions-and-variables) contains a full overview of all available XPath functions and variables.

---
# Statement Reference

| Name        | S   | Arguments                                                 | Description                                                                                                                                      |
| ----------- | --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OUTPUT`    | `=` | `1` XPath<br/>`2` Target _opt_                            | Output content from the given path in the data source to the document.                                                                           |
| `IF`        | `?` | `1` XPath                                                 | Only include/process following content if the expression is _true_.                                                                              |
| `LOOP`      | `*` | `1` XPath<br/> **or** Number                              | Repeat following content based on iteration over expression or number.                                                                           |
| `ELSE`      | `:` | `none`                                                    | Only include/process following content if the preceding `IF` is false or the preceding `LOOP` has no items.                                      |
| `COMPONENT` | `#` | `1` Name                                                  | Define a Component. Everything following this statement up to the matching `END` statement is part of the Component. Use `PLACE` to instantiate. |
| `PLACE`     | `@` | `1` Comp<br/>`2` XPath _opt_<br/>`3` Target _opt_         | Instantiate a defined component. The optional path specifies the data context for the Component instance.                                        |
| `END`       | `.` | `none`                                                    | End block started by `COMPONENT`, `IF`, `LOOP`, or `ELSE`.                                                                                       |
| `SCRIPT`    | `&` | `1` Script name<br/>`2` Target _opt_<br/>`3+` XPath _opt_ | Execute the external script with the given name, optionally passing a specific target and/or the result of any number of XPath Expressions.      |
| `ACTION`    | `!` | `1` Action type<br/>`2` Target _opt_                      | Execute an action of the given type, optionally on a specific target.                                                                            |
| `ROWREPEAT` | `-` | `1` XPath<br/> **or** Number                              | Repeat table row based on iteration over expression or number.                                                                                   |

## OUTPUT (`=`)
Outputs the result of a given XPath expression, relative to the current data context.

**Syntax**
```
= <xpath> (,<target>)
```

**Example**
```
${=/Root/Person/FirstName}
${=/Root/Person/Picture,personPicture}
```

If only a path is provided, then the content is output at the start point of the current placeholder the statement is part of. The optional `<target>` specifies the name of a frame. Frames in InDesign can be given a name in the _Layers_ panel.

The `OUTPUT` statement behaves differently depending on the type of frame targeted.

| Type    | Behavior                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Text    | Output content is appended to the existing content.                                                                            |
| Image   | Output content is interpreted as a path to a valid image file, which is placed in the image frame (replacing an existing one). |
| QR Code | Output content is used as new values for the QR Code.                                                                          |

Note that the target frame must already have the desired type in the template document. Rxindi will never change the type of frame on output.

Any properties set on the frame in the template document are retained. This includes Object Style, Image Fitting and the used QR Code Swatch.

### Images
When targeting an Image frame, it needs to be of Content Type "Graphic" in the InDesign template. This is the default when placing an image manually in InDesign and typically also when drawing a rectangle. InDesign indicates this with a diagonal cross in the frame. To change the content type in InDesign you can open the context menu on the frame and select `Content` `>` `Graphic`.

The image reference in the data file needs to be either the full (absolute) path to a file or it can be a path relative to the data source file being used. For instance, if the image files are in the same directory as the data file, then you just have to specify the file name.

All image types supported by InDesign can be used.

### QR Codes
To create a QR Code with the `OUTPUT` statement, first generate a QR Code of the desired type and with the desired size and swatch within the InDesign template document. The initial values in the template document can be either dummy values or the default/standard values you want to use. Next, give the frame that contains the QR Code a unique name and target it using the `OUTPUT` statement. The QR Code will then be updated with the value that results from the path for `OUTPUT`.

Some QR Code types in InDesign have multiple fields that can be set. To target a specific field, use the following syntax in the `OUTPUT` path: `<field1>:<value>|<field2>:<value>|...` to combine this with data from the data file you can use the XPath `concat(...)` function. All fields are optional, if a field is not set its existing/default value is retained. Note that field names are case-insensitive but specified here in all-lowercase.

Overview of the supported types with their fields:
- Plain Text
  - _no fields_ (all content is replaced)
- Hyperlink
  - _no fields_ (all content is replaced)
- Text Message
  - `cellnumber`
  - `textmessage`
- Email
  - `emailaddress`
  - `subject`
  - `body`
- VCard
  - `firstname`
  - `lastname`
  - `jobtitle`
  - `cellphone`
  - `phone`
  - `email`
  - `organisation`
  - `streetaddress`
  - `city`
  - `adrstate`
  - `country`
  - `postalcode`
  - `website`

Example for replacing the value of a Plain Text QR Code:

```
${=string('The new value'),QRCodeFrame}
```

Examples for replacing the email address and subject of a QR Code of type Email. First example, using fixed content:

```
${=string('emailaddress:john@example.com|subject:Hey John'),QRCodeFrame}
```

Second example for type Email, using the data from a fictional data file:
```
${=concat('emailaddress:',@email,'|subject:',@subject),QRCodeFrame}
```

> Particularly for outputting to QRCode of VCard type it is possible that you run into limitations of the XPath processing engine in terms of path length/complexity. The error you get in this case is `XPath invalid`, even if the actual path is valid. A workaround for this is to split setting the QRCode properties via multiple separate `OUTPUT` statements, each with only a few of the fields.

## IF (`?`)
Include and process all following content and placeholders only if the given expression resolves to a _"true"_ value. The `IF` statement starts an implicit _Block_, which ends either at the end of the current Story/Cell or at the outermost matching `END` (`.`) or `ELSE` (`:`) statement.

**Syntax**
```
? <xpath> 
```

**Example**
```
${?/Root/Person/HasTitle}${=Title}${.}
${?Value=5}All good${.}
```

The following results from the expression are considered a _"false"_ value:
  - Non-existing element or attribute
  - Element or attribute with no, or all-whitespace content
  - Element with no child elements
  - Value "0"
  - Value "NaN"
  - Value "false"

All other results are considered a _"true"_ value.

> This behavior applies in the default `compatible` xpath-mode. In `strict` mode, XPath 1.0 semantics are used instead. Only the following are `false`: a non-existing element or attribute (empty node-set), the number `0` or `NaN`, an empty string `""`, or a boolean `false`. Notably, an existing element or attribute is always `true` regardless of its content - so elements with whitespace-only content, no child elements, or a text value of `"0"`, `"NaN"`, or `"false"` all evaluate to `true`. See the [xpath-mode option](#option-xpath-mode) for details.

## LOOP (`*`)
Loop over a collection or numeric value, obtained from the given XPath expression. 

**Syntax**
```
* <xpath or number> 
```

**Example**
```
${*/Root/Person}
${*5}
```

The `LOOP` statement starts an implicit _Block_, which ends either at the end of the current Story/Cell or at the outermost matching `END` (`.`) or `ELSE` (`:`) statement. If the collection has no items or the number is equal to or less than `0` then the `LOOP` statement behaves as an `IF` with a _"false"_ value and the entire following block will be skipped. If an `ELSE` statement is specified, this will be executed instead.

When looping over an expression result that returns items from the data, the data context for the child block is automatically set to the current item iterated over. This does not happen when looping over a numeric value. 

The following System Variables are available for expressions of the child block on the current context:

| Variable   | Type    | Meaning                                                   |
| ---------- | ------- | --------------------------------------------------------- |
| `$x:index` | Number  | The current index, starts at 1                            |
| `$x:count` | Number  | Total number of items in the loop                         |
| `$x:first` | Boolean | True only if the current iteration is over the first item |
| `$x:last`  | Boolean | True only if the current iteration is over the last item  |

The type of the return type of the specified path specifies what the exact behavior is for `LOOP`. These match the main types for XPath.

| Return type                                | Behavior                                                                                      | Context Change |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------- |
| Empty (No Result)                          | No loop                                                                                       | No             |
| Number                                     | No loop if number is `<= 0` otherwise loop `value` number of times (using _floor_ of decimal) | No             |
| Boolean                                    | No loop if `false`, loop once if `true`                                                       | No             |
| String                                     | No loop if string is empty `""`, loop once if string is not empty (actual value is ignored)   | No             |
| Single Element, Attribute or Text node     | Loop once on the exact node returned (not its children!)                                      | Yes (the node) |
| List of Elements, Attributes or Text nodes | Loop over all the nodes in the list                                                           | Yes (per node) |

These types must be exact, meaning that a "number-like" value in a string is not automatically treated as an actual number. If you want to loop a certain number of times based on a value from XML data, you might need to explicitly cast this to a number: `number(@someAttribute)`. Often loop is used to iterate over Elements, Attribute and Text nodes - the types for these are implicit.

> Note that in XPath a `Text` node is not the same as a `string`. A Text node _contains_ a string though. You can select and iterate over Text nodes. You cannot iterate over strings. A string (like number and boolean) is always a single value.

### Example 1

Take the following data:
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

To loop over the `<product>` elements and output its contents you specify a path that returns these elements exactly. The path to use here is:
```
${*/data/productlist/product}
  Product ${=$x:index}: ${=.}
${.}
```

Note that within the `LOOP` block the context changes to the actual `<product>` being iterated over, this is why in the second `OUTPUT` statement we can output just the value of "the current context" (using the `.` XPath expression).

### Example 2

To loop the number of times specified in the `<stock>` element (5), you need to make sure to specify a path that returns an actual number and not just the Element `<stock>5</stock>` or its (string) contents `"5"`. The path to use here is: 
```
${*number(/data/stock)}
  Number: ${=$x:index}
${.}
```
For numeric loops the context remains the same in the `LOOP` block as it is outside the block.

## ELSE (`:`)
Include and process the following content and placeholders only if the given expression for the nearest preceding matching `IF` or `LOOP` resolved to a _"false"_ value (or 0 or Empty in case of `LOOP`).

**Syntax**
```
:
```

**Example**
```
${?PreferFirstName}${=FirstName}${:}${=LastName}${.}
```

The `ELSE` statement ends the _Block_ started with `IF` or `LOOP` and starts a new implicit _Block_, which ends either at the end of the current Story/Cell or at the outermost matching `END` (`.`).

When paired with an `IF`, `ELSE` always uses the inverse condition of whatever is the result of the preceding `IF`. If you want a sub condition, simply use a new `IF` as the first child statement of the `ELSE`.

Using an `ELSE` without a matching preceding `IF` or `LOOP` in the same parent Block will give an error.

## COMPONENT (`#`)
Defines a named Component, which is a collection of reusable statements and content that is to be instantiated one or multiple times. Components can be defined as _Content_ components (the default), _Function_ components (prefixed with `fn:`) or _Auto Trigger_ Components (prefixed with `on:`).

**Syntax**
```
# <componentName>
```

**Example**
```
${#CompA}My Component${.}
${#CompB}${=FirstName}${.}
${#fn:Function}${&ScriptA}${.}
${#on:start}${&ScriptB}${.}
```

The `COMPONENT` statement starts an implicit _block_ containing the content and statements directly following the Component statement. As will other _block_ types, the end of the definition is indicated explicitly using `END` (`.`) or implicitly by the end of the current Story or end of the multi-statement Placeholder.

Component definitions by themselves do nothing until they are either placed or auto-triggered. For Content and Function Components you must explicitly reference a component in order for it to be instantiated and processed. Components can be instantiated using `PLACE` (`@`) by providing their name and optionally a data context and/or target frame.

Because Component definitions are not part of the normal document content you can define them off-page, e.g. in a text frame on the pasteboard or on an otherwise unused master page. This is however not a strict requirement you can define Components in the same Story as where you reference them if you like. 

Component definitions always must be the top-_level_ statement in a Story. This does not mean that they need to be at the _start_ of the Story, but that they cannot be a logical child of e.g. an `IF`, `LOOP` or other `COMPONENT` statement.

The actual order of Component definitions in the document structure does not matter; You can reference a Component which is defined much later in the document.

Components must have a unique name which is case-sensitive. It must start with a letter or underscore, and can only contain letters, digits, underscores, hyphens, or dots. 

After a document has been successfully processed, the Component definitions will be _removed_ from the document.

Component definitions can reference other Components using `PLACE` statements. It is however _not_ allowed for Components to reference themselves, nether directly or indirectly (via another Component). Doing so anyway will cause a processing error.

### Function Components

When defining a Component, you can define it as a _Function_ Component by prefixing its name with `fn:`. For Function Component, InDesign contents will _not_ be included when the Component is placed - only the Rxindi statements are executed. This is similar to how a "function" works in most programming languages. Effectively the Function Component's child statements are inlined at the point of the PLACE statement and executed there. Because no content is duplicated, function Components execute somewhat faster than regular Components.

Component name must start with `fn:`, e.g. `${#fn:example}`. Note that the `fn:` is actually part of the Component name, and must be included when referencing the Component for `PLACE`, e.g. `${@fn:example}`.

Typically Function Components are used to run Scripts, execute Action or Output to a target frame. You can, however, also Output directly from a Function Component, e.g. `${#fn:example}${=string("hello")}${.}` will result in the text "hello" being inserted when the Component is placed.

### Auto Trigger Components

Auto Trigger Components are a special type of Function Components that are automatically processed based on a predefined trigger. They are not really "placed" in the document in the traditional sense, nor can they be placed explicitly, but all Rxindi statements in the Component definition are executed and may call e.g. Scripts, Actions and Output to a target frame.

The name of Auto Trigger Components must start with `on:` followed by the name of the trigger

| Trigger    | Description                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `on:start` | Very first item in the template document to be processed.                                                        |
| `on:end`   | Very last item in the template document to be processed.                                                         |
| `on:after` | When all items have been successfully processed. Only a limited set of statements can be executed at this point. |

Example: `${#on:start}${&somescript.jsx}${.}`

The triggers `on:end` and `on:after` seem very similar but there is an important difference. The `on:end` trigger is executed when processing is still ongoing, while `on:after` is executed when all regular processing is completed and the document has been cleaned up of all the scaffolding used by processing. The consequence of this is that with the `on:end` trigger you can still run any Rxindi statement and output and target anything like you would in the normal processing flow. Within the `on:after` trigger you are more limited in the Rxindi statements that you can execute. Typically the `on:after` trigger is used to (only) save, export or call a script, e.g. for making final custom adjustments and/or custom exporting of the document.

## PLACE (`@`)
Places an instance of a Component with the given name. Optionally providing a new data context path for the Component and optionally providing a target frame name to place the Component into.

**Syntax**
```
@ <componentName> (,<xpath>) (,<target>...)
```

**Example**
```
${@PersonDetails}
${@PersonDetails,/Root/Person/FirstName}
${@PersonDetails,/Root/Person/FirstName,frameA}
${@PersonDetails,,frameA}
${@fn:PersonDetails}
```

Components are defined and named using the `COMPONENT` (`#`) statement. The `PLACE` statement for a particular Component may occur _before_ the Component definition in the InDesign document structure. Referencing an unknown Component will result in an error.

By default, Components inherit the same data context as the current context at the location of the `PLACE` statement. To provide a different context for the Component, use a `,` directly after the Component name and supply an XPath expression.

Note that the data context does _not_ control whether the Component is placed. Even if the data context resolves to no data, the Component is still placed. The Component itself may have logic to handle this occurrence (e.g., it may output "No data available"). If you want to prevent a Component from being placed when there is no data, precede it with an `IF` statement.

The third argument for `PLACE` may reference the name of a target frame into which to place the Component. The Component is always appended to the end of the content in the target frame, in the same way as what happens for `OUTPUT`.

When placing Function Components, the `fn:` prefix must be included in the name. Note that for Function Components, no InDesign content from the Component definition is included when placing.

Auto Trigger Components (`on:` prefix) cannot be placed explicitly.

## END (`.`)
Ends the current (innermost) _block_ that was started either via `IF`, `ELSE`, `LOOP` or `COMPONENT`. 

**Syntax**
```
.
```

**Example**
```
${.}
${?IsTrue}${=FirstName}${.}
```

This statement expects no arguments. If there is no block to close at the position of this statement, then an error is given.

`END` statements are not strictly required at the very end of a multi-statement placeholder because all blocks opened in the same multi-statement placeholder are automatically closed. The same is true for any block still open at the end of a text frame or table cell, these too are automatically closed.

## SCRIPT (`&`)
Executes a custom external script.

**Syntax**
```
& <name> (,<target>) (,<args>...)
```

**Example**
```
${&AddPages}
${&RotateFrame,myFrame}
${&PlacePicture,pictureFrame,string('Alt text')}
```

Scripts must be in the Adobe ExtendScript (js/jsx) or UXP Script (idjs) format and use (only) statements that are compatible with the version of InDesign being used to process the document. The script must have either the `.js`, `.jsx` or `.idjs` extension and be located in the same directory as the InDesign template document being processed, or in a `scripts` subfolder below the document being processed. Global scripts are _not_ considered. When referencing the script, the casing must match that of the script filename exactly. The file extension can be omitted, in which case a file with a supported extension is automatically looked up.

From within the script, the global ExtendScript variables `app` and `document` are not available. Instead, the global `script` variable has an object that contains properties relevant to the context in which the script executes:

| Property     | Type                        | Description                                                                                                                                                                                                                                |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `document`   | `Document`                  | The InDesign Document currently being processed. Use `document.parent` to get the `Application` object in ExtendScript.                                                                                                                    |
| `datasource` | `string`                    | File path to the data source. Can be an empty string.                                                                                                                                                                                      |
| `parameter`  | `string`                    | Global processing parameter. Can be an empty string.                                                                                                                                                                                       |
| `name`       | `string`                    | Name of the current script                                                                                                                                                                                                                 |
| `target`     | `InsertionPoint` or `Frame` | Target for current script. For scripts called from within a Story, without an explicit target this will be an `InsertionPoint`. When called with a target frame name this will be a `TextFrame` or `SplineItem` (typically a `Rectangle`). |
| `args`       | `Array`                     | Array of additional arguments passed to the script.                                                                                                                                                                                        |

You can report back errors or log custom messages to the Rxindi log using the return value of a script.

**Return successfully with a message to the Rxindi log**
- Return either:
  - A non-empty `string` 
  - An array with the first element being a `boolean` value of `true` and the second a non-empty `string`
- Examples:
  - `return "This will be logged in the logfile";`
  - `return [true, "This too will be logged"];`
  
**Stop processing with a fatal error**
- Return either:
  - The boolean value `false`
  - An array with the first element being a `boolean` value of `false` and the second a non-empty `string`
- Throw an `Error`
- Examples:
  - `return false;`
  - `return [false, "Some custom error"];`
  - `throw new Error("Some custom error");`

Any other result value than what is listed here above will be ignored.

Arguments three and beyond for the `SCRIPT` statement are interpreted as XPath and are evaluated against the current data context. Its results are passed as the `args` array property on the `script` object to the script, where the result of the third argument for `SCRIPT` is the first (zeroth index) value on `script.args`. Note that in order to pass literal (constant) text, it must be made into a valid XPath statement first, so pass it as: `string('static text')`. Numeric values can be passed directly. To specify parameter arguments without specifying a different target, just use an empty target argument: `<script>,,<args>`.

**IMPORTANT** Scripts give complete freedom on actions that can be performed within an InDesign document. This provides a lot of freedom and flexibility. However, this also means that Rxindi cannot track the changes made by a script to a document. Certain changes like removal of items or changes to _Notes_ (which are used by Rxindi during processing) may cause statements following a script to fail.

## ACTION (`!`)
Executes a special action. The first (and required) argument specifies the action type to execute.

**Syntax**
```
! <type> (:<arg>) (,<target>)
```

**Example**
```
${!hide}
${!pstyle:Heading}
${!ostyle:Rotated,LogoA}
${!state:Big,MsoA}
```

Below is a list of all available actions. Note that some actions take an additional action type argument which is separated from the action type using a colon `:`. Do not confuse the action type argument (colon) with statement arguments (separated by a comma) or statement separators in a placeholder (semicolon). Action type names are given here in all lowercase, but they are case-insensitive.

| Action Type       | Description                                                                                                                                       | Target / Arg             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `hide`            | Hides the target or current frame.                                                                                                                | Frame (opt)              |
| `show`            | Shows the target or current frame if hidden.                                                                                                      | Frame (opt)              |
| `state:<name>`    | Apply the State with the specified name to the target frame, which must be a multi-state object.                                                  | Frame (opt)              |
| `ostyle:<name>`   | Apply the Object Style with the specified name to the target or current frame.                                                                    | Frame (opt)              |
| `cstyle:<name>`   | Apply the Character Style with the specified name to the following content or to the target frame.                                                | Frame (opt)              |
| `pstyle:<name>`   | Apply the Paragraph Style with the specified name to the current paragraph or to the target frame.                                                | Frame (opt)              |
| `tstyle:<name>`   | Apply the Table Style with the specified name to the table which the statement is in.                                                             | Not allowed              |
| `tcstyle:<name>`  | Apply the Cell Style with the specified name to the cell which the statement is in.                                                               | Not allowed              |
| `tcrstyle:<name>` | Apply the Cell Style with the specified name to (all cells of) the row which the statement is in.                                                 | Not allowed              |
| `tccstyle:<name>` | Apply the Cell Style with the specified name to (all cells of) the column which the statement is in.                                              | Not allowed              |
| `export:<preset>` | Export the document to PDF or INDD using the given preset to the specified filename.                                                              | XPath for Filename (opt) |
| `set:<option>`    | Sets a value for a certain template option. Available options: `dataroot`, `xpath-mode`, `decimal-separator`, `month-names`, `day-names`, `ampm`. | Value                    |
| `var:<name>`      | Declares a variable with the given name and optional value.                                                                                       | Value                    |

Note that an `ACTION` by itself is always executed, it has no condition of its own. In order to make it conditional (or run multiple times) place it after an `IF` or `LOOP` statement.

### Styling actions
The styling type actions all take an action type argument, which is the (exact) name of the style you want to apply to the respective item. The referenced style name must exist in the template document. If no style name is given, then the current style is _removed_ from the target item and the document default style is applied instead.

For the object style action `ostyle` either the Object Style of the target frame is changed, or the Object Style of the current frame.

The text style actions `cstyle` and `pstyle` can either target a particular frame, which will change the Character/Paragraph Style of that frame. If no target is given, then the style of the paragraph that the statement is in is changed for `pstyle`. For `cstyle` the current character style for new content _following it_ (e.g. via `OUTPUT`) is changed, existing text is not changed.

For the table style actions `tstyle`, `tcstyle`, `tcrstyle` and `tccstyle`, the statement itself must be placed in the cell that is in the (part of) the table of which the style is to be changed. The target argument for `ACTION` cannot be used with these action types. All table style change actions can freely be mixed within the same table.

The name of the referenced style must match the name in InDesign exactly (including casing). It can either refer to the name of a style at top-level or the full "path" to a style in case it is contained in one or more style groups. In case of grouped styles, the group name(s) are separated from the style name using forward slashes `/`. The style name must always be the last part of the path. 

For example: Given the following grouping structure:
- `StyleGroupA`
  - `StyleGroupB`
    - `MyPStyle`

You would use the following statement to refer to it in a `pstyle` action: `${!pstyle:StyleGroupA/StyleGroupB/MyPStyle}`

If a group or a style name contains a literal `/` character then you must escape it using a backslash immediately before it. For example, to refer to the style `This/That` use `This\/That` in the style action.  Escaping forward slashes is not necessary (but still allowed) for a style that is specified at top-level (non-grouped) in InDesign though.

### Export action
The `export` action will export the current document to file. Typically this action is placed in a `on:after` Trigger Component so that the exported document is complete and clean of processing scaffolding. If no other arguments are supplied, i.e. `${!export}` then the document is exported to PDF using the default PDF Export Preset and using a default filename (export_xxxx.pdf) in the user's default document location. A specific PDF Export Preset can be specified using an argument, e.g. `${!export:MyPreset}`. This preset must be known in InDesign. The filename to export to can be specified by supplying an expression that returns the name (and its path) as the `<target>` parameter. Because this is an expression, this name can be obtained from the data source. To supply a custom hard-coded name you must declare it as valid XPath, e.g. `${!export:MyPreset,string("MyCustomName.pdf")}`.

The file type to export to is defined by the extension of the file name. If no filename or a name without extension is supplied then PDF is assumed. The only supported export types are `pdf` and `indd`.

### Set action
The `set` action, changes the value of one of the predefined template options. A `set` action must be specified in the root of a document, meaning that it must be directly in a text frame and cannot be nested in e.g. an `IF` statement. The value for each option may only be set once per template and will always be applied at the very start of processing.

| Option              | Default      | Description                                                                                                                                                     |
| ------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataroot`          | `/*`         | XPath to the effective root element in the Data Source. All other XPaths will be relative to this root.                                                         |
| `xpath-mode`        | `compatible` | XPath evaluation mode. `compatible` uses relaxed boolean coercion for legacy-style truthiness evaluation. `strict` follows the XPath 1.0 specification exactly. |
| `decimal-separator` | `.,`         | Decimal and grouping separators used by the `format-number()` function. Specified as 1 or 2 characters.                                                         |
| `month-names`       | English      | 12 month names (January–December order) as separate arguments, used by `format-datetime`/`parse-datetime` for `[M]` named components.                           |
| `day-names`         | English      | 7 day names (Sunday–Saturday order) as separate arguments, used by `format-datetime`/`parse-datetime` for `[F]` named components.                               |
| `ampm`              | `am`, `pm`   | 2 AM and PM names as separate arguments, used by `format-datetime`/`parse-datetime` for the `[P]` component.                                                    |

#### Option dataroot
The `dataroot` option can be set to an XPath statement that resolves to either a single element or a list of elements in the Data Source.

- When resolved to a single element:
  - This element will be the "base" context to which all other paths in the template will be relative.
 
- When resolved to a list of elements:
  - Rxindi will iterate over the list and process the template for each element in the list.
  - This enables multi-processing of a single template using a single Data Source that contains multiple records or rows.
  - Note that, because on each iteration the template is reset, this functionality is only useful if combined with either an `export` action, or a custom script that handles persistence for every iteration.

Example: `${!set:dataroot,/data/sheet[1]}` 
 - When using this for an Excel Data Source, the first worksheet would be set as dataroot. Now other statements can use relative paths (e.g. to rows) from this root.
 - Because the data root points to a single element, only this element is used for processing, and a single document is produced.

Example: `${!set:dataroot,/data/sheet[1]/row}`
 - When using this for an Excel Data Source, all rows of first worksheet would be used as dataroot. The template is processed for every row in this list.

#### Option xpath-mode
The `xpath-mode` option controls how XPath expressions are evaluated. The default is `compatible`, which uses relaxed boolean coercion matching the behavior of earlier Rxindi versions, and still offers support for legacy System Attributes (@rxc-...).

In `compatible` mode, a non-empty node-set or string evaluates to `true` only when its value is also truthy - strings like `"false"`, `"0"`, and `"NaN"` evaluate to `false`.

Setting `xpath-mode` to `strict` enables full XPath 1.0 specification semantics:
 - A non-empty node-set is always `true` (regardless of content), and any non-empty string is `true` (including `"false"`, `"0"`, and `"NaN"`).
 - When an XPath expression that produces text output selects multiple nodes, only the first node's text is used. In `compatible` mode, the text of all selected nodes is concatenated.
 - No special `@rxc-*` attributes are added to the data source.

Example: `${!set:xpath-mode,strict}`

#### Option decimal-separator
The `decimal-separator` option controls the decimal and grouping separators used by the `format-number()` XPath function. By default, `.` is the decimal separator and `,` is the grouping (thousands) separator.

The value is a string of 1 or 2 characters:

- **1 character** — specifies the decimal separator. The grouping separator is chosen automatically: `,` if the decimal is `.`, and `.` otherwise.
- **2 characters** — specifies both separators in the order `<grouping><decimal>`. The two characters must be different.

Valid characters are any printable character except those reserved by the `format-number()` format string syntax: `#`, `0`, `%`, `‰`, `-`, and `;`. Whitespace characters such as space (` `) and narrow no-break space (`\u202F`) are valid.

Examples:

| Statement                        | Decimal | Grouping | Formatted 1234.5 (pattern `#,##0.00`) |
| -------------------------------- | ------- | -------- | ------------------------------------- |
| `${!set:decimal-separator,"."}`  | `.`     | `,`      | `1,234.50`                            |
| `${!set:decimal-separator,","}`  | `,`     | `.`      | `1.234,50`                            |
| `${!set:decimal-separator,".,"}` | `,`     | `.`      | `1.234,50`                            |
| `${!set:decimal-separator," ."}` | `.`     | ` `      | `1 234.50`                            |

Note: when the value contains a comma or space it must be quoted (using double quotes `"`). A single apostrophe `'` also requires quoting: `${!set:decimal-separator,"'."}`

#### Option month-names

The `month-names` option overrides the month names used by `format-datetime` and `parse-datetime` when the `[M]` component appears with a named modifier (`[MNn]`, `[MN]`, `[Mn]`). By default the names are English (January through December). Provide exactly 12 names in January-to-December order, each as a separate argument:

```
${!set:month-names,Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic}
```

After setting this option, `format-datetime` will output the custom names and `parse-datetime` will accept them as input (case-insensitively). The case modifiers `N` (uppercase) and `n` (lowercase) still apply to the custom names.

| Statement                                                             | `format-datetime("2025-06-15","[MNn]")` result |
| --------------------------------------------------------------------- | ---------------------------------------------- |
| _(no override — English default)_                                     | `June`                                         |
| `${!set:month-names,Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic}` | `Jun`                                          |

#### Option day-names

The `day-names` option overrides the day-of-week names used by `format-datetime` and `parse-datetime` when the `[F]` component appears with a named modifier (`[FNn]`, `[FN]`, `[Fn]`). By default the names are English (Sunday through Saturday). Provide exactly 7 names in Sunday-to-Saturday order, each as a separate argument:

```
${!set:day-names,Dom,Lun,Mar,Mié,Jue,Vie,Sáb}
```

The numeric form `[F]` (ISO day number 1–7) is always culture-neutral and is unaffected by this option.

#### Option ampm

The `ampm` option overrides the AM and PM designators used by `format-datetime` and `parse-datetime` for the `[P]` component. By default the names are `am` and `pm`. Provide exactly 2 names — first AM, then PM:

```
${!set:ampm,a. m.,p. m.}
```

The `N` modifier on `[PN]` still produces an uppercased version of the custom names.

You can combine all three locale options in one template:

```
${!set:month-names,Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic}
${!set:day-names,Dom,Lun,Mar,Mié,Jue,Vie,Sáb}
${!set:ampm,a. m.,p. m.}
```

### Var action

The `var` action assigns the result of an XPath expression to a named variable, which can then be used in any other following statement that take an XPath argument. All variables in Rxindi are global and can be freely used and (re)-assigned at any level in the structure. 

The general variable declaration syntax is `${!var:<name>,<value>}`.

Variable names must adhere to XML "NCName" conventions, which means that they have to start with a letter or underscore and cannot contain spaces or any punctuation besides underscores, hyphens and dots. Casing in variable name is relevant, so "myVar" is considered to be a different variable than "MyVar". 

The value is supplied as an XPath expression and is optional. Depending on the result of the expression, its value will implicitly have one of the following types: `string`, `boolean`, `number` or `node-set`. To force a variable to be of a certain type, you can use the standard `string(..)`, `boolean(..)` and `number(..)` functions. If no value is given then the variable will contain en empty node-set. 

In usage, variables are referred to by a dollar sign, followed immediately by the name of the variable.

Examples (left is declaration, right is usage example):
```
${!var:myVar,"Hello World"} -> ${=$myVar}             // Output: "Hello World"
${!var:a,5}${!var:b,6}      -> ${=$a + $b}            // Output: 11
${!var:prods,/data/product} -> ${*$prods}${=name}${.} // Output: ABC
```

Besides user defined variable, Rxindi also has several [System Variables](#system-variables).


## ROWREPEAT (`-`)
Loop over a collection or numeric value obtained from the given expression and repeats a table row for each value. 

**Syntax**
```
- <xpath or number>
```

**Example**
```
${-/Root/Person}
${-5}
```

The `ROWREPEAT` statement starts an implicit _Block_ on the entire row, which cannot be terminated explicitly, meaning that `ELSE` and `END` are _not_ supported for the `ROWREPEAT` itself (they are supported for any child statement on the row). For context changing result types (Element, Attribute and Text), the context is changed for all statements on the same table row as the `ROWREPEAT` statement.

If the collection has no items or the number is equal to or less than `0` then the row on which the statement is defined is removed. The statement must always be the first statement in the first cell of a table row and a table row can contain only one `ROWREPEAT` statement. It is valid to have multiple rows in the same table with `ROWREPEAT` statements though.

The behavior of `ROWREPEAT` in terms of how the path result is interpreted, as well as the set of System Variables (e.g. `$x:index`) that are available is identical to that of `LOOP`. Please refer to its documentation section on this.

---
# Data Source Reference 

Data Sources can be in the XML, JSON, CSV or XLSX (Excel) format. Non-XML data sources are automatically and transparently converted to an XML representation when processing using the rules specified in this chapter. When referring to content in the Data Source, XPath (1.0) syntax is used, regardless of the original Data Source format.

If the input file is an XML file, then that file is used as-is. The rest of this chapter will explain how the other file types are converted.

> In all examples in this chapter _absolute_ XPaths are used, starting at the root e.g. `/data/persons/...`. In practice the root can usually be omitted in paths in Rxindi as it is the default data context: `persons/...`

## Mapping Modes

Conversion from JSON, CSV or XLSX to XML can be done in different ways. For sake of consistency and compatibility Rxindi has settled on providing a limited set of options for the automatic conversion which is suited for the majority of common use cases. If you need a very specific solution that the automatic conversion cannot offer, you can convert the original data to XML outside Rxindi using an external tool, website or service and use the resulting XML as data source for Rxindi instead.

The conversion behavior is controlled by a "Mapping Mode". Rxindi currently offers three:
- `Default`
- `Raw`

As the name implies, `Default` is the default mapping mode and active when first installing Rxindi. You can change the mapping mode in the Rxindi Options, under `Options` `>` `Mapping Mode`. The selected option is saved and used for all following Processing actions.

Here is an overview on the modes and its effect on the file type:

| Mapping Mode | XML       | JSON                         | CSV & XLSX                                    |
| ------------ | --------- | ---------------------------- | --------------------------------------------- |
| `Default`    | _Ignored_ | Map property to element name | Map column header to element name             |
| `Raw`        | _Ignored_ | Use generic element `p`      | Use generic element `c`, treat header as data |

### Column/Property name mapping for Default

For mode `Default` a best attempt is made to map the Column (XSLX & CSV) and Property (JSON) names onto XML Element names. This is done so that paths for mapping in Rxindi templates become a bit easier to write. For some names, Rxindi has to make some adjustments because the rules for what is allowed in an XML Element name are much stricter than what is allowed in Column & Property names. 

- Characters in the column/property name that are not allowed in XML are _removed_:
  - Example: `Time Zone` becomes element `TimeZone`
- If the column/property name is empty, only contains disallowed XML characters or starts with `.`, `-`, `xml` or a number, then the element name is either prefixed with or gets as a _fixed_ name:
  - JSON: `p`
  - XSLX/CSV: `c`
- JSON array elements always get a default element name:
  -  `p`
- In `Default` (and `Raw`) mode every element (JSON) or column element (XSLX/CSV) has a `name` attribute with the _original_ property/column name.

## JSON

JSON stands for JavaScript Object Notation. It is a very common plain-text data transfer format. JSON files are typically generated/exported by software and not written by hand.

Example source JSON:
```json
{
    "text": "Hello World",
    "children": {
        "name": "childObject",
        "emptyText": "",
        "data": null
    },
    "hasValue": true,
    "amount": 1.23,
    "date": "2017-01-03 23:54:18",
    "myItems": [
        "firstItem",
        "secondItem"
    ],
    "": "empty"
}
```

### Default Mode

The `Default` mapping mode maps JSON in such a way that ensures that all original information is retained and paths to the data can be written in multiple ways. A best effort is made to map JSON property names onto XML element names.

- Every JSON property and array item becomes an XML element
- The name of the JSON property becomes the name of the XML element 
- Every property value becomes content of the XML element for the property
- Every element is annotated with the JSON value type using the `type` attribute
- The root XML element is a fixed element is always named `data` 
- Array item elements are always named `p` and have the array index as `name` attribute
- The technical name for this mode is `json/2` (it is identified as this on the root element)

#### Resulting XML from JSON with Default Mode

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<data mapmode="json/2" type="object">
  <text name="text" type="string">Hello World</text>
  <children name="children" type="object">
    <name name="name" type="string">childObject</name>
    <emptyText name="emptyText" type="string"></emptyText>
    <data name="data" type="null"></data>
  </children>
  <hasValue name="hasValue" type="boolean">true</hasValue>
  <amount name="amount" type="number">1.23</amount>
  <date name="date" type="string">2017-01-03 23:54:18</date>
  <myItems name="myItems" type="array">
    <p name="0" type="string">firstItem</p>
    <p name="1" type="string">secondItem</p>
  </myItems>
  <p name="" type="string">empty</p>
</data>
```

To refer to the `name` property of `children`, the following XPaths can be used:
```
/data/children/name  => "childObject"
/data/*[@name="children"]/*[@name="name"]  => "childObject"
```

The second path is a bit convoluted for this particular case, but it demonstrates how to access data for property names which would not be valid as XML element names (e.g. ones containing spaces, special characters or starting with numbers).

Possible values for the `type` attribute:
- `object`
- `array`
- `number`
- `boolean`
- `string`
- `null`

Properties with an explicit value of `undefined` in the source JSON are _excluded_ from the XML.

### Raw Mode

The `Raw` mapping mode for JSON is very similar to `Default` mode, the only difference is that no attempt is made to map JSON property names to XML Element names - all element names simply become `p`.

- Every JSON property and array item becomes an XML element
- The name of every JSON property becomes an XML element with name `p`
- Every property value becomes content of the XML element for the property
- Every element is annotated with the JSON value type using the `type` attribute
- The root XML element is a fixed element is always named `data` 
- Array item elements are always named `p` and have the array index as `name` attribute
- The technical name for this mode is `json/3` (it is identified as this on the root element)

#### Resulting XML from JSON with Raw Mode

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<data mapmode="json/3" type="object">
  <p name="text" type="string">Hello World</p>
  <p name="children" type="object">
    <p name="name" type="string">childObject</p>
    <p name="emptyText" type="string"></p>
    <p name="data" type="null"></p>
  </p>
  <p name="hasValue" type="boolean">true</p>
  <p name="amount" type="number">1.23</p>
  <p name="date" type="string">2017-01-03 23:54:18</p>
  <p name="myItems" type="array">
    <p name="0" type="string">firstItem</p>
    <p name="1" type="string">secondItem</p>
  </p>
  <p name="" type="string">empty</p>
</data>
```

To refer to the `name` property of `children`, the following XPath can be used:
```
/data/p[@name="children"]/p[@name="name"]  => "childObject"
```

Possible values for the `type` attribute:
- `object`
- `array`
- `number`
- `boolean`
- `string`
- `null`

Properties with an explicit value of `undefined` in the source JSON are _excluded_ from the XML.

## CSV

CSV (Comma separated values) data sources are plain text tabular files. They can be written by hand using a plain text editor or can be created and exported with spreadsheet software like Excel or LibreOffice Calc. Many software applications also have export features that produce CSV files. In a CSV file every row denotes a row, with the first line (typically) being the header that defines the columns. Columns are separated by commas, semicolons or tabs.

CSV can be mapped to XML using either the `Default` or `Raw` mapping mode. For `Default` mode the CSV is expected to have a header as first row and the column names are used in the mapping. For `Raw` mode a header is not required, or if present treated like any other row.

Example source CSV:
```
Location  , Value ,       , Time Zone
New York  , 2     , true  ,
Amsterdam , 43    ,       , CET
Brussels  , 4     , false ,
Paris     , 5     ,       ,
Berlin    , 34    ,       ,
```

Notes:
- _Extra spaces are added here for padding to align columns for readability, these are typically absent in actual CSV files_
- _The third column has no name_
- _Some values in the third and fourth column have no value_

### Default Mode

The `Default` mapping mode maps the rows of the CSV to row XML elements and creates an element for each column using names obtained from the first row (header). The column elements per row contain the values.

- The first line in the CSV is expected to be a header row that specifies the columns
  - Columns (in the header) can, but are not required to, have a name
  - The header row is excluded (always) from the XML result
- Following lines contain rows with values
  - Their columns are expected to match up with the header columns
- No value type information can be inferred from CSV, elements will have no type attribute
- The root element in the XML is always named `data`
- Every row (except the header) in the CSV becomes a `row` XML element 
  - Each row has an `index` attribute for the number of the row (starting at 1)
- Each column for every row becomes an XML element
  - Every column element has a `name` attribute that contains the original column name from the CSV
  - Every column element has an `index` attribute that contains the column index from the CSV (starting at 1)
- The value of the column element is the value as it appears in the CSV
- The technical name for this mode is `csv/2` (it is identified as this on the root element)

#### Resulting XML from CSV with Default Mode

```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<data mapmode="csv/2">
  <row index="1">
    <Location name="Location" index="1">New York</Location>
    <Value name="Value" index="2">2</Value>
    <c name="" index="3">true</c>
    <TimeZone name="Time Zone" index="4"></TimeZone>
  </row>
  <row index="2">
    <Location name="Location" index="1">Amsterdam</Location>
    <Value name="Value" index="2">43</Value>
    <c name="" index="3"></c>
    <TimeZone name="Time Zone" index="4">CET</TimeZone>
  </row>
  <row index="3">
    <Location name="Location" index="1">Brussels</Location>
    <Value name="Value" index="2">4</Value>
    <c name="" index="3">false</c>
    <TimeZone name="Time Zone" index="4"></TimeZone>
  </row>
  <row index="4">
    <Location name="Location" index="1">Paris</Location>
    <Value name="Value" index="2">5</Value>
    <c name="" index="3"></c>
    <TimeZone name="Time Zone" index="4"></TimeZone>
  </row>
  <row index="5">
    <Location name="Location" index="1">Berlin</Location>
    <Value name="Value" index="2">34</Value>
    <c name="" index="3"></c>
    <TimeZone name="Time Zone" index="4"></TimeZone>
  </row>
</data>
```

To refer to the `Location` column of the second row, the following XPaths can be used:
```
/data/row[2]/Location  => "Amsterdam"
/data/row[2]/*[1]  => "Amsterdam"
/data/row[@index=2]/*[@index=1]  => "Amsterdam"
/data/row[@index=2]/*[@name="Location"]  => "Amsterdam"
```

The third and fourth paths are a bit convoluted for this particular case, it demonstrates how to access the data by CSV row/column index and name attributes, which works even if the column would contain special characters.

### Raw Mode

The `Raw` mapping mode maps the rows of the CSV to row XML elements and creates an element for each column. The first row of the CSV is not treated in any special way and is included as a normal row in the resulting XML. In this mode columns will not get a name and values can only be accessed by index.

- All lines contain rows with values
  - Their columns are expected to match up with each other (same number of columns)
- No value type information can be inferred from CSV, elements will have no type attribute
- The root element in the XML is always named `data`
- Every row (including the first one) in the CSV becomes a `row` XML element 
  - Each row has an `index` attribute for the number of the row (starting at 1)
- Each column for every row becomes an XML element
  - The column element is always named `c`
  - Every column element has an `index` attribute that contains the column index from the CSV (starting at 1)
- The value of the column element is the value as it appears in the CSV
- The technical name for this mode is `csv/3` (it is identified as this on the root element)

#### Resulting XML from CSV with Raw Mode

```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<data mapmode="csv/3">
  <row index="1">
    <c index="1">Location</c>
    <c index="2">Value</c>
    <c index="3"></c>
    <c index="4">Time Zone</c>
  </row>
  <row index="2">
    <c index="1">New York</c>
    <c index="2">2</c>
    <c index="3">true</c>
    <c index="4"></c>
  </row>
  <row index="3">
    <c index="1">Amsterdam</c>
    <c index="2">43</c>
    <c index="3"></c>
    <c index="4">CET</c>
  </row>
  <row index="4">
    <c index="1">Brussels</c>
    <c index="2">4</c>
    <c index="3">false</c>
    <c index="4"></c>
  </row>
  <row index="5">
    <c index="1">Paris</c>
    <c index="2">5</c>
    <c index="3"></c>
    <c index="4"></c>
  </row>
  <row index="6">
    <c index="1">Berlin</c>
    <c index="2">34</c>
    <c index="3"></c>
    <c index="4"></c>
  </row>
</data>
```

To refer to the `Location` column of the third row, the following XPaths can be used:
```
/data/row[3]/c[1]  => "Amsterdam"
/data/row[@index=3]/c[@index=1]  => "Amsterdam"
```

Note how the row numbers here have shifted compared to `Default` mode. Because the "header" is included as a normal row (row 1), the row numbers for following rows increase by one.

## XLSX (Excel)

XLSX (Excel) data sources are spreadsheet documents, they can contain multiple sheets with rows and columns of typed and formatted values.

XLSX can be mapped to XML using either the `Default` or `Raw` mapping mode. For `Default` mode the sheets in the XLSX are expected to have a header as first row and the column names are used in the mapping. For `Raw` mode a header is not required, or if present treated like any other row.

Example source XLSX with two sheets: 

|     | `A`          | `B`       | `C`   | `D`           |
| --- | ------------ | --------- | ----- | ------------- |
| `1` | **Location** | **Value** |       | **Time Zone** |
| `2` | New York     | 2         | TRUE  |               |
| `3` | Amsterdam    | 43        |       | CET           |
| `4` | Brussels     | 4         | FALSE |               |
| `5` | Paris        | 5         |       |               |
| `6` | Berlin       | 34        |       |               |

`[DataSheet]` `Other`

Notes:
- _Row numbers and column letters (A, B...) are not part of the actual data_
- _The third column has no name_
- _Some values in the third and fourth column have no value_
- _This document has two sheets, only "DataSheet" has data_

### Default Mode
The `Default` mapping mode maps all sheets of the XLSX to sheet XML elements and the rows withing that to row elements. Under the row it then creates an element for each column using names obtained from the first row (header). The column elements per row contain the values.

- Every sheet in the file is included, even if it has no data
- The first row per sheet is expected to be a header row that specifies the columns
  - Columns (in the header) can, but are not required to, have a name
  - The header row is excluded (always) from the XML result
- Following rows describes the row values for each column
- The value type for each cell (row+column combination) is included via the attribute `type`
- The root element in the XML is always named `data`
- Sheets get an element named `sheet`
  - Every sheet has a `name` and `index` attribute
- Every row per sheet (except the header) becomes a `row` XML element 
  - Every row has an `index` attribute for the number of the row (starting at 1)
- Each column for every row becomes an XML element
  - Every column element has a `name` attribute that contains the original column name from the XLSX
  - Every column element has an `index` attribute that contains the column index from the XLSX (starting at 1)
  - Every column element has a `type` attribute that indicates the configured type for that cell.
- The value of the column element is the value as it appears in the XLSX
- Technically this mode is called `xlsx/2` (it is identified as this on the root element)

#### Resulting XML from XLSX with Default Mode

```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<data mapmode="xlsx/2">
  <sheet name="DataSheet" index="1">
    <row index="1">
      <Location name="Location" index="1" type="string">New York</Location>
      <Value name="Value" index="2" type="number">2</Value>
      <c name="" index="3" type="number">TRUE</c>
      <TimeZone name="Time Zone" index="4" type="null"></TimeZone>
    </row>
    <row index="2">
      <Location name="Location" index="1" type="string">Amsterdam</Location>
      <Value name="Value" index="2" type="number">43</Value>
      <c name="" index="3" type="null"></c>
      <TimeZone name="Time Zone" index="4" type="string">CET</TimeZone>
    </row>
    <row index="3">
      <Location name="Location" index="1" type="string">Brussels</Location>
      <Value name="Value" index="2" type="number">4</Value>
      <c name="" index="3" type="number">FALSE</c>
      <TimeZone name="Time Zone" index="4" type="null"></TimeZone>
    </row>
    <row index="4">
      <Location name="Location" index="1" type="string">Paris</Location>
      <Value name="Value" index="2" type="number">5</Value>
      <c name="" index="3" type="null"></c>
      <TimeZone name="Time Zone" index="4" type="null"></TimeZone>
    </row>
    <row index="5">
      <Location name="Location" index="1" type="string">Berlin</Location>
      <Value name="Value" index="2" type="number">34</Value>
      <c name="" index="3" type="null"></c>
      <TimeZone name="Time Zone" index="4" type="null"></TimeZone>
    </row>
  </sheet>
  <sheet name="Other" index="2" />
</data>
```

To refer to the `Location` column of the second row, the following XPaths can be used:
```
/data/sheet[1]/row[2]/Location  => "Amsterdam"
/data/*[1]/*[2]/*[1]  => "Amsterdam"
/data/sheet[@name="DataSheet"]/row[@index=2]/*[@name="Location"]  => "Amsterdam"
/data/sheet[@index=1]/row[@index=2]/*[@index=1]  => "Amsterdam"
```

The second and third paths demonstrate how to access the data by sheet/row/column index and name attributes, which works even if the sheet name or column name would contain special characters (e.g. "Time Zone").

Possible values for the `type` attribute on the column element:
- `number` 
- `boolean`
- `string`
- `null`

### Raw Mode

The `Raw` mapping mode maps the sheets and rows of the XLSX to XML elements and creates an element for each column. The first row per sheet of the XLSX is not treated in any special way and is included as a normal row in the resulting XML. In this mode columns will not get a name and values can only be accessed by index.

- Every sheet in file is included, even if it has no data
- The value type for each cell (row+column combination) is included via the attribute `type`
- The root element in the XML is always named `data`
- Sheets get an element named `sheet`
  - Every sheet has a `name` and `index` attribute
- Every row per sheet becomes a `row` XML element 
  - Every row has an `index` attribute for the number of the row (starting at 1)
- Each column for every row becomes an XML element
  - The column element is always named `c`
  - Every column element has an `index` attribute that contains the column index (starting at 1)
- The value of the column element is the value as it appears in the source file
- The technical name for this mode is `xlsx/3` (it is identified as this on the root element)

#### Resulting XML from XLSX with Raw Mode

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<data mapmode="xlsx/3">
  <sheet name="DataSheet" index="1">
    <row index="1">
      <c index="1" type="string">Location</c>
      <c index="2" type="string">Value</c>
      <c index="3" type="null"></c>
      <c index="4" type="string">Time Zone</c>
    </row>
    <row index="2">
      <c index="1" type="string">New York</c>
      <c index="2" type="number">2</c>
      <c index="3" type="number">TRUE</c>
      <c index="4" type="null"></c>
    </row>
    <row index="3">
      <c index="1" type="string">Amsterdam</c>
      <c index="2" type="number">43</c>
      <c index="3" type="null"></c>
      <c index="4" type="string">CET</c>
    </row>
    <row index="4">
      <c index="1" type="string">Brussels</c>
      <c index="2" type="number">4</c>
      <c index="3" type="number">FALSE</c>
      <c index="4" type="null"></c>
    </row>
    <row index="5">
      <c index="1" type="string">Paris</c>
      <c index="2" type="number">5</c>
      <c index="3" type="null"></c>
      <c index="4" type="null"></c>
    </row>
    <row index="6">
      <c index="1" type="string">Berlin</c>
      <c index="2" type="number">34</c>
      <c index="3" type="null"></c>
      <c index="4" type="null"></c>
    </row>
  </sheet>
  <sheet name="Other" index="2" />
</data>
```

To refer to the `Location` column of the second row, the following XPaths can be used:
```
/data/sheet[1]/row[3]/c[1]  => "Amsterdam"
/data/sheet[@index=1]/row[@index=3]/c[@index=1]  => "Amsterdam"
/data/*[1]/*[3]/*[1]  => "Amsterdam"
```

Note how the row numbers here have shifted compared to `Default` mode. Because the "header" is included as a normal row (row 1), the row numbers for following rows increase by one.

Possible values for the `type` attribute on the column element:
- `number` 
- `boolean`
- `string`
- `null`

## Line Break Handling 

The `OUTPUT` statement treats line break characters in text selected in the data source in the following way:

| Character                | Hex    | Behavior                           |
| ------------------------ | ------ | ---------------------------------- |
| Linefeed (LF)            | 0x0A   | Forced Line Break within paragraph |
| Line Separator (LS)      | 0x2028 | Forced Line Break within paragraph |
| Carriage Return (CR)     | 0x0D   | Paragraph Return                   |
| Paragraph Separator (PS) | 0x2029 | Paragraph Return                   |

The combination or CR directly followed by LF, which is a common line separator combination on Windows, will result in just a _single_ Paragraph Return.

Note that this behavior applies from Rxindi v2.0 and up. Rxindi Classic would treat all line break characters a Forced Line Break. This behavior is retained when processing a document in v1.5 Compatibility mode.

---
# Functions and Variables

This section lists all functions and variables that can be used in statement arguments of the type XPath.

Functions are called using its predefined name followed by parenthesis and in between them (depending on the function) arguments separated by commas. For example this outputs "Hello World": `${=concat('Hello', 'World')}`.

Variables start with a dollar sign, followed by the name of the variable. The following with output info about Rxindi: `${=$x:about}`

By XPath convention, both functions and variables use, so-called "kebab-case", where words are written in lowercase and separated by hyphens.

## XPath Functions

Rxindi supports all functions that are part of the official XPath 1.0 specification. Additionally, Rxindi offers a significant set of extended functions that closely mirror those of XPath 2.0 and other XML related standards. Extended functions are indicated in the list with `†`. 

In usage with Rxindi there is no practical difference between standard and extended functions, but this difference may be significant if external tools or references are used to aid with the creation of XPath expressions.

### Node-set Functions

| Function                              | Returns  | Description                                                                       |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `count(node-set)`                     | Number   | Number of nodes in the given node-set                                             |
| `id(object)`                          | Node Set | Selects elements by their unique ID                                               |
| `last()`                              | Number   | Index of the last node in the current context                                     |
| [`list(arg, arg*)`](#function-list) † | Node Set | Creates a custom list as a node-set from the given arguments _(Rxindi extension)_ |
| `local-name(node-set?)`               | String   | Local part of the name of the first node                                          |
| `name(node-set?)`                     | String   | Expanded name of the first node                                                   |
| `namespace-uri(node-set?)`            | String   | Namespace URI of the first node                                                   |
| `position()`                          | Number   | Index of the current node in the context                                          |

### String Functions

| Function                                             | Returns  | Description                                                                       |
| ---------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `concat(str, str, str*)`                             | String   | Concatenates two or more strings                                                  |
| `contains(str, str)`                                 | Boolean  | Whether the first string contains the second                                      |
| `ends-with(str, str)` †                              | Boolean  | Whether the first string ends with the second _(XPath 2.0)_                       |
| `lower-case(str)` †                                  | String   | Converts a string to lowercase _(XPath 2.0)_                                      |
| `normalize-space(str?)`                              | String   | Strips leading/trailing whitespace and collapses internal whitespace              |
| `starts-with(str, str)`                              | Boolean  | Whether the first string starts with the second                                   |
| `string(object?)`                                    | String   | Converts an object to its string value                                            |
| `string-join(node-set, str)` †                       | String   | Joins the string values of all nodes using the given separator _(XPath 2.0)_      |
| `string-length(str?)`                                | Number   | Number of characters in the string                                                |
| [`string-split(str, str)`](#function-string-split) † | Node Set | Splits a string by a separator into a node-set of text nodes _(Rxindi extension)_ |
| `substring(str, num, num?)`                          | String   | Substring starting at position, with optional length                              |
| `substring-after(str, str)`                          | String   | Part of the first string after the first occurrence of the second                 |
| `substring-before(str, str)`                         | String   | Part of the first string before the first occurrence of the second                |
| `translate(str, str, str)`                           | String   | Replaces characters in the first string based on a character map                  |
| `upper-case(str)` †                                  | String   | Converts a string to uppercase _(XPath 2.0)_                                      |

### Boolean Functions

| Function                         | Returns | Description                                                                    |
| -------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `boolean(object)`                | Boolean | Converts an object to a boolean                                                |
| `choose(bool, object, object)` † | object  | Returns second or third argument based on whether first is true _(XForms 1.1)_ |
| `false()`                        | Boolean | Returns false                                                                  |
| `lang(string)`                   | Boolean | Whether the context node's language matches the given language code            |
| `not(boolean)`                   | Boolean | Negates a boolean value                                                        |
| `true()`                         | Boolean | Returns true                                                                   |

### Number Functions

| Function                                                                   | Returns | Description                                                             |
| -------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------- |
| `abs(number)` †                                                            | Number  | Absolute value of the argument _(XPath 2.0)_                            |
| `ceiling(number)`                                                          | Number  | Smallest integer not less than the argument                             |
| `floor(number)`                                                            | Number  | Largest integer not greater than the argument                           |
| [`format-number(number, format-str, dec-sep?)`](#function-format-number) † | String  | Formats a number using the format given as second argument _(XSLT 1.0)_ |
| `number(object?)`                                                          | Number  | Converts an object to a number                                          |
| [`parse-number(string, dec-sep?)`](#function-parse-number) †               | Number  | Parses a localized number string back to a number _(Rxindi extension)_  |
| `round(number)`                                                            | Number  | Nearest integer to the argument                                         |
| `round-half-to-even(number, int?)` †                                       | Number  | Rounds to given decimal precision using banker's rounding _(XPath 2.0)_ |
| `sum(node-set)`                                                            | Number  | Sum of the numeric values of all nodes in the set                       |

### Date and Time Functions

| Function                                                          | Returns | Description                                                                                            |
| ----------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `current-date()` †                                                | String  | Current date as an ISO 8601 string _(XPath 2.0)_                                                       |
| `current-datetime()` †                                            | String  | Current date and time as an ISO 8601 string - alias `current-dateTime()` _(XPath 2.0)_                 |
| `current-time()` †                                                | String  | Current time as an ISO 8601 string (`HH:MM:SS`) _(XPath 2.0)_                                          |
| `day-from-date(str)` †                                            | Number  | Extracts the day (1–31) from an ISO 8601 date or date-time string _(XPath 2.0)_                        |
| [`format-datetime(str, format-str)`](#function-format-datetime) † | String  | Formats an ISO 8601 date, time, or date-time string using a format string _(XSLT 2.0)_                 |
| `hours-from-time(str)` †                                          | Number  | Extracts the hours (0–23) from an ISO 8601 time or date-time string _(XPath 2.0)_                      |
| `minutes-from-time(str)` †                                        | Number  | Extracts the minutes (0–59) from an ISO 8601 time or date-time string _(XPath 2.0)_                    |
| `month-from-date(str)` †                                          | Number  | Extracts the month (1–12) from an ISO 8601 date or date-time string _(XPath 2.0)_                      |
| [`parse-datetime(str, format-str)`](#function-parse-datetime) †   | String  | Parses a formatted date/time string into an ISO 8601 string using a format string _(Rxindi extension)_ |
| `seconds-from-time(str)` †                                        | Number  | Extracts the seconds (0–59) from an ISO 8601 time or date-time string _(XPath 2.0)_                    |
| `year-from-date(str)` †                                           | Number  | Extracts the year from an ISO 8601 date or date-time string _(XPath 2.0)_                              |

> **Note:** Rxindi has no dedicated "date" type; Dates are represented as an ISO 8601 string (`YYYY-MM-DDTHH:MM:SS`).

### Function details

#### Function list

`list(arg, arg*)` builds a custom list from one or more values. Every argument is evaluated and the text value of each result becomes one item in the list, which is returned as a node-set. This node-set can then be used like any other node-set: You can loop over it, index into it, assign it to a variable, or pass it to any other XPath function that accepts a node-set.

**Assigning to a variable for re-use**

Save the list to a [variable](#var-action) when you need to refer to it in multiple places, or when you want to pick out a specific item by position using `[n]`:

```
${!var:sizes, list('Small', 'Medium', 'Large')}

Default: ${=$sizes[2]}

${*$sizes}Available size: ${=.}${.}
```

Output for the loop: `Available size: Small`, `Available size: Medium`, `Available size: Large`.

**Looping directly over a list**

Pass the result directly to `LOOP` or `ROWREPEAT` to repeat content once per item. Inside the loop, `.` refers to the current item:

```
${*list('Red', 'Green', 'Blue')}
  Color: ${=.}
${.}
```

You can also collect individual data values from different paths into one list to loop over:

```
${*list(product/color, product/material, product/finish)}
  Attribute: ${=.}
${.}
```

> Note that every argument for the `list` function will produce a single simple (flattened) entry in the resulting node-set. This function does not support multi-dimensional (nested) lists.

**Using with other XPath functions**

Because `list` returns a node-set, its result works as input to any function that accepts a node-set — for example, joining the items into a single string, or counting them:

```
${=string-join(list('Mon', 'Wed', 'Fri'), ', ')}
```

Output: `Mon, Wed, Fri`

```
${=count(list('a', 'b', 'c'))}
```

Output: `3`

| Expression                                         | Result                       |
| -------------------------------------------------- | ---------------------------- |
| `list('A', 'B', 'C')`                              | Node-set of 3 items: A, B, C |
| `$sizes[2]` _(where `$sizes = list('S','M','L')`)_ | `M`                          |
| `count(list('x', 'y'))`                            | `2`                          |
| `string-join(list('Mon', 'Wed', 'Fri'), ', ')`     | `Mon, Wed, Fri`              |

#### Function string-split

`string-split(input, separator)` splits a string by a literal separator and returns a list of text nodes — one node per token. Empty tokens produced by consecutive or leading/trailing separators are discarded. The result is the same node type as `list()` and can be used anywhere a node-set is accepted: looping, indexing, variables, and other XPath functions.

**Splitting a delimited string into a loop**

```
${*string-split(product/sizes, ',')}
  Size: ${=.}
${.}
```

If `product/sizes` contains `S,M,L`, the loop outputs `Size: S`, `Size: M`, `Size: L`.

**Picking a specific token by position**

```
${=string-split('Mon,Tue,Wed,Thu,Fri', ',')[3]}
```

Output: `Wed`

**Assigning to a variable for re-use**

```
${!var:tags, string-split(article/tags, ';')}

Tag count: ${=count($tags)}

${*$tags}— ${=.}
${.}
```

**Combining with string-join**

```
${=string-join(string-split(row/csv-field, ','), ' / ')}
```

Splits the field on commas and re-joins with ` / ` as separator.

| Expression                            | Result                                            |
| ------------------------------------- | ------------------------------------------------- |
| `string-split('a,b,c', ',')`          | Node-set of 3 items: a, b, c                      |
| `string-split('a,,b', ',')`           | Node-set of 2 items: a, b _(empty token skipped)_ |
| `string-split('hello world', ' ')[2]` | `world`                                           |
| `count(string-split('x;y;z', ';'))`   | `3`                                               |

#### Function format-number

`format-number(number, format-str, dec-sep?)` formats a number as a string according to a format pattern. The pattern syntax is identical to the one used in Excel custom number formats and XSLT 1.0's `format-number()`.

The `format-str` is a format string composed of the following characters (using the default `.` decimal / `,` grouping separators):

| Character | Meaning                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| `0`       | Digit placeholder — always outputs a digit, outputs `0` if no digit is present                |
| `#`       | Digit placeholder — outputs a digit only if one is present, suppresses leading/trailing zeros |
| `.`       | Decimal separator — marks where the decimal point appears in the output                       |
| `,`       | Grouping separator — when placed between digit placeholders, inserts a thousands separator    |
| `%`       | Percent — multiplies the number by 100 and appends `%`                                        |
| `‰`       | Per-mille — multiplies the number by 1000 and appends `‰`                                     |
| `-`       | Minus sign in the negative sub-pattern                                                        |
| `;`       | Sub-pattern separator — separates positive and negative sub-patterns                          |
| Any other | Literal character — output as-is (e.g. currency symbols, spaces)                              |

The format string may contain an optional negative sub-pattern after a `;`. If omitted, negative numbers are formatted like positive ones with a leading `-`.

Examples (default separators):

| Expression                            | Result        |
| ------------------------------------- | ------------- |
| `format-number(1234.5, "#,##0.00")`   | `1,234.50`    |
| `format-number(0.075, "0.00%")`       | `7.50%`       |
| `format-number(-42, "#,##0;(#,##0)")` | `(42)`        |
| `format-number(1234567, "$ #,##0")`   | `$ 1,234,567` |

The decimal and grouping separator characters used in the output (and in the format string itself) reflect the current `decimal-separator` setting. Use `${!set:decimal-separator,...}` to change them for the whole template — see [Option decimal-separator](#option-decimal-separator).

For example, to output European-style numbers (comma as decimal, dot as grouping) for every number in the template:

```
${!set:decimal-separator,","}
${=format-number(Price, "#.##0,00")}
```

The `decimal-separator` option applies globally and only needs to be set once per document.

The optional `dec-sep` argument overrides the separators for a single call, using the same format as the `decimal-separator` SET option:

- **1 character** — the decimal separator; grouping separator is derived automatically (`,` if decimal is `.`, otherwise `.`)
- **2 characters** — first character is the grouping separator, second is the decimal separator

If `dec-sep` is invalid (empty, more than 2 characters, contains a forbidden character, or both characters are the same), the function returns `"NaN"`.

Example — format a single number in European style without changing the global setting:

| Expression                                | Result     |
| ----------------------------------------- | ---------- |
| `format-number(1234.5, "#.##0,00", ",")`  | `1.234,50` |
| `format-number(1234.5, "#,##0.00", ".")`  | `1,234.50` |
| `format-number(1234.5, "#.##0,00", ".,")` | `1.234,50` |

#### Function parse-number

`parse-number(string, dec-sep?)` parses a localized number string into a number. By default, the same decimal and grouping separator characters are used for parsing as for formatting. 

The primary use-case for this function is reading numbers from the source data that are in a non-English numeric format. For instance, numbers that use a comma rather than a dot for the decimal separator, or numbers that use an alternative thousands-grouping separator. For numbers that are already in English format, the regular `number(..)` function can (also) be used.

The optional `dec-sep` argument overrides the separators for this call only, using the same format as the `decimal-separator` SET option:

- **1 character** — the decimal separator; grouping separator is derived automatically (`,` if decimal is `.`, otherwise `.`)
- **2 characters** — first character is the grouping separator, second is the decimal separator

If `dec-sep` is omitted, the separators from the current `decimal-separator` setting are used (default: `.` decimal, `,` grouping).

If `dec-sep` is invalid (empty, more than 2 characters, contains a forbidden character, or both characters are the same), the function returns `NaN`.

> **Note:** `parse-number` expects a clean numeric string — digits, separators, an optional leading sign (`+` or `-`), and nothing else. It cannot handle prefixes or suffixes such as currency symbols or other surrounding text. Passing a string like `"$ 1,234.50"` or `"EUR 42"` will return `NaN`. Strip any surrounding text before passing the value to this function.

Examples (default separators):

| Expression                       | Result   |
| -------------------------------- | -------- |
| `parse-number('1,234.50')`       | `1234.5` |
| `parse-number('-42')`            | `-42`    |
| `parse-number('.06')`            | `0.06`   |
| `parse-number('+2.4')`           | `2.4`    |
| `parse-number('abc')`            | `NaN`    |
| `parse-number('1234,50', ',')`   | `1234.5` |
| `parse-number('1.234,50', '.,')` | `1234.5` |

#### Function format-datetime

`format-datetime(str, format-str)` formats an ISO 8601 date, time, or date-time string as a custom string. It accepts any ISO 8601 input and uses whichever components are present — date components (`[Y]`, `[M]`, `[D]`, `[F]`), time components (`[H]`, `[h]`, `[m]`, `[s]`, `[P]`), or both. Returns `""` for empty input.

The `format-str` is composed of literal text and component markers in square brackets. Literal text is passed through as-is. To include a literal `[` or `]`, double it: `[[` → `[`, `]]` → `]`.

**Component markers:**

| Marker | Component    | Default      | Notes                                                                                                                   |
| ------ | ------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `[Y]`  | Year         | Numeric      | Use `[Y0001]` for 4-digit zero-padded output                                                                            |
| `[M]`  | Month        | Numeric      | `[MNn]`, `[MN]`, `[Mn]` for month names (English by default; override with `month-names` SET option)                    |
| `[D]`  | Day of month | Numeric      | Use `[D01]` for 2-digit zero-padded output                                                                              |
| `[H]`  | Hour (0–23)  | Numeric      | Use `[H01]` for 2-digit zero-padded output                                                                              |
| `[h]`  | Hour (1–12)  | Numeric      |                                                                                                                         |
| `[m]`  | Minute       | Numeric      | Use `[m01]` for 2-digit zero-padded output                                                                              |
| `[s]`  | Second       | Numeric      |                                                                                                                         |
| `[P]`  | AM/PM        | `am` / `pm`  | `[PN]` → uppercased; override names with `ampm` SET option                                                              |
| `[F]`  | Day of week  | English name | `[FN]` / `[Fn]` for UPPER / lower case; `[F1]` for ISO number (1=Mon…7=Sun); override names with `day-names` SET option |

**Numeric width modifier:** The modifier after the component letter controls zero-padding. `[D]` or `[D1]` → no leading zero. `[D01]` → at least 2 digits. `[Y0001]` → at least 4 digits.

**Named modifier (for `[M]` and `[F]`):** A modifier containing `N` or `n` selects a name. `Nn` or absent → Title Case. `N` → UPPERCASE. `n` → lowercase. `[M]` without a named modifier → numeric.

Examples:

| Expression                                                                   | Result                 |
| ---------------------------------------------------------------------------- | ---------------------- |
| `format-datetime("2025-03-28", "[Y0001]-[M01]-[D01]")`                       | `2025-03-28`           |
| `format-datetime("2025-03-28", "[D] [MNn] [Y0001]")`                         | `28 March 2025`        |
| `format-datetime("2025-03-28", "[FNn] [D01]/[M01]/[Y0001]")`                 | `Friday 28/03/2025`    |
| `format-datetime("2025-03-05", "[M]/[D]/[Y0001]")`                           | `3/5/2025`             |
| `format-datetime("14:05:09", "[H01]:[m01]:[s01]")`                           | `14:05:09`             |
| `format-datetime("14:05:09", "[h]:[m01] [PN]")`                              | `2:05 PM`              |
| `format-datetime("2025-03-28T14:05:09", "[D01] [MNn] [Y0001], [H01]:[m01]")` | `28 March 2025, 14:05` |

> **Note:** Month names, day-of-week names, and AM/PM designators default to English. Use the `month-names`, `day-names`, and `ampm` [SET options](#option-month-names) to override them for the whole template.

> **Note:** `format-dateTime` (with an uppercase T) is an alias for `format-datetime` and works identically.

#### Function parse-datetime

`parse-datetime(str, format-str)` is the inverse of `format-datetime`. It parses a formatted date, time, or date-time string back into an ISO 8601 string, using the same format string syntax. Returns `""` if the input is empty or the literal separators in the format do not match the input.

The format string uses the same component markers as `format-datetime` (see table above). Literal text between markers must match the input exactly. Component values not present in the format default to `0` (or `1` for month and day).

The output type is determined by which components appear in the format:
- Date components only (`[Y]`, `[M]`, `[D]`) → `YYYY-MM-DD`
- Time components only (`[H]`/`[h]`, `[m]`, `[s]`) → `HH:MM:SS`
- Both → `YYYY-MM-DDTHH:MM:SS`

When `[h]` (12-hour) is used together with `[P]` (AM/PM), the combination is converted to a 24-hour value. Month names (`[MNn]`, `[MN]`, `[Mn]`) and day-of-week names (`[F]`) are matched case-insensitively. Day-of-week is parsed but does not affect the output.

Examples:

| Expression                                                                       | Result                |
| -------------------------------------------------------------------------------- | --------------------- |
| `parse-datetime("2025-03-28", "[Y0001]-[M01]-[D01]")`                            | `2025-03-28`          |
| `parse-datetime("28 March 2025", "[D] [MNn] [Y0001]")`                           | `2025-03-28`          |
| `parse-datetime("3/5/2025", "[M]/[D]/[Y0001]")`                                  | `2025-03-05`          |
| `parse-datetime("14:05:09", "[H01]:[m01]:[s01]")`                                | `14:05:09`            |
| `parse-datetime("2:05 PM", "[h]:[m01] [PN]")`                                    | `14:05:00`            |
| `parse-datetime("2025-03-28T14:05:09", "[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]")` | `2025-03-28T14:05:09` |

> **Note:** Month names, day-of-week names, and AM/PM designators default to English. Use the `month-names`, `day-names`, and `ampm` [SET options](#option-month-names) to override them for the whole template.

> **Note:** `parse-dateTime` (with an uppercase T) is an alias for `parse-datetime` and works identically.


## System Variables

Rxindi provides a set of useful system variables, which can be used in XPath expressions. These variables are read-only and automatically set and updated by Rxindi. All system variables start with the prefix `$x:`. The following variables are available:

| Variable            | Type     | Description                                                                                              |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `$x:about`          | String   | Rxindi version and copyright information                                                                 |
| `$x:data-source`    | String   | Full path of the currently used data source                                                              |
| `$x:parameter`      | String   | Custom processing parameter                                                                              |
| `$x:compat-version` | Number   | Compatibility version, expressed as (Major * 100) + Minor, e.g. number 105 for v1.5                      |
| `$x:context`        | Node set | Current context in the data source, this is always a node set wit a single item                          |
| `$x:parent-context` | Node set | Previous context in the data source, after the current context changed, e.g. with `LOOP`                 |
| `$x:root-context`   | Node set | Root context, typically the root of the data source, or what is selected with `${!set:dataroot,...}`     |
| `$x:index`          | Number   | Current index in a `LOOP` or `ROWREPEAT`, starts at 1                                                    |
| `$x:count`          | Number   | Total items in a `LOOP` or `ROWREPEAT`                                                                   |
| `$x:first`          | Boolean  | True when the current item is the first item (same as `$x:index = 1`)                                    |
| `$x:last`           | Boolean  | True when the current item is the last item (same as `$x:index = $x:count`)                              |
| `$x:record-index`   | Number   | Current record index, starts at 1                                                                        |
| `$x:record-count`   | Number   | Total records, will only be more than 1 if `${!set:dataroot,...}` selects a Node set with multiple items |
| `$x:record-first`   | Boolean  | True when the current record is the first record (same as `$x:record-index = 1`)                         |
| `$x:record-last`    | Boolean  | True when the current record is the last record (same as `$x:record-index = $x:record-count`)            |

## Character Constants

Rxindi provides a set of read-only character constants using the `$c:` prefix. These are useful for inserting special or non-printable characters into output without needing to embed invisible glyphs in the template.

| Constant    | Unicode | InDesign Character       |
| ----------- | ------- | ------------------------ |
| `$c:tab`    | U+0009  | Tab                      |
| `$c:lf`     | U+000A  | Forced Line Break        |
| `$c:cr`     | U+000D  | Paragraph Break          |
| `$c:shy`    | U+00AD  | Soft Hyphen              |
| `$c:nbhy`   | U+2011  | Nonbreaking Hyphen       |
| `$c:nbsp`   | U+00A0  | Nonbreaking Space        |
| `$c:nnbsp`  | U+202F  | Narrow Nonbreaking Space |
| `$c:ensp`   | U+2002  | En Space                 |
| `$c:emsp`   | U+2003  | Em Space                 |
| `$c:thrsp`  | U+2004  | Third Space              |
| `$c:qsp`    | U+2005  | Quarter Space            |
| `$c:sixsp`  | U+2006  | Sixth Space              |
| `$c:figsp`  | U+2007  | Figure Space             |
| `$c:thinsp` | U+2009  | Thin Space               |
| `$c:hairsp` | U+200A  | Hair Space               |
| `$c:zwsp`   | U+200B  | Discretionary Line Break |
| `$c:ndash`  | U+2013  | En Dash                  |
| `$c:mdash`  | U+2014  | Em Dash                  |
| `$c:bull`   | U+2022  | Bullet                   |
| `$c:hellip` | U+2026  | Ellipsis                 |
| `$c:copy`   | U+00A9  | Copyright                |
| `$c:reg`    | U+00AE  | Registered               |
| `$c:trade`  | U+2122  | Trademark                |
| `$c:deg`    | U+00B0  | Degree                   |

**Examples**

Insert a nonbreaking space between a number and its unit:

```
${=number/.}${=$c:nbsp}${=unit/.}
```

Use an em dash as a separator:

```
${=title} ${=$c:mdash} ${=subtitle}
```

Concatenate with `concat()`:

```
${=concat(first-name, $c:nbsp, last-name)}
```

## System Attributes

Previous versions of Rxindi did not offer XPath variables but special System Attributes. These are still supported for backward compatibility, but it is HIGHLY recommended to migrate to the Rxindi System Variables instead as these offer many benefits, such as strong typing and not being tied to specific contexts.

> In `xpath-mode` `strict` System Attributes are NOT available.

> System Attributes are **deprecated** and will be removed in a future version (for all modes).

| System Attribute    | Migrate to        |
| ------------------- | ----------------- |
| `@rxc-parameter`    | `$x:parameter`    |
| `@rxc-index`        | `$x:index`        |
| `@rxc-count`        | `$x:count`        |
| `@rxc-first`        | `$x:first`        |
| `@rxc-last`         | `$x:last`         |
| `@rxc-record-index` | `$x:record-index` |
| `@rxc-record-count` | `$x:record-count` |

---
Copyright © 2020-2026 Rxcle. All Rights Reserved.
