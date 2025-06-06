/* This script is written as ExtendScript.

The `script` object is a global object that contains the following properties:
- document: The InDesign document object.
- datasource: File path to the data source.
- parameter: The global processing parameter.
- name: The name of the script.
- target: The target object for the script: InsertionPoint or SplineItem.
- args: The arguments passed to the script.
*/

script.target.contents = "Hello World from " + script.name;

return "This will be logged in the logfile";