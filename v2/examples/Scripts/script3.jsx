/* This script is written as ExtendScript. */

// Note, you _must_ use `script.document`, the global `document` variable is not available in this context.
var pagePrefs = script.document.pages[0].marginPreferences;
pagePrefs.top = 1;
pagePrefs.left = 2;
pagePrefs.bottom = 3;
pagePrefs.right = 4;

script.document.documentPreferences.marginGuideColor = [0, 255, 0];