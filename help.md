# Rxindi 1.2

Rxindi provides a set of plain-text statements that can turn any InDesign document into a dynamically processable document. Using the Rxindi InDesign Extension you can choose an Excel, CSV, XML or JSON file and, based on its contents process a template document repeatedly each time generating a different output document.

This functionality is sometimes called a "Data Merge" or in more general terms "Document Composition". InDesign has built-in functionality for data merges via the Data Merge tool and via tagging and XML import but the system Rxindi provides is much more powerful; It allows a multitude of data source input formats and allows for true dynamic behavior by providing build in statements for explicit conditional and repeating behavior as well as the notion of reusable Components.

No external tools or complex programming environments are required to add Rxindi statements to an InDesign document. Documents with Rxindi statements are completely portable. There are no special extensions or plugins needed to open, edit or save your document. In order to process the statements you will need the Rxindi extension. Because Rxindi statements are so lightweight, you can easily use Rxindi alongside traditional data merges or additional external tools.

## Data Source

Most statements act upon a so called _Data Source_, which is a data file of which the _structure_ must be relatively static and known upfront. The actual contents within the file can of course be dynamic. Statements will use absolute and relative _paths_ in the Data Source to get content. The actual Data Source file only needs to be loaded when processing a template document. 

The following file formats are supported as data source:

- XML
- JSON
- CSV (Plain text, comma separated)
- XLSX (Excel)

For processing, XML is the _native_ format, other formats are internally converted to an XML representation upon processing. See the Data Source Reference for more information.

## Statements

Selecting content from the Data Source and processing it in a certain way is achieved with Statements which are placed directly inside an InDesign story / text frame. Rxindi supports many different statements, like Output, If, Loop, and more. Every statement is associated with a single character, e.g. `=` is used for the Output statement.

In order to distinguish Rxindi statements from regular content in an InDesign story, they are placed in a _placeholder_. The generic Rxindi placeholder format is `${...}`, where `...` represents the actual statement(s).

Example: `Hello ${=FirstName}, your order is ${=OrderNo}`

## Getting started

### First steps: Output

Content from the Data Source can be placed into a story using the `${=...}` placeholder statement, where `...` is the actual reference to the content in the form of forward slash delimited element names relative to the current context. 

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

To output the first name of the first person in the data source to the document the following reference can be used in a text frame:
`${=Person/FirstName}` which results in `John`. The full details would be inserted as follows: 

```
${=Person/FirstName} ${=Person/LastName} lives at ${=Person/Address}
```

Note that the `Root` element from the Data Source is not specified in the reference. This is because `Root` is the default _context_ and references can be made relative to the current context. It is also possible to use absolute references, in which case the path to the first name becomes `${=/Root/Person/FirstName}`.

> All Data Sources are interpreted as as XML on processing and all data references in Rxindi are XPath (1.0) queries. If the selected Data Source is in a different source format it is automatically and implicitly converted to XML using a standard conversion algorithm.

### Components

Let's abstract the formatting of person details into a _Component_. We do this by creating a new Text Frame on an unused Master Spread (or alternatively on a non-printing layer). A Component is a uniquely named reusable set of content and statements. A text frame can contain multiple Components, but we are just defining one for now. For our example let us create a Component named `PersonDetails`. 

A Component is _defined_ using the `${#PersonDetails}...${.}` statement set. Inside the Text Frame we can format the text as follows: 

```
${#PersonDetails}${=FirstName} ${=LastName} lives at ${=Address}{$.}
```

Now in place where we want the text to appear we simply _reference_ the newly created `PersonDetails` Component. Components are referenced using: `${@...}` where `...` is the Component name. 

In this case the full reference is:

```
${@PersonDetails}
```

> Symbols like `=`, `#` and `@` specify the _Statement Type_ which should always be the first item in a `${...}` placeholder. 

Components typically have a _data need_ which is the context on which data references inside the Component are relative to. In our example we have a data reference to `FirstName`, so we will need a context that provides an element with that name.

