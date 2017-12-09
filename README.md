# anaran-jetpack-content
Cross-platform Settings and Add-on UI elements used by 
https://addons.mozilla.org/en-US/firefox/user/anar1/

Settings and UI Elements have been adjusted for use with webextensions.

Icon placement for devices without touch events is now implemented by mouse events instead of drag and drop events which are not supported on Android and are not a good fit for this use case as there is no dataTransfer involved.

# Initial Motivation

This approach was created between a rock and a hard place (no, not on 67P).

* Inline options don't work on Android
* Context menus support for Android is not integrated/supported.
* Context menu is also mutually exclusive with text selection on Android.
* Some sites, like MDN for History and Edit Page, use a context menu which makes text selection impossible on Android.
* Many add-on UI elements are [not available on Android](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Mobile_development#Module_Compatibility).

