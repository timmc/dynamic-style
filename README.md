While working on a project for school, I discovered that there was no easy
way to add, modify, and remove global CSS. There are three well-known ways
of dynamically modifying the CSS in a page:

1. Set the style of individual named elements,
2. Set the class of the <body> element to invoke CSS predefined for the
   circumstance, or
3. Add or remove links to existing stylesheets.

None of these address the issue of adding arbitrary global CSS at an
arbitrary time. After several attempts (including modifying the contents of
a text node inside a &lt;style> node), I found a working solution using
data: protocol URLs in &lt;link> nodes. So here, for your coding pleasure,
is DynamicStyle.js.

The DynamicStyle library is ridiculously easy to use, since initialization
and cleanup are handled automatically. Here are some sample calls to the
DynamicStyle library:

    DynamicStyle.setStyle('search-hilite', 'span.search-1 { background-color: yellow; }');
    DynamicStyle.getStyle('search-hilite');
    DynamicStyle.removeStyle('search-hilite');

The code is available under both the Creative Commons Attribution Share-Alike
license and the LGPL.