If we only reference the Component and specify nothing else then that Component will get the same data context as what is used at the location where we are referencing. In this case that is `/Root`, however in this particular case we want to provide the Component with `/Root/Person` as context so we can directly reference the `FirstName` element inside the Component thereby making the Component independent from any specific parent element in particular.

In order to provide a context, a comma is placed directly after the Component name and the path to the data that should be used as context is specified. In this case we want to provide `Person` (relative to `/Root`) as a context.

```
${@PersonDetails,Person}
```

To make things more interesting let us use a Data Source with some more data:

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

The `Root` element now no longer contains a single child element but rather a _list_ of child elements. This has important implications for the data reference because we now have to specify _which_ `Person` we want to show the details of. Because data references are really _XPath Queries_ there are many ways to select a particular element, but in this case we'll keep it simple and simply specify the numeric index. This is done by appending the element name with `[...]` where `...` is the index number (starting at `1`).

To create two instances of the `PersonDetails` component and fill them with the details of the two persons you can use:

```
${@PersonDetails,Person[1]}
${@PersonDetails,Person[2]}
```

> What would happen if we do not provide a specific index, but keep the reference simply `${@PersonDetails,Person}`?<br/>The XPath query on the data source would match 2 elements in this case, both which are passed to a _single_ Component instance. Inside the Component we match any `FirstName`, which cause 2 elements to be found of which all data is concatenated. In other words the result would be `JohnJane SmithDoe lives at Baker Street 221AMain Street 101`. Not typically something you would want or expect (in most cases).

### Conditionals

If the specified data reference results in no data, it is simply replaced by _nothing_. If a Component reference has a data context reference that results in no data then the Component is not instantiated.

This is the simplest form of conditionality. It relies on the data that was requested being present or not and based on this either places something or nothing.

There are two other scenarios though: 
1. What if you want to decide whether or not to place data or a Component based on an _other_ piece of data than what is to be placed.
2. What if instead of placing nothing when there is no match to the reference, you want to place something else instead.

We will address the first scenario first. Given our Person example, say that a Person may have a title and there is an other element that specifies whether that title should be shown. 

```
${?HasTitle}${=Title}${.} ${=LastName}
```

Let us break this down into its individual elements

| Part           | Statement   | Description |
|----------------|-------------|-------------|
| `${?HasTitle}` | `IF`        | The `?` indicates that this is an `IF` statement. It is immediately followed by an expression, in this case `ShouldShowTitle`. If this evaluates to _true_ then consecutive statements are processed.
| `${=Title}`    | `OUTPUT`    | Output the value of `Title`, but because it directly follows the `IF` statement, this only happens if that evaluated to _true_.
| `${.}`         | `END`       | This ends the _statement block_ started by the `IF` statement. It is necessary here because otherwise _everything_ following the `IF` would be processed only if that evaluated to _true_. We only wanted the `OUTPUT` statement for the Title to be conditional though so that is why we end the block here.
| `${=LastName}` | `OUTPUT`    | Output the value of `LastName`. Because this follows an `END` this statement is _not_ conditional and always processed.

For the second scenario, let us use an example where when the title is present then that title instead of the first name should be shown.

```
${?HasTitle}${=Title}${:}${=FirstName}${.} ${=LastName}
```

This statement set is similar to the previous one, only the new statements will be explained.

| Part            | Statement | Description |
|-----------------|-----------|-------------|
| `${:}`          | `ELSE`    | Ends the _statement block_ started by the `IF` statement and starts a new statement block that only is processed if the preceding `IF` evaluated to _false_.
| `${=FirstName}` | `OUTPUT`  | Output the value of `FirstName`. Because it follows an `ELSE` statement, it will only be processed if the initial `IF` evaluated to _false_.


The example can be also be written as follows:

```
${?HasTitle;=Title;:;=FirstName;.;=string(' ');=LastName}
```

Here the entire `IF`-`OUTPUT`-`ELSE`-`OUTPUT` set is placed in a single placeholder and the statements are separated by semicolons. The result of this is exactly the same as the previous example.

---
## User Interface

The user interface of Rxindi consists of a single InDesign panel which can be opened via `Window > Extensions > Rxindi`. The panel has three sections which can be expanded and collapsed.

- `Prepare`
    - This section has a quick reference guide of all available statements.
    - The `Validate Statements` button performs a quick statement validation on the current document
        - Validation only catches basic syntax errors, it will not detect logical issues (e.g. incorrect paths to data) nor will it detect references to non-existing frames, styles, etc.
- `Process`
    - Here you can (optionally) select a data source file (XML, JSON, CSV, XLSX)
    - The `Process Document` starts the actual processing.
        - In order to process a document it must have been _saved_ and _unmodified_
- `Result`
    - This will show the result of the last Validate or Process action
    - Some errors will include a clickable link that will (attempt to) go to the source statement in the document

The panel menu contains the following items:
- `Help` : Opens a window with the help text
- `Load into XML Structure` : Loads the current data source into InDesign's (XML) Structure
- `Reinitialize` : Forces a reinitalization of Rxindi (Only needed in case of issues)
- `Logs` : Opens the directory that contains the log files

---
# Statement Details 

Rxindi performs its actions based on _statements_ (which are processing instructions) in a document. These statements can be placed in the Story of any Frame.

In order to identify Rxindi statements in inline text and to distinguish them from other content they must be placed in a _placeholder_. Placeholders use a set of character combinations that is unlikely to occur in normal text. For Rxindi the placeholder syntax is `${...}` where the `...` marks the location where the actual statement goes. An example of an actual placeholder with statement is `${=FirstName}`. On processing this statement replaces the placeholder with the contents of a _FirstName_ element.

> The difference between placeholders and statements is important: Placeholders only exist as a _container_ for Rxindi Statements; They perform no logic in itself. For instance `${}` is a valid placeholder which does nothing and `${blabla}` is a valid placeholder which contains an _invalid_ statement.

## Statements
Statements specify the actual processing logic. All statements start with a single symbol that indicates the statement type. This must be the first non whitespace character ...
- following a placeholder opening `${` 
- following a multi-statement separator `;` (more on this later)
- on the first non-empty line
- following a _newline_

Almost all statements also take one or more arguments. The main argument directly follows the statement symbol (whitespace is allowed here). Any additional arguments follow the main argument and are separated by a comma. Note that the _meaning_ (and thus allowed syntax) for arguments depend on the statement type used.

An example of a statement with two arguments:

```
${@PersonDetails,Person[1]}
```

| Part            | Meaning |
|-----------------|---------|
| `${`            | Placeholder start
| `@`             | Statement Symbol (PLACE)
| `PersonDetails` | Main argument (Component)
| `,`             | Argument separator
| `Person[1]`     | Second argument (XPath)
| `}`             | Placeholder end


### Blocks
Certain statements implicitly start a logical scope _Block_ in which all consecutive statements are processed until the Block is closed. Blocks are either closed implicitly or explicitly. For example `IF` (`?`) will start a block. This means that everything following the `IF` statement is placed in a block and only gets processed if the `IF` is _true_. The block is either explicitly closed using an `END` statement (`.`) or implicitly by using an `ELSE` statement; Which will actually start a _new_ implicit block. Additionally the end of an InDesign story also implicitly closes all open blocks. 

### Multiple Statements
Multiple statements can be placed in a single placeholder by separating them with a `;` sign. For example `${=FirstName;=LastName}` will give the same result as `${=FirstName}${=LastName}`.

### Literal Placeholder
If you would want a literal placeholder-like `${...}` character combination in text, which should remain as is and _not_ be interpreted/replaced when processing the document with Rxindi you need to prefix it with a zero-width space (U+200B) or zero width non-joiner (U+200C) character. So `<ZWPS>${...}`. Note that the zero-width space/non-joiner must be placed _immediately_ before the opening `$` character with no other characters or whitespace in between.

