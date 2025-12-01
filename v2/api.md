# Rxindi API

Most Rxindi functions that are available from the Rxindi panel UI can also be invoked as commands through the standard InDesign Plug-ins panel and via scripting.

The plugins panel can be activated via the `Plug-ins > Plugins Panel` menu and then expanding the `Rxindi` item. You can invoke a command by clicking on it. The table below lists the commands as they appear in the Plug-ins panel and their associated scripting names. Some commands take optional arguments; these can only be specified when the command is invoked via a script.

## Commands

| Command                 | Scripting Name         | Arguments | Description                                                         |
| ----------------------- | ---------------------- | --------- | ------------------------------------------------------------------- |
| Help                    | `help`                 | -         | Opens the manual                                                    |
| Load into XML Structure | `loadIntoXmlStructure` | Y         | Loads the data source into the XML Structure of the active document |
| Logs                    | `logs`                 | -         | Opens the folder that contains the log files                        |
| Process Document        | `process`              | Y         | Process the current document                                        |
| Reinitialize            | `reinitialize`         | -         | Reset Rxindi, clearing all settings                                 |
| Validate Statements     | `validate`             | Y         | Validate Rxindi statements in the current document                  |
| Rxindi                  | -                      | -         | Shows the Rxindi panel                                              |

## Arguments

In scripting, the commands `loadIntoXmlStructure`, `process`, and `validate` accept an object that contains optional values for one or more of the properties in the following table:

| Argument         | Type/Values          | Description                                                                   | Default      |
| ---------------- | -------------------- | ----------------------------------------------------------------------------- | ------------ |
| `datasource`     | `string` (file path) | Full path to the Data Source to use                                           | `""` (empty) |
| `parameter`      | `string`             | Parameter value to use                                                        | `""` (empty) |
| `compatVersion`  | `0`, `200`, `105`    | Compatibility version to use: 0=Latest, 200=v2.0, 105=v1.5                    | `0`          |
| `mappingMode`    | `1`, `2`, `3`        | Mapping mode to use: 1=Classic, 2=Default, 3=Raw                              | `2`          |
| `documentId`     | `number`             | ID of the template InDesign document to use, 0=Active document                | `0`          |
| `allowModified`  | `boolean`            | Set to `true` to allow processing of a template document with unsaved changes | `false`      |
| `finalizeScript` | `string` (file path) | Full path to a script to call when the action completed                       | `""` (empty) |
| `finalizeAlways` | `boolean`            | Set to `true` to run the `finalizeScript` always, even in case of failure     | `false`      |
| `finalizeArg`    | `string`             | Custom argument that is passed verbatim to the `finalizeScript`               | `""` (empty) |

For all arguments, absence or a value of `undefined` means "keep current value" and `null` or an invalid value means "reset to default".

> Note that command and argument names are case-sensitive!

## Invoking through script

InDesign supports various scripting languages, the most popular of which are: ExtendScript (jsx), AppleScript (Mac only), and the newer "UXP Script" (idjs). Rxindi commands are exposed via UXP Script only, though you can also execute them indirectly by embedding UXP Script fragments in ExtendScript or AppleScript by using InDesign's `doScript` function.

Below is a UXP Script example that executes the `process` command, using a path to an XML file, a parameter, and Raw mapping mode.

```js
const pluginManager = require("uxp").pluginManager;
const plugin = Array.from(pluginManager.plugins).find(p => p.name === "Rxindi");
if (plugin) {
  plugin.invokeCommand("process", { datasource: "c:\\docs\\mydoc.xml", parameter: "Hello", mappingMode: 3 });
}
```

Note that although the `invokeCommand` UXP function returns a `Promise`, there is no guarantee that the invoked command is done executing when the promise is resolved. If you want to execute additional script code when processing is done, set the `finalizeScript` argument on the API to the path to a script to execute when processing is done.

## Indirect execution

Below is an example of how to invoke the command from ExtendScript. A similar approach can be taken from e.g. AppleScript.

```js
app.doScript(
'const pluginManager = require("uxp").pluginManager;' +
'const plugin = Array.from(pluginManager.plugins).find(p => p.name === "Rxindi");' +
'if (plugin) {' +
'  plugin.invokeCommand("process", { dataSource: "c:\\docs\\mydoc.xml", parameter: "Hello", mappingMode: 3 });' +
'}', ScriptLanguage.UXPSCRIPT);
```

## Script Callback

The `finalizeScript` argument can be set to the path to a script file. This script is run as the very last step for the given command (e.g. processing). 

- It must be written either in ExtendScript (.jsx/.js) or UXP Script (.idjs) format - AppleScript (or Visual Basic) are not supported
- The path provided here _must_ be an absolute path - relative paths are not supported
  
By default, the `finalizeScript` is only executed when the base action succeeded. By setting the `finalizeAlways` argument to `true` the script is _always_ executed, even if the base action failed. 
The following arguments are automatically supplied to this script. Note that these arguments are passed _by index_ only, the indicated name is for descriptive purposes only. 

| Argument # | Name        | Type/Values | Description                                                                                       |
| ---------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `0`        | `isSuccess` | `boolean`   | Indicates if the command that invoked the script was completed successfully                       |
| `1`        | `message`   | `string`    | Message generated by Rxindi, typically only set if `isSuccess` is `false`, empty string otherwise |
| `2`        | `customArg` | `string`    | Custom script argument consisting of the value of `finalizeArg`, if set                           |

You can obtain the value of these arguments within the script as follows:

```js
// In UXP Script: 
const scriptArgs = require('uxp').script.args;
const isSuccess = scriptArgs[0];
const customArg = scriptArgs[2];

// In ExtendScript:
var isSuccess = arguments[0];
var customArg = arguments[2];
```

The custom argument can only be a single string value. If you want to pass multiple values, add and split on separators, or apply e.g. JSON encoding.

The return value of the script is _ignored_. Throw an error to indicate failure. The error message of the error will be shown in the Rxindi panel. In all other cases, success is assumed.

## Classic API

Rxindi v1.5 offers a different, more limited, API, which is exposed via ExtendScript using the `ExternalObject` mechanism. This API is **not supported** in Rxindi v2.0, not even in v1.5 compatibility mode.

---
Copyright ® 2020-2025 Rxcle. All Rights Reserved.
