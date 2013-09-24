Two-Pane To-do List CouchApp
============================

This is a simple web-based to-do list application for organizing simple
bullet-point lists of things I have to to do.  The page can be viewed and
updated from any machine with internet connection and an HTML5 browser.

It has two panes - a left and right.  Could be used in whatever sense you want,
but I like to put "things I'll do today" on the left and "for later" on the
right.

There's a button for creating a task, which automatically gets thrown on the
left side by default.  Then drag-and-drop functionality by grabbing and
dragging the bullet points allows for moving tasks to/from left/right panes.
Drag to the trash icon to delete when tasks are done.

Under The Hood
--------------

Under the hood, the main functions here are in Javascript, making use of the
ajax communications with a CouchDB server.  The file todo.js has most of that.
The index.html is what loads, but it doesn't include any task elements, those
are inserted by functions in todo.js.