## Frame Statements
Statements can also be placed in the Script Label of any frame. In order to process them, the frame name itself must start with or be a single `$` character. You can name frames in the _Layers_ panel of InDesign. Note that the name itself (the text following the `$` character) is not interpreted by Rxindi and it can be anything - the prefix is just a marker that it has statements that need to be processed.

 In the Script Label the statements should appear without a placeholder - the Script Label itself can be seen as the implicit and sole placeholder. The default target for statements in a Script Label is always the frame itself. So using `=SomeData` on the frame, will set the contents of the frame to the value of `SomeData`. This can be overridden by specifying an explicit target name per statement.

Frame Statements are always processed after all Story Statements have been processed and they are processed in the order in which they appear in InDesign _Layers_ panel. Text Frames can have Inline Statements as well as Frame Statements.

---
# Statement Reference

| Name      | S   | Argument(s) | Description |
|-----------|-----|-------------|-------------|
| OUTPUT    | `=` | `1:` XPath Expression `(req)`<br/>`2:` Target name `(opt)` | Output content from the given path in the data source to the document.
| IF        | `?` | `1:` XPath Expression `(req)` | Only include/process following content if expression is _true_.
| LOOP      | `*` | `1:` XPath Expression `(req)`<br/> `or 1:` Number > 0 `(req)` | Repeat following content based on iteration over expression or number
| ELSE      | `:` | `none` | Only include/process following content if preceding IF is false or preceding LOOP has no items.
| COMPONENT | `#` | `1:` Name `(req)`   | Define a Component. Everything following this statement up to the matching END statement is part of the Component. Use PLACE to instantiate.
| PLACE     | `@` | `1:` Component Name `(req)`<br/>`2:` XPath Expression `(opt)` | Instantiate a defined component. Optional path specifies the data context for the Component instance.
| END       | `.` | `none` | End block started by COMPONENT, IF, LOOP or ELSE.
| SCRIPT    | `&` | `1: ` Script name `(req)`<br/>`2:` Target name `(opt)`<br/>`3+`: XPath Expressions `(opt)` | Execute the external script with the given name, optionally passing a specific target and/or the result of any number of XPath Expressions.
| ACTION    | `!` | `1: ` Action type `(req)`<br/>`2:` Target name `(opt)` | Execute an action of the given type, optionally on a specific target.


## OUTPUT (`=`)
Outputs the result of a given XPath expression relative to the current data context.

```
 Syntax: =<xpath>,(<target>)
Example: =/Root/Person/FirstName
         =/Root/Person/Picture,personPicture
```

If only a path is provided then the content is output at the start point of the current placeholder the statement is part of. The optional `<target>` specifies the name of a frame. Frames in InDesign can be given a name in the _Layers_ panel.

- If the target frame is a text frame the existing content is replace by the output content.
- If the target frame is an image frame the output is interpreted as a path to a valid (image) file, which is placed in the image frame
- If the target frame is a QR Code frame, the output is used as new values for the QR Code. 
  - Only QR Codes of type Hyperlink and Text are supported.

If used in a Script Label then the default target frame is the frame on which the Script Label is set. A different target frame can still be specified explicitly.

## IF (`?`)
Include/Process all following content and placeholders only if the given expression resolves to a _truthy_ value. The `IF` statement starts an implicit _Block_, which ends either at the end of the current Story/Script or at the outermost matching `END` (`.`) or `ELSE` (`:`) statement.

```
 Syntax: ?<xpath> 
Example: ?/Root/Person/HasTitle;=Title
```
The following results from the expression are considered a _false_ value:
  - Non existing element or attribute
  - Element or attribute with no or all-whitespace content
  - Element with no child elements
  - Value "0"
  - Value "NaN"
  - Value "false"

All other results are considered a _true_ value.

## LOOP (`*`)
Loop over a collection or numeric value obtained from the given expression. The `LOOP` statement starts an implicit _Block_, which ends either at the end of the current Story/Script or at the outermost matching `END` (`.`) or `ELSE` (`:`) statement. If the collection has no items or the number is equal to or less than `0` then the `LOOP` statement behaves as an `IF` with a _false_ value and the entire following block will be skipped. If an `ELSE` statement is specified this will be executed instead.

```
  Syntax: *<xpath|number> 
 Example: */Root/Person
          *5
```

