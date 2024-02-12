# Rxindi 1.4

## Introduction

Rxindi is a plugin for Adobe InDesign. It enables you to automatically generate documents with unique data and design aspects from a single template InDesign document and an external data file, which can be of type Excel, XML, CSV or JSON. This functionality is sometimes called a "Data Merge" or in more general terms "Document Composition". 

A unique aspect of Rxindi is that template documents can be created without any special tools. Everything is defined with standard InDesign functionality and most of it with plain text. This also means that template documents for Rxindi are completely portable and can be edited or created even when you don't have Rxindi installed.

Rxindi imposes very little requirements on the actual layout of the input files. As long as your data is in one of the supported file types, you should be able to use it as-is.

There is a lot of flexibility and functionality for outputting not only text but also images and QR codes. Additionally, you can perform conditional and repeating actions, change styles and much more, and all this based on variable external data.

## Data Source

The external data that is to be used to generate documents in Rxindi is called the _Data Source_. Templates are written with a specific data source structure in mind, because inside the template you need to refer to the exact data that you want to use. You reference this data by writing _paths_. To tell Rxindi what to do with this data at this path you write Rxindi _statements_, which are types of instructions. For example, one of the statements is `OUTPUT`. You provide to this statement a path to data in the Data Source to let Rxindi know _what_ to output. When the template is complete, you select the actual data source that you want to use as variable input to generate a document with and then _Process_ with the Rxindi plugin. You can repeat this process any number of times using the same template document but different data.