Note that when looping over an expression result, the data context for the child block is automatically set to the current item iterated over. 

The following special attributes are available for expressions of the child block on the current context:

| Attribute    | Type    | Meaning |
|--------------|---------|---------|
| `@rxc-index` | Number  | The current index, starts at 1 
| `@rxc-count` | Number  | Total number of items in the loop
| `@rxc-first` | Boolean | True only if the current iteration is over the first item
| `@rxc-last`  | Boolean | True only if the current iteration is over the last item

## ELSE (`:`)
Include/Process the following content and placeholders only if the given expression for the nearest matching `IF` or `LOOP` resolved to a _falsey_ value. The `ELSE` statement ends the _Block_ started with `IF` or `LOOP` and starts a new implicit _Block_, which ends either at the end of the current Story/Script or at the outermost matching `END` (`.`).

```
 Syntax: :
Example: ?PreferFirstName;=FirstName;:;=LastName
```
When paired with an `IF`, `ELSE` always uses the inverse condition of whatever is the result of the preceding `IF`. If you want a sub condition, simply use a new `IF` as the first child statement of the `ELSE`.

Using an `ELSE` without a matching preceding `IF` or `LOOP` in the same parent Block will given an error.

## COMPONENT (`#`)
Use `COMPONENT` (`#`) to _define_ a Component, which is a collection of reusable statements and content that is to be instantiated one or multiple times as a single named unit. The Component statement starts an implicit _block_ containing the content and statements directly following the Component statement. As will other _block_ types, the end of the definition is indicated explicitly using `END` (`.`) or implicitly by the end of the current Story or end of the multi-statement Placeholder.

```
 Syntax: #<componentName>
Example: #CompA;=FirstName;.
```

Note that Component definitions in of itself do nothing. You must explicitly reference a component in order for it to be instantiated and processed. Components can be instantiated using `PLACE` (`@`) by providing their name and optionally data context.

Because Component definitions are not part of the normal document content you can define them off-page, e.g. in a text frame on the pasteboard or on an otherwise unused master page. This is however not a strict requirement you can define Components in the same Story as where you reference them if you like. 

Component definitions always must be the top-_level_ statement in a Story. This does not mean they need to be at the _start_ of the Story, but that they cannot be a logical child of e.g. an `IF`, `LOOP` or other `COMPONENT` statement.

The actual order of Component definitions in the document structure does not matter; You can reference a Component which is defined much later in the document.

Components must have a unique name which is case sensitive. Standard statement escape rules apply to Component names as well. For instance it you want a Component name to literally contain `;` you must write it as `\;`.

After a document has been successfully processed, the Component definitions will be _removed_ from the document.

Component definitions can reference other Components using `PLACE` statements. It is however _not_ allowed for Components to reference themselves, nether directly or indirectly (via another Component). Doing so anyway will cause a processing error.

## PLACE (`@`)
Places an instance of the Component with the given name. Optionally providing a new data context path for the Component.

```
 Syntax: @<component>,(<xpath>) 
Example: @PersonDetails
         @PersonDetails,/Root/Person/FirstName
```

Components are defined and named using the `COMPONENT` (`#`) statement. Components may be defined after they are placed in the document structure. Referencing an unknown Component will give an error.

By default Components get the same data context as the current context at the location of the `PLACE` statement. To provide a different context for the Component use a `,` directly after the Component name and supply an XPath expression.

Not that the data context does _not_ control whether or not the Component is placed. Even if the data context resolves to no data, the Component is still placed; The Component itself may have logic to deal with this occurrence (e.g. it may output "No data available"). If you want to prevent a Component from being placed if there is no data then precede it with an `IF` statement.

## END (`.`)
Ends the current (innermost) _block_ that was started either via `IF`, `ELSE`, `LOOP` or `COMPONENT`. This statement expects no arguments. If there is no block to close at the position of this statement then an error is given.

```
 Syntax: .
Example: ?IsTrue;=FirstName;.
```

`END` statements are not required at the very end of a multi-statement placeholder because all blocks opened in the same multi-statement placeholder are automatically closed (you can included them anyway if you like).