Rxindi is not aware and does not care about the contents or structure of the Data Source as long as it is of a supported file type and the paths in your template match with the structure of the file. These paths are written using the universal standard _XPath_. Internally all data in Rxindi is treated as XML. If the data source is of a different type, then it gets automatically and transparently converted to XML using a transparent mapping convention. See the [Data Source Reference](#data-source-reference) for more information.

## Statements

Statements are instructions that tell Rxindi what to do. They are placed directly inside an InDesign Text Frame (or actually: Story). Rxindi supports many different statements, for example: `OUTPUT`, `IF`, `LOOP` and more. Every statement is associated with a single character, e.g. the `OUTPUT` statement is represented by the "equals" character: `=` .

In order to separate Rxindi statements from regular content in an InDesign Text Frame, they are placed in a _Placeholder_. The Rxindi placeholder format is `${...}`, where `...` represents the actual instruction statement(s) that you want to perform.

Example: 
```
Hello ${=FirstName}, your order is ${=OrderNo}
```

## Getting started

### First steps: Output

Content from the Data Source can be output into a story using the `${=...}` placeholder statement, where `...` is the actual reference to the content in the form of a path. In its most basic form A path consists of element names, separated by slashes `/` for each step towards the element you want to reference.

Let's use the following example XML Data Source:
```xml
<Root>
  <Person>
    <FirstName>John<FirstName>
    <LastName>Smith</LastName>
    <Address>Baker Street 221A</Address>
  </Person>
</Root>
```

To output the first name of the person in the data source to the document, the following placeholder, statement and path can be used in a text frame:
```
${=Person/FirstName}
```

When processing, this placeholder is replaced with the result: `John``. 
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

Components are defined in a Text Frame. It is recommended (but not necessary) to define components in a different Text Frame than where instances of it are to be placed. The Component definition Text Frame can be located anywhere, including unused Master Spreads, non-printing layers or off-page. A Text Frame can contain multiple Component definitions. For our example we'll define just one Component and name it `PersonDetails`. 

To define a Component, you start with the `${#PersonDetails}` statement, then write the Component contents and end with the `${.}` statement. The full definition of the example Component is as follows: 

```
${#PersonDetails}${=FirstName} ${=LastName} lives at ${=Address}{$.}
```

Now in the location where we want to use this Component you use the `${@...}` statement, where `...` is the Component name. 

In this case the full statement for placing an instance of a component is:

```
${@PersonDetails}
```

Symbols like `=`, `#` and `@` specify the _Statement Type_ and should always be the first character in a `${...}` placeholder. 

Components typically expect certain data, which is the context on which data paths inside the Component are relative to. In our example we have a data path to `FirstName`, so we will need a context that provides an element with that name.

If we only reference the Component and specify nothing else, then that Component will get the same data context as what is used at the location where we are referencing the component. In this case that is the default context, which is `/Root`. In this particular case we want to provide the Component with `/Root/Person` as context instead. If we do this, we can directly use the path to `FirstName` element inside the Component. This makes the Component independent from a particular parent element.

In order to provide a context when placing the Component, a comma is placed directly after the Component name, followed by the path to the data that should be used as context for the Component. In this case we want to provide `Person` (relative to `/Root`) as a context.

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

Data paths are in fact _XPath_ queries and within XPath there are many ways to select a particular element. In this case we'll keep it simple and just specify the numeric index of the element. This is done by appending the element name with `[1]` (1 here refers to the first element).

To place two separate instances of the `PersonDetails` component and fill them with the details of the two persons from the data, you can use the following statements:

```
${@PersonDetails,Person[1]}
${@PersonDetails,Person[2]}
```

In case you do _not_ provide a specific index for `Person` here but keep the statement with path simply as `${@PersonDetails,Person}`, the path on the data source would match 2 elements here. These would both be passed to the Component instance. Inside the Component we match any `FirstName` which will also match 2 elements (one for each Person). In other words, the result would be `JohnJane SmithDoe lives at Baker Street 221AMain Street 101`. In this case this is not what you'd want.

### Conditionals

By default, all statements in Rxindi are executed unconditionally, regardless if the specified path returns no matching data. Often, you'd only want to include certain data or perform actions in a document based on some condition though. This condition can be that data must be present or that a certain element in the data has a particular value.

Given our Person example, say that a Person may have a title, and there is another element that specifies whether that title should be output. We could use the following conditional statement set for this:

```
${?HasTitle=1}${=Title} ${.}${=LastName}
```

Let us break this down into its individual elements

| Part             | Statement   | Description |
|------------------|-------------|-------------|
| `${?HasTitle=1}` | `IF`        | The `?` indicates that this is an `IF` statement. It is immediately followed by an expression, in this case `ShouldShowTitle`. If this has value "1" then consecutive statements are processed.
| `${=Title}`      | `OUTPUT`    | Output the value of `Title`, but because it directly follows the `IF` statement, this only happens if that evaluated to _true_.
| `${.}`           | `END`       | This ends the _statement block_ started by the `IF` statement. It is necessary here because otherwise _everything_ following the `IF` would be processed only if that evaluated to _true_. We only wanted the `OUTPUT` statement for the Title to be conditional though so that is why we end the block here.
| `${=LastName}`   | `OUTPUT`    | Output the value of `LastName`. Because this follows an `END` this statement is _not_ conditional and always processed.

The following example shows a statement that outputs either the Title _or_ FirstName and always the LastName:.

```
${?HasTitle=1}${=Title} ${:}${=FirstName} ${.}${=LastName}
```

This statement-set is similar to the previous one, only the new statements will be explained.

| Part            | Statement | Description |
|-----------------|-----------|-------------|
| `${:}`          | `ELSE`    | Ends the _statement block_ started by the `IF` statement and starts a new statement block that only is processed if the preceding `IF` evaluated to _false_.
| `${=FirstName}` | `OUTPUT`  | Output the value of `FirstName`. Because it follows an `ELSE` statement, it will only be processed if the initial `IF` evaluated to _false_.


The example can also be written using an alternative syntax as follows:

```
${?HasTitle=1;=Title;:;=FirstName;.;=string(' ');=LastName}
```

Here the entire `IF`-`OUTPUT`-`ELSE`-`OUTPUT` statement set is placed in a single placeholder and the individual statements are separated by semicolons. The result of this is exactly the same as the previous example.

---
## User Interface

The user interface of Rxindi consists of a single InDesign panel which can be opened via the `Window` `>` `Extensions` `>` `Rxindi` menu in InDesign. The panel has three sections which can be expanded and collapsed.

- `Prepare`
    - This section has a quick reference guide of all available statements.
    - The `Validate Statements` button performs a quick statement validation on the current document
        - Validation only catches basic syntax errors, it will not detect logical issues (e.g. incorrect paths to data) nor will it detect references to non-existing frames, styles, etc.
        - Validation makes no changes to the document.
- `Process`
    - Here you can (optionally) select a data source file (XML, JSON, CSV, XLSX)
    - The `Process Document` starts the actual processing.
        - In order to process a document, it must have been _saved_ and _unmodified_
    - In case `Compatibility Mode` is enabled, this is shown here with a text label
      - Toggle this on/off via the Rxindi panel menu under `Options` `>` `Compatibility`
- `Result`
    - This will show the result of the last Validate or Process action
    - Some errors will include a clickable link that will (attempt to) go to the source statement in the document that caused the error.

The panel menu contains the following items:
- `Help` : Opens a window with the help text
- `Load into XML Structure` : Loads the current data source into InDesign's (XML) Structure
- `Options` : Configure Rxindi behavior
  - `Compatibility` : Set the processing compatibility mode
    - `Latest` : (Recommended) Templates are compatible with this version of Rxindi
    - `v1.3 (Legacy)` : Process in v1.3 compatibility mode - some newer features may not be available
  - `Mapping Mode` : Sets the mode to use for data file mapping (JSON, CSV, XLSX)
    - `Default` : Default mapping behavior. Assumes headers are present for CSV and XLSX and maps them
    - `Raw` : Do not map property/column names and treat headers for CSV and XLSX as regular data
    - `Classic` : Classic mapping behavior, same as in v1.3 and before (implied when using v1.3 Compatibility mode)
  - `Logging` : Set the logging level
    - `Normal` : (Recommended) Regular logging of processing steps and errors
    - `Verbose` : Log very detailed information during processing, log files can become large - only enable when troubleshooting
  - `Reinitialize` : Reload Rxindi - Typically only needed in case of issues
- `Logs` : Opens the directory that contains the log files

### Compatibility Mode
In order to add certain new features and improve the general behavior of Rxindi, some versions unfortunately have breaking changes in behavior compared to a previous one. This for example the case when upgrading to v1.4 from a previous version.

Unfortunately, this _can_ mean that template documents made for an earlier version of Rxindi no longer behave as expected in the latest version, depending on the features of Rxindi used.

Using the `Options` `>` `Compatibility` settings in the Rxindi panel menu you can explicitly switch the processing behavior back to a previous version to allow you to process these older template documents as-is. When set to anything else but `Latest`, the main Rxindi interface will also show the text `Compatibility Mode` to indicate that processing behavior will deviate from what it would be with the latest version.

The Rxindi manual only explains the functionality and behavior for the _latest_ version, which may not match with the behavior you see in Compatibility Mode. Also be aware that Compatibility Mode attempts to emulate the old behavior as closely as possible, meaning that newer features and processing improvements may not be available in this mode. 

### Mapping Mode
The mapping mode determines how data files from a format other than XML are converted. This impacts the paths you write in order to get data from the data files. If Legacy Compatibility Mode is enabled,  then the Mapping mode cannot be changed (it will always be "Classic"). The difference between "Default" and "Raw" mainly determines how property names and column headers map to element names. See the [Data Source Reference](#data-source-reference) section for details on each mode.

---
# Statement Details 

Rxindi performs its processing on an InDesign document based on processing instructions called _"Statements"_. These statements can be placed in the Story of any Text Frame.

In order to identify Rxindi statements in inline text, and to distinguish them from other content, they must be placed in a _placeholder_. Placeholders use a set of character combinations that is unlikely to occur in normal text. For Rxindi the placeholder syntax is `${...}` where the `...` marks the location where the actual statements go. An example of an actual placeholder with statement is `${=FirstName}`. On processing, this placeholder and statement are replaced with the contents of a _FirstName_ element.

> Placeholders only exist as a _container_ for Rxindi Statements, they perform no logic in itself. For instance `${}` is a valid placeholder which does nothing and `${blabla}` is a valid placeholder which contains an _invalid_ statement.

## Statements
Statements specify the actual processing action for Rxindi to perform. All statements start with a single symbol that indicates the statement type. This must be the first non-whitespace character following either a placeholder opening `${` or multi-statement separator `;` (more on this later)

Many statements also expect one or more arguments. The main argument directly follows the statement symbol. Additional arguments follow the main argument, separated by a comma. Note that the expected arguments and their meaning varies per statement type.

An example of a statement with two arguments:

```
${@PersonDetails,Person[1]}
```

| Part            | Meaning |
|-----------------|---------|
| `${`            | Placeholder start
| `@`             | Statement symbol - `PLACE`
| `PersonDetails` | Main argument - Component name
| `,`             | Argument separator
| `Person[1]`     | Second argument - XPath for context
| `}`             | Placeholder end


## Blocks
Certain statements implicitly start a logical scope _Block_ in which all consecutive statements are processed until the Block is closed. Blocks are closed either implicitly or explicitly. For example the `IF` statement (`${?...}`) will start a block. This means that everything following the `IF` statement is placed in a block and only gets processed if the `IF` is _true_. The block is either explicitly closed using an `END` statement (`.`) or implicitly by using an `ELSE` statement; Which will actually start a _new_ implicit block for the `ELSE`. Additionally, the end of an InDesign story or a Table cell also implicitly closes all open blocks. 

The statement types that have block behavior are: `IF`, `ELSE`, `LOOP` and `COMPONENT`.

Block statements may be nested, meaning that you can place and `IF` in an `IF`, etc. When closing blocks explicitly make sure that the `END` statements match up with the opening statement to get the desired behavior.

## Multiple Statements
Multiple statements can optionally be placed in a single placeholder by separating them with a semicolon `;` sign. For example `${=FirstName;=LastName}` will give the same result as `${=FirstName}${=LastName}`. 

InDesign content can only go between placeholders, so there are cases where combining statements in a single placeholder will not work, e.g. `${?sayHello}Hello ${=FirstName}${.}`. Here the `IF` needs to be in a separate placeholder, otherwise the literal "Hello " cannot be included, the `OUTPUT` and `END` could be combined though: `${?sayHello}Hello ${=FirstName;.}`

## Literal Placeholder
If you want to use the _literal_ placeholder `${...}` character combination as text in an InDesign document that needs to be processed by Rxindi, you need to prefix it with a zero-width space (U+200B) or zero width non-joiner (U+200C) character. So `<ZWPS>${...}`. This will ensure that Rxindi will ignore these placeholders completely.

Note that the zero-width space/non-joiner must be placed _immediately_ before the opening `$` character with no other characters or whitespace in between.

## Reserved Characters
Some characters are reserved characters in all statement arguments within Rxindi placeholders and cannot be used directly. This also applies to XPath literal strings and XPath function calls. These reserved characters are:
- Comma: `,`
- Semicolon: `;`
- Closing curly brace: `}`

To use them in an argument, you have to put a backslash immediately before it, so `\,`. An example of the XPath `concat` function using this convention: `${=concat('\,'\,'\;'\,'\}')}`. This will produce the output `,;}`

---
# Statement Reference


| Name        | S   | Arguments                                                 | Description |
|-------------|-----|-----------------------------------------------------------|-------------|
| `OUTPUT`    | `=` | `1` XPath<br/>`2` Target _opt_                            | Output content from the given path in the data source to the document.
| `IF`        | `?` | `1` XPath                                                 | Only include/process following content if expression is _true_.
| `LOOP`      | `*` | `1` XPath<br/> **or** Number                              | Repeat following content based on iteration over expression or number
| `ELSE`      | `:` | `none`                                                    | Only include/process following content if preceding `IF` is false or preceding `LOOP` has no items.
| `COMPONENT` | `#` | `1` Name                                                  | Define a Component. Everything following this statement up to the matching `END` statement is part of the Component. Use `PLACE` to instantiate.
| `PLACE`     | `@` | `1` Comp<br/>`2` XPath _opt_                              | Instantiate a defined component. Optional path specifies the data context for the Component instance.
| `END`       | `.` | `none`                                                    | End block started by `COMPONENT`, `IF`, `LOOP` or `ELSE`.
| `SCRIPT`    | `&` | `1` Script name<br/>`2` Target _opt_<br/>`3+` XPath _opt_ | Execute the external script with the given name, optionally passing a specific target and/or the result of any number of XPath Expressions.
| `ACTION`    | `!` | `1` Action type<br/>`2` Target _opt_                      | Execute an action of the given type, optionally on a specific target.
| `ROWREPEAT` | `-` | `1` XPath<br/> **or** Number                              | Repeat table row based on iteration over expression or number

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
|---------|--------------------------------------------------------------------------------------------------------------------------------|
| Text    | Output content is appended to the existing content.                                                                            |
| Image   | Output content is interpreted as a path to a valid image file, which is placed in the image frame (replacing an existing one). |
| QR Code | Output content is used as new values for the QR Code.                                                                       |

Note that the target frame must already have the desired type in the template document. Rxindi will never change the type of a frame on output.

Any properties set on the frame in the template document are retained. This includes Object Style, Image Fitting and the used QR Code Swatch.

### Images
When targeting an Image frame, it needs to be of Content Type "Graphic" in the InDesign template. This is the default when placing an image manually in InDesign and typically also when drawing a rectangle. InDesign indicates this with a diagonal cross in the frame. To change the content type in InDesign you can open the context menu on the frame and select `Content` `>` `Graphic`.

The image reference in the data file needs to be either the full (absolute) path to a file or it can be a  path relative to the data source file being used. For instance, if the image files are in the same directory as the data file, then you just have to specify the file name.

All image types supported by InDesign can be used.

### QR Codes
To create a QR Code with the `OUTPUT` statement, first generate a QR Code of the desired type and with the desired size and swatch within the InDesign template document. The initial values in the template document can be either dummy values or the default/standard values you want to use. Next, give the frame that contains the QR Code a unique name and target it using the `OUTPUT` statement. The QR Code will then be updated with the value that results from the path for `OUTPUT`.

Some of the QR Code types in InDesign have multiple fields that can be set. To target a specific field, use the following syntax in the `OUTPUT` path: `<field1>:<value>|<field2>:<value>|...` to combine this with data from the data file you can use the XPath `concat(...)` function. All fields are optional, if a field is not set its existing/default value is retained. Note that field names are case-insensitive but specified here in all-lowercase.

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
  - `message`
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
${=concat('emailaddress:'\,@email\,'|subject:'\,@subject),QRCodeFrame}
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
  - Non existing element or attribute
  - Element or attribute with no or all-whitespace content
  - Element with no child elements
  - Value "0"
  - Value "NaN"
  - Value "false"

All other results are considered a _"true"_ value.

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

The following special attributes are available for expressions of the child block on the current context:

| Attribute    | Type    | Meaning |
|--------------|---------|---------|
| `@rxc-index` | Number  | The current index, starts at 1 
| `@rxc-count` | Number  | Total number of items in the loop
| `@rxc-first` | Boolean | True only if the current iteration is over the first item
| `@rxc-last`  | Boolean | True only if the current iteration is over the last item

The type of the return type of the specified path specifies what the exact behavior is for `LOOP`. These match the main types for XPath.

| Return type                                | Behavior                                                                                      | Context Change |
|--------------------------------------------|-----------------------------------------------------------------------------------------------|----------------|
| Empty (No Result)                          | No loop                                                                                       | No             |
| Number                                     | No loop if number is `<= 0` otherwise loop `value` number of times (using _floor_ of decimal) | No             |
| Boolean                                    | No loop if `false`, loop once if `true`                                                       | No             |
| String                                     | No loop if string is empty `""`, loop once if string is not empty (actual value is ignored)   | No             |
| Single Element, Attribute or Text node     | Loop once on the exact node returned (not its children!)                                      | Yes (the node) |
| List of Elements, Attributes or Text nodes | Loop over all the nodes in the list                                                           | Yes (per node) |

As of Rxindi v1.4 these types must be exact, meaning that a "number-like" value in a string is not automatically treated as an actual number. If you want to loop a certain number of times based on a value from XML data, you might need to explicitly cast this to a number: `number(@someAttribute)`. Often loop is used to iterate over Elements, Attribute and Text nodes - the types for these are implicit.

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
  Product ${=@rxc-index}: ${=.}
${.}
```

Note that within the `LOOP` block the context changes to the actual `<product>` being iterated over, this is why in the second `OUTPUT` statement we can output just the value of "the current context" (using the `.` XPath expression).

### Example 2

To loop the number of times specified in the `<stock>` element (5), you need to make sure to specify a path that returns an actual number and not just the Element `<stock>5</stock>` or its (string) contents `"5"`. The path to use here is: 
```
${*number(/data/stock)}
  Number: ${=@rxc-index}
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
Defines a named Component, which is a collection of reusable statements and content that is to be instantiated one or multiple times.

**Syntax**
```
# <componentName>
```

**Example**
```
${#CompA}My Component${.}
${#CompB}${=FirstName}${.}
```

The `COMPONENT` statement starts an implicit _block_ containing the content and statements directly following the Component statement. As will other _block_ types, the end of the definition is indicated explicitly using `END` (`.`) or implicitly by the end of the current Story or end of the multi-statement Placeholder.

Component definitions by themselves do nothing. You must explicitly reference a component in order for it to be instantiated and processed. Components can be instantiated using `PLACE` (`@`) by providing their name and optionally data context.

Because Component definitions are not part of the normal document content you can define them off-page, e.g. in a text frame on the pasteboard or on an otherwise unused master page. This is however not a strict requirement you can define Components in the same Story as where you reference them if you like. 

Component definitions always must be the top-_level_ statement in a Story. This does not mean that they need to be at the _start_ of the Story, but that they cannot be a logical child of e.g. an `IF`, `LOOP` or other `COMPONENT` statement.

The actual order of Component definitions in the document structure does not matter; You can reference a Component which is defined much later in the document.

Components must have a unique name which is case sensitive. Standard statement escape rules apply to Component names as well. For instance, if you want a Component name to literally contain `;` you must write it as `\;`.

After a document has been successfully processed, the Component definitions will be _removed_ from the document.

Component definitions can reference other Components using `PLACE` statements. It is however _not_ allowed for Components to reference themselves, nether directly or indirectly (via another Component). Doing so anyway will cause a processing error.

## PLACE (`@`)
Places an instance of a Component with the given name. Optionally providing a new data context path for the Component.

**Syntax**
```
@ <componentName> (,<xpath>) 
```

**Example**
```
${@PersonDetails}
${@PersonDetails,/Root/Person/FirstName}
```

Components are defined and named using the `COMPONENT` (`#`) statement. Components may be defined after they are placed in the document structure. Referencing an unknown Component will give an error.

By default, Components get the same data context as the current context at the location of the `PLACE` statement. To provide a different context for the Component use a `,` directly after the Component name and supply an XPath expression.

Not that the data context does _not_ control whether the Component is placed. Even if the data context resolves to no data, the Component is still placed; The Component itself may have logic to deal with this occurrence (e.g. it may output "No data available"). If you want to prevent a Component from being placed if there is no data, then precede it with an `IF` statement.

## END (`.`)
Ends the current (innermost) _block_ that was started either via `IF`, `ELSE`, `LOOP` or `COMPONENT`. 

**Syntax**
```
.
```

**Example**
```
${.}
${?IsTrue}${FirstName}${.}
```

This statement expects no arguments. If there is no block to close at the position of this statement, then an error is given.

`END` statements are not strictly required at the very end of a multi-statement placeholder because all blocks opened in the same multi-statement placeholder are automatically closed. The same is true for any block still open at the end of a text frame or table cell, these too are automatically closed.

## SCRIPT (`&`)
Executes a custom external script.

**Syntax**
```
& <name> (,<target> (,<args>...))
```

**Example**
```
${&AddPages}
${&RotateFrame,myFrame}
${&PlacePicture,pictureFrame,string('Alt text')}
```

Scripts must be in the CC ExtendScript format and use (only) statements that are compatible with the version of InDesign being used to process the document. The script must have either the `.js` or `.jsx` extension and be located in the same directory as the InDesign template document being processed, or in a `scripts` subfolder below the document being processed. Global scripts are _not_ considered. When referencing the script, the extension must be omitted, and the casing must match that of the script filename exactly.

From within the script, the global ExtendScript variables `app` and `document` are not available. Instead, the `scriptArgs` object contains properties that are relevant to the context in which the scripts executes.

| Property   | Type                        | Description |
|------------|-----------------------------|-------------|
| `document` | `Document`                  | The InDesign Document currently being processed. Use `document.parent` to get the `Application` object
| `name`     | `string`                    | Name of the current script
| `context`  | `XML`                       | Current XML context
| `target`   | `InsertionPoint` or `Frame` | Target for current script. For scripts called from within a Story, without an explicit target this will be an `InsertionPoint`. When called with a target frame name this will be a `TextFrame` or `SplineItem` (typically a `Rectangle`).
| `params`   | `Array`                     | Array of additional parameter arguments passed to the script.

To halt further execution of processing from within a script, either return the `boolean` value `false` or `throw` an `Error` object.

Arguments three and beyond for the `SCRIPT` statement are interpreted as XPath and are evaluated against the current data context. Its results are passed as the `params` array property on the `scriptArgs` to the script, where the result of the third argument for `SCRIPT` is the first (zeroth index) value on `scriptArgs.params`. Note that in order to pass literal (constant) text, it must be made into a valid XPath statement first, so pass it as: `string('static text')`. Numeric values can be passed directly. To specify parameter arguments without specifying a different target, just use an empty target argument: `<script>,,<args>`.

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

| Action Type       | Description                                                                                          | Target      |
|-------------------|------------------------------------------------------------------------------------------------------|-------------|
| `hide`            | Hides the target or current frame.                                                                   | Optional    |
| `show`            | Shows the target or current frame if hidden.                                                         | Optional    |
| `state:<name>`    | Apply the State with the specified name to the target frame, which must be a multi-state object.     | Required    |
| `ostyle:<name>`   | Apply the Object Style with the specified name to the target or current frame.                       | Optional    |
| `cstyle:<name>`   | Apply the Character Style with the specified name to the following content or to the target frame.   | Optional    |
| `pstyle:<name>`   | Apply the Paragraph Style with the specified name to the current paragraph or to the target frame.   | Optional    |
| `tstyle:<name>`   | Apply the Table Style with the specified name to the table which the statement is in.                | Not allowed |
| `tcstyle:<name>`  | Apply the Cell Style with the specified name to the cell which the statement is in.                  | Not allowed |
| `tcrstyle:<name>` | Apply the Cell Style with the specified name to (all cells of) the row which the statement is in.    | Not allowed |
| `tccstyle:<name>` | Apply the Cell Style with the specified name to (all cells of) the column which the statement is in. | Not allowed |

Note that an `ACTION` by itself is always executed, it has no condition of its own. In order to make it conditional (or run multiple times) place it after an `IF` or `LOOP` statement.

### Styling actions
The styling type actions all take an action type argument, which is the (exact) name of the style you want to apply to the respective item. The referenced style name must exist in the template document. If no style name is given, then the current style is _removed_ from the target item and the document default style is applied instead.

For the object style action `ostyle` either the Object Style of the target frame is changed, or the Object Style of the current frame.

The text style actions `cstyle` and `pstyle` can either target a particular frame, which will change the Character/Paragraph Style of that frame. If no target is given, then the style of the paragraph that the statement is in is changed for `pstyle`. For `cstyle` the current character style for new content _following it_ (e.g. via `OUTPUT`) is changed, existing text is not changed.

For the table style actions `tstyle`, `tcstyle`, `tcrstyle` and `tccstyle`, the statement itself must be placed in the cell that is in the (part of) the table of which the style is to be changed. The target argument for `ACTION` cannot be used with these action types. All table style change actions can freely be mixed within the same table.

The name of the referenced style must match the name in InDesign exactly (including casing). It can either refer to the name of a style at top-level or the full "path" to a style in case it is contained in one or more style groups. In case of grouped styles, the group name(s) are separated from the style name using forward slashes `/`. The style name must always be the last part of the path. 

For example: Given the following grouping structure:
- StyleGroupA
  - StyleGroupB
    - MyPStyle

You would use the following statement to refer to it in a `pstyle` action: `${!pstyle:StyleGroupA/StyleGroupB/MyStyle}`

If a group or a style name contains a literal `/` character then you must escape it using a backslash immediately before it. For example, to refer to the style `This/That` use `This\/That` in the style action.  Escaping forward slashes is not necessary (but still allowed) for a style that is specified at top-level (non-grouped) in InDesign though.

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

If the collection has no items or the number is equal to or less than `0` then the row on which the statement is defined is removed. The statement must always be the first statement in the first cell of a table row and a table row can contain only one `ROWREPEAT` statement. Tt is valid to have multiple rows in the same table with `ROWREPEAT` statements though.

The behavior of `ROWREPEAT` in terms of how the path result is interpreted, as well as the set of special attributes (e.g. `@rxc-index`) that are available is identical to that of `LOOP`. Please refer to its documentation section on this.

---
# Data Source Reference 

Data Sources can be in the XML, JSON, CSV or XLSX (Excel) format. Non-XML data sources are automatically and transparently converted to an XML representation when processing using the rules specified in this chapter. When referring to content in the Data Source, XPath (1.0) syntax is used, regardless of the original Data Source format.

If the input file is an XML file, then that file is used as-is. The rest of this chapter will explain how the other file types are converted.

> In all examples in this chapter _absolute_ XPaths are used, starting at the root e.g. `/data/persons/...`. In practice the root can usually be omitted in paths in Rxindi as it is the default data context => `persons/...`

## Mapping Modes

Conversion from JSON, CSV or XLSX to XML can be done in many different ways. For sake of consistency and compatibility Rxindi has settled on providing a limited set of options for the automatic conversion which is suited for the majority of common use cases. If you need a very specific solution that the automatic conversion cannot offer, you can convert the original data to XML outside of Rxindi using an external tool, website or service and use the resulting XML as data source for Rxindi instead.

The conversion behavior is controlled by a "Mapping Mode". Rxindi currently offers three:
- `Default`
- `Raw`
- `Classic`

As the name implies, `Default` is the default mapping mode and active when first installing Rxindi. You can change the mapping mode in the Rxindi Panel menu, under `Options` `>` `Mapping Mode`. The selected option is saved and used for all following Processing actions. Note that when using "Compatibility Mode" the Mapping Mode cannot be changed (it is implied to be `Classic`).

Here is an overview on the modes and its effect on the file type:

| Mapping Mode | XML       | JSON                         | CSV & XLSX                                    |
|--------------|-----------|------------------------------|-----------------------------------------------|
| `Default`    | _Ignored_ | Map property to element name | Map column header to element name             |
| `Raw`        | _Ignored_ | Use generic element `p`      | Use generic element `c`, treat header as data |
| `Classic`    | _Ignored_ | _Map like Rxindi 1.3_        | _Map like Rxindi 1.3_                         |

### Column/Property name mapping for Default and Classic

For modes `Default` and `Classic` a best attempt is made to map the Column (XSLX & CSV) and Property (JSON) names onto XML Element names. This is done so that paths for mapping in Rxindi templates become a bit easier to write. For some names, Rxindi has to make some adjustments because the rules for what is allowed in an XML Element name are much stricter than what is allowed in Column & Property names. 

- Characters in the column/property name that are not allowed in XML:
  - In `Default` mode: _removed_
    - Example: `Time Zone` becomes element `TimeZone`
  - In `Classic` mode: _encoded_
    - Example: `Time Zone` becomes element `Time_x0020_Zone`  
- If the column/property name is empty, only contains disallowed XML characters or starts with `.`, `-`, `xml` or a number, then the element name is either prefixed with or gets as a _fixed_ name:
  - In `Default` mode: 
    - JSON: `p`
    - XSLX/CSV: `c`
  - In `Classic` mode: 
    - JSON: `_` (empty & xml prefix, _encoded_ for dot, dash, number)
    - XSLX/CSV: Spreadsheet-like column character(s), e.g. `AB` (empty & xml prefix, _encoded_ for dot, dash, number)
- JSON array elements always get a default element name:
  - In `Default` mode: `p`
  - In `Classic` mode: `Item`
- In `Default` (and `Raw`) mode every element (JSON) or column element (XSLX/CSV) has a `name` attribute with the _original_ property/column name. This is not available in `Classic` mode.

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

### Default mode

The `Default` mapping mode maps JSON in such a way that ensures that all original information is retained and paths to the data can be written in multiple ways. A best effort is made to map JSON property names onto XML element names.

- Every JSON property and array item becomes an XML element
- The name of the JSON property becomes the name of the XML element 
- Every property value becomes content of the XML element for the property
- Every element is annotated with the JSON value type using the `type` attribute
- The root XML element is a fixed element is always named `data` 
- Array item elements are always named `p` and have the array index as `name` attribute
- The technical name for this mode is `json/2` (it is identified as this on the root element)

#### Resulting XML from JSON with Default mode

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

To refer to the `name` property of `children`, the following XPaths can used:
```
/data/children/name  => "childObject"
/data/*[@name="children"]/*[@name="name"]  => "childObject"
```

The second path is a bit convoluted for this particular case, but it demonstrates how to access data for property names which would not be valid as XML element names (e.g. ones containing spaces, special characters or starting with numbers) - something which is not possible with `Classic` mode.

Possible values for the `type` attribute:
- `object`
- `array`
- `number`
- `boolean`
- `string`
- `null`

Properties with an explicit value of `undefined` in the source JSON are _excluded_ from the XML.

### Raw mode

The `Raw` mapping mode for JSON is very similar to `Default` mode, the only difference is that no attempt is made to map JSON property names to XML Element names - all element names simply become `p`.

- Every JSON property and array item becomes an XML element
- The name of every JSON property becomes an XML element with name `p`
- Every property value becomes content of the XML element for the property
- Every element is annotated with the JSON value type using the `type` attribute
- The root XML element is a fixed element is always named `data` 
- Array item elements are always named `p` and have the array index as `name` attribute
- The technical name for this mode is `json/3` (it is identified as this on the root element)

#### Resulting XML from JSON with Default mode

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

To refer to the `name` property of `children`, the following XPath can used:
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

### Classic mode

The `Classic` mapping mode maps JSON in (mostly) the exact same way as Rxindi did in version 1.0 through 1.3.
This mode is useful if you have to work with documents that need to remain backwards compatible with older versions, or if you don't want to change the paths to data in existing templates.

For new projects the `Default` mapping mode is recommended.

- Every JSON property and array item becomes an XML element
- The name of the property becomes the name of the XML element
- Every property value becomes content of the XML element for the property
- Every element is annotated with the JSON value type using the `type` attribute
- The root XML element is a fixed element is always named `Root` 
- Array item elements are always named `Item`

#### Resulting XML from JSON with Classic mode

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Root type="object">
  <text type="string">Hello World</text>
  <children type="object">
    <name type="string">childObject</name>
    <emptyText type="string"></emptyText>
    <data type="null"></data>
  </children>
  <hasValue type="boolean">true</hasValue>
  <amount type="double">1.23</amount>
  <date type="string">2017-01-03 23:54:18</date>
  <myItems type="array">
    <Item type="string">firstItem</Item>
    <Item type="string">secondItem</Item>
  </myItems>
  <_ type="string">empty</_>
</Root>
```

To refer to the `name` property of `children`, the following XPath can used:
```
/Root/children/name   => "childObject"
```

Possible values for the `type` attribute:
- `object`
- `array`
- `double` 
- `boolean`
- `string`
- `null`

Properties with an explicit value of `undefined` in the source JSON are excluded from the XML.

## CSV

CSV (Comma separated values) data sources are plain text tabular files. They can be written by hand using a plain text editor or can be created and exported with spreadsheet software like Excel or LibreOffice Calc. Many software applications also have export features that produce CSV files. In a CSV file every row denotes a row, with the first line (typically) being the header that defines the columns. Columns are separated by commas, semicolons or tabs.

CSV can be mapped to XML using either the `Default`, `Raw` or `Classic` mapping mode. For `Default` and `Classic` mode the CSV is expected to have a header as first row and the column names are used in the mapping. For `Raw` mode a header is not required, or if present treated like any other row.

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

### Default mode

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

#### Resulting XML from CSV with Default mode

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

To refer to the `Location` column of the second row, the following XPaths can used:
```
/data/row[2]/Location  => "Amsterdam"
/data/row[2]/*[1]  => "Amsterdam"
/data/row[@index=2]/*[@index=1]  => "Amsterdam"
/data/row[@index=2]/*[@name="Location"]  => "Amsterdam"
```

The third and fourth paths are a bit convoluted for this particular case, it demonstrates how to access the data by CSV row/column index and name attributes, which works even if the column would contain special characters - something which is not possible with `Classic` mode.

### Raw mode

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

#### Resulting XML from CSV with Raw mode

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

To refer to the `Location` column of the third row, the following XPaths can used:
```
/data/row[3]/c[1]  => "Amsterdam"
/data/row[@index=3]/c[@index=1]  => "Amsterdam"
```

Note how the row numbers here have shifted compared to `Default` mode. Because the "header" is included as a normal row (row 1), the row numbers for following rows increase by one.

### Classic mode
The `Classic` mapping mode maps CSV in the same way as Rxindi did in version 1.0 through 1.3.
This mode is useful if you have to work with documents that need to remain backwards compatible with older versions, or if you don't want to change the paths to data in existing templates.

For new projects the `Default` or `Raw` mapping mode is recommended.

- The first line in the CSV is expected to be a header with column names
- Following lines contain rows with values
- No value type information can be inferred from CSV so everything is treated as type `string`
- The root element in the XML is always named `Root` with `type="array"`
- Every row in the CSV becomes a `Row` XML element with `type="object"`
- Each column for every row becomes an XML element with the name being the name of the column and the value the cell value

#### Resulting XML from CSV with Classic mode

```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Root type="array">
  <Row type="object">
    <Location type="string">New York</Location>
    <Value type="string">2</Value>
    <C type="string">true</C>
    <Time_x0020_Zone type="string"></Time_x0020_Zone>
  </Row>
  <Row type="object">
    <Location type="string">Amsterdam</Location>
    <Value type="string">43</Value>
    <C type="string"></C>
    <Time_x0020_Zone type="string">CET</Time_x0020_Zone>
  </Row>
  <Row type="object">
    <Location type="string">Brussels</Location>
    <Value type="string">4</Value>
    <C type="string">false</C>
    <Time_x0020_Zone type="string"></Time_x0020_Zone>
  </Row>
  <Row type="object">
    <Location type="string">Paris</Location>
    <Value type="string">5</Value>
    <C type="string"></C>
    <Time_x0020_Zone type="string"></Time_x0020_Zone>
  </Row>
  <Row type="object">
    <Location type="string">Berlin</Location>
    <Value type="string">34</Value>
    <C type="string"></C>
    <Time_x0020_Zone type="string"></Time_x0020_Zone>
  </Row>
</Root>
```

To refer to the `Location` column of the second row, the following XPath can used:
```
/Root/Row[2]/Location  => "Amsterdam"
```

Note in the resulting XML how the third column automatically got an element name of `C` (uppercase) which happens to be the default spreadsheet column name for column 3, not to be confused with lowercase `c` which is the standard column element name for `Default` and `Raw` mode.

 Also note how in the fourth column, "Time Zone" has element name `Time_x0020_Zone` (with an encoded name)

## XLSX (Excel)

XLSX (Excel) data sources are spreadsheet documents, they can contain multiple sheets with rows and columns of typed and formatted values.

XLSX can be mapped to XML using either the `Default`, `Raw` or `Classic` mapping mode. For `Default` and `Classic` mode the sheets in the XLSX are expected to have a header as first row and the column names are used in the mapping. For `Raw` mode a header is not required, or if present treated like any other row.

Example source XLSX with two sheets: 

|     | `A`           | `B`       | `C`   | `D`           |
|-----|---------------|-----------|-------|---------------|
| `1` | **Location**  | **Value** |       | **Time Zone** |
| `2` | New York      | 2         | TRUE  |               |
| `3` | Amsterdam     | 43        |       | CET           |
| `4` | Brussels      | 4         | FALSE |               |
| `5` | Paris         | 5         |       |               |
| `6` | Berlin        | 34        |       |               |

`[DataSheet]` `Other`

Notes:
- _Row numbers and column letters (A, B...) are not part of the actual data_
- _The third column has no name_
- _Some values in the third and fourth column have no value_
- _This document has two sheets, only "DataSheet" has data_

### Default mode
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

#### Resulting XML from XLSX with Default mode

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

To refer to the `Location` column of the second row, the following XPaths can used:
```
/data/sheet[1]/row[2]/Location  => "Amsterdam"
/data/*[1]/*[2]/*[1]  => "Amsterdam"
/data/sheet[@name="DataSheet"]/row[@index=2]/*[@name="Location"]  => "Amsterdam"
/data/sheet[@index=1]/row[@index=2]/*[@index=1]  => "Amsterdam"
```

The second and third paths demonstrate how to access the data by sheet/row/column index and name attributes, which works even if the sheet name or column name would contain special characters (e.g. "Time Zone") - something that is not possible with `Classic` mode.

Possible values for the `type` attribute on the column element:
- `number` 
- `boolean`
- `string`
- `null`

### Raw mode

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

#### Resulting XML from XLSX with Raw mode

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

To refer to the `Location` column of the second row, the following XPaths can used:
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

### Classic mode

The `Classic` mapping mode maps XLSX in the same way as Rxindi did in version 1.0 through 1.3.
This mode is useful if you have to work with documents that need to remain backwards compatible with older versions, or if you don't want to change the paths to data in existing templates.

For new projects the `Default` or `Raw` mapping mode is recommended.

- The first row (of every sheet) is expected to contain column names
- Following lines contain rows with values
- If cells are typed, this type information is included with the `type` attribute at column level
- The root element in the XML is always `Root` with `type=array`
- Every sheet in the XLSX becomes a `Sheet` XML element with `type=array`
- Every row in the XSLX becomes a `Row` XML element with `type=object`
- Each column with value for every row becomes an XML Element with the name being the name of the column and the value the cell value

#### Resulting XML from XLSX with Classic mode

```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Root type="array">
  <Sheet type="array">
    <Row type="object">
      <Location type="string">New York</Location>
      <Value type="double">2</Value>
      <C type="double">TRUE</C>
      <Time_x0020_Zone type="null"></Time_x0020_Zone>
    </Row>
    <Row type="object">
      <Location type="string">Amsterdam</Location>
      <Value type="double">43</Value>
      <C type="null"></C>
      <Time_x0020_Zone type="string">CET</Time_x0020_Zone>
    </Row>
    <Row type="object">
      <Location type="string">Brussels</Location>
      <Value type="double">4</Value>
      <C type="double">FALSE</C>
      <Time_x0020_Zone type="null"></Time_x0020_Zone>
    </Row>
    <Row type="object">
      <Location type="string">Paris</Location>
      <Value type="double">5</Value>
      <C type="null"></C>
      <Time_x0020_Zone type="null"></Time_x0020_Zone>
    </Row>
    <Row type="object">
      <Location type="string">Berlin</Location>
      <Value type="double">34</Value>
      <C type="null"></C>
      <Time_x0020_Zone type="null"></Time_x0020_Zone>
    </Row>
  </Sheet>
  <Sheet type="array" />
</Root>
```

To refer to the `Location` column of the second row, the following XPath can used:
```
/Root/Sheet[1]/Row[2]/Location
```

Possible values for the `type` attribute on the column element:
- `double` 
- `integer`
- `boolean`
- `datetime`
- `duration`
- `string`
- `null`

---
Copyright ® 2020-2024 Rxcle. All Rights reserved.