## SCRIPT (`&`)
Executes an external script.

```
 Syntax: &<name>,(<target>),(<params>...)
Example: &AddPages
         &PlacePicture,pictureFrame,string('Alt text')
```

Scripts must be in the CC ExtendScript format and use (only) statements that are compatible with the version of InDesign being used to process the document. The script must have either the `.js` or `.jsx` extension and be located in the same directory as the InDesign document being processed, or in a `scripts` subfolder below the document being processed. Global scripts are _not_ considered. Note that when referencing the script the extension must be omitted and the casing must match that of the script filename exactly.

From within the script, the global ExtendScript variables `app` and `document` are not available. Instead the `scriptArgs` object contains properties that are relevant to the context in which the scripts executes.

| Property   | Type                   | Description |
|------------|------------------------|-------------|
| `document` | `Document`             | The InDesign Document currently being processed. Use `document.parent` to get the `Application` object
| `name`     | `string`               | Name of the current script |
| `context`  | `XML`                  | Current XML context
| `target`   | `InsertionPoint` or `Frame` | Target for current script. For scripts called from within a Story, without an explicit target this will be an `InsertionPoint`. When called with a target frame name this will be a `TextFrame` or `SplineItem` (typically a `Rectangle`).
| `params`   | `Array`                | Array of parameters passed to the script.

To halt further execution of processing from within a script, either return the `boolean` value `false` or `throw` an `Error` object.

The third and further arguments to the `SCRIPT` statement are interpreted as XPath and are evaluated against the current data context. Its results are passed as the `params` array property on the `scriptArgs` to the script. Note that in order to pass literal (constant) text, it must be made into a valid XPath statement first, so pass it as: `string('static text')`. Numeric values can be passed directly. To specify parameters without specifying a different target, use the target name `<script>,.,<param>` or just an empty target: `<script>,,<param>`.

**IMPORTANT** Scripts are in no way limited to allowed actions within the document. This provides a lot of freedom and flexibility. However this also means that Rxindi cannot track the changes made by a script to a document. Certain changes like removal of items or changes to _Notes_ (which are used by Rxindi during processing) may cause statements following a script to fail.

## ACTION (`!`)
Executes a special action, typically on a _frame_ target - the current frame being the default. The first (and required) argument specifies the action type to execute. Note that an ACTION by itself is always executed, it has no condition of its own. In order to make it conditional (or run multiple times) place it after an `IF` or `LOOP` statement.

```
 Syntax: !<type>(,target)
Example: !hide
         !state:Big
         !pstyle:Heading
```

Below is a list of all available actions. Note that some actions take a parameter which is separated from the action type using a colon `:`. Do not confuse the action parameter (colon) with statement arguments (separated by a comma) or statement separators in a placeholder (semicolon). Action type names are given here in all lowercase, but they are case-insensitive.

| Action Type     | Description |
|-----------------|-------------|
| `hide`          | Hides the frame.
| `show`          | Shows the frame if hidden (un-hide).
| `state:<name>`  | Apply the State with the specified name to the frame. The target frame must be a a multi-state object.
| `ostyle:<name>` | Apply the Object Style with the specified name to the target frame.
| `cstyle:<name>` | Apply the Character Style with the specified name to the target.
| `pstyle:<name>` | Apply the Paragraph Style with the specified name to the target.

---
# Data Source Reference 

Data Sources can be in the XML, JSON, CSV or XLSX (Excel) format. Non-XML data sources are converted to an XML representation using the rules specified in this chapter. When referring to content in the Data Source, XPath (1.0) syntax is used, regardless of the original Data Source format.

## XML

In case the Data Source is in the XML format it is used as-is without any conversion. 

## JSON

JSON data sources are transformed into an XML representation. 

- Every property becomes an XML element
    - The name of the property becomes the name of the element
    - Non-allowed characters for XML in the property name are escaped 
- Every value becomes content of an XML element. 
- Every element is annotated with the JSON value type using the `type` attribute. 
- The root XML element is an element is always named `Root` 
- Array item elements are always named `Item`

Example JSON:
```json
{
    "text": "Hello World",
    "object": {
        "text2": "",
        "null": null
    },
    "bool": true,
    "number": 1.23,
    "date": "2017-01-03 23:54:18",
    "null": null,
    "object2": {
        "name": "childObject",
        "fakeNum": "1.2",
        "num.with.points": -9
    },
    "array": [
        "firstItem",
        "secondItem"
    ],
    "": null
}
```

Becomes:
```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Root type="object">
  <text type="string">Hello World</text>
  <object type="object">
    <text2 type="string"></text2>
    <null type="null"></null>
  </object>
  <bool type="boolean">true</bool>
  <number type="double">1.23</number>
  <date type="string">2017-01-03 23:54:18</date>
  <null type="null"></null>
  <object2 type="object">
    <name type="string">childObject</name>
    <fakeNum type="string">1.2</fakeNum>
    <num.with.points type="double">-9</num.with.points>
  </object2>
  <array type="array">
    <Item type="string">firstItem</Item>
    <Item type="string">secondItem</Item>
  </array>
  <_ type="null"></_>
</Root>
```

To refer to the `name` property of `object2` ("childObject") the following XPath is used `/Root/object2/name`

## CSV

CSV (Comma separated values) data sources are plain text tabular files. They are transformed into an XML representation. 

- The first line is expected to contain column names
- Following lines contain rows with values
- No value type information can be inferred from CSV so everything is treated as type string
- The root element in the XML is always `Root` with `type=array`
- Every row in the CSV becomes a `Row` XML element with `type=object`
- Each column with value for every row becomes an XML Element with the name being the name of the column and the value the cell value

Example CSV:
```CSV
Name;Value
New York;1234
Las Vegas;196
```

Becomes:
```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Root type="array">
  <Row type="object">
    <Name type="string">New York</Name>
    <Value type="string">1234</Value>
  </Row>
  <Row type="object">
    <Name type="string">Las Vegas</Name>
    <Value type="string">196</Value>
  </Row>
</Root>
```

To refer to the `Value` of the second row ("196") the following XPath is used `/Root/Row[2]/Value`

## XLSX (Excel)

XLSX (Excel) data sources are spreadsheet documents, they can contain multiple worksheets and typed and formatted values. They are transformed into an XML representation. 

- The first row (of every sheet) is expected to contain column names and
- Following lines contain rows with values
- If cells are typed, this type information is included
- The root element in the XML is always `Root` with `type=array`
- Every sheet in the XLSX becomes a `Sheet` XML element with `type=array`
- Every row in the XSLX becomes a `Row` XML element with `type=object`
- Each column with value for every row becomes an XML Element with the name being the name of the column and the value the cell value

Example XLSX:

| Name      | Value |
|-----------|-------|
| New York  | 1234  |
| Las Vegas | 196   |


Becomes:
```XML
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<Root type="array">
  <Sheet type="array">
    <Row type="object">
        <Name type="string">New York</Name>
        <Value type="number">1234</Value>
    </Row>
    <Row type="object">
        <Name type="string">Las Vegas</Name>
        <Value type="number">196</Value>
    </Row>
  </Sheet>
</Root>
```

To refer to the `Value` of the second row ("196") the following XPath is used `/Root/Sheet/Row[2]/Value`

---
# Version history

| Version | Changes |
|---------|---------|
| 1.2.0   | - Major internal rewrite, resulting in much better/expected results and error handling<br/>- Validate target names before actual processing<br/>- Better handling of decimals in XLSX input |
| 1.1.1   | - Minor internal improvements |
| 1.1.0   | + InDesign 2023 support<br/>+ Apple Silicon support<br/>+ Load into XML Structure<br/>- Fix issues in manual and error messages<br/>- Restore userInteractionLevel after processing |
| 1.0.2   | + InDesign 2022 support |
| 1.0.1   | + InDesign 2021 support |
| 1.0.0   | + Initial release       |

---
 Copyright ® 2020-2023 Rxcle. All Rights reserved.