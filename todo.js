/*  Javascript for generating simple to-do list using CouchDB.
 *  On index.html load, the last function is called to set up CouchDB database
 *  if first use, then getAndShowTasks() pulls data from there into html.
 *  Rest of functions deal with drag and drop user interactions for adding or
 *  moving or deleting tasks.
 *
 *  Author: David Lenkner.
 *  Date: September 2013 */

// Retrieve database name from url, given naming convention in CouchDB
var DATABASE = "/" + window.location.href.split("/")[3];

// Get tasks from database, possible call show function
function getAndShowTasks() {
    $.ajax({
        url: DATABASE + "/_design/tasks/_view/tasks",
        success: function (data) {
            var view = JSON.parse(data);
            var tasks = [];
            $(view.rows).each( function (index, item) {
                tasks.push(item.value);
            });
            showTasks(tasks);
        }
    });
}

// Show tasks
function showTasks(tasks) {
    // Append all the tasks to one or another html lists
    lhtml = "";
    rhtml = "";
    $(tasks).each( function (index, task) {
        if(task.leftorright == "left") {
            lhtml += "<li draggable=\"true\" ondragstart=\"drag(event)\"";
            lhtml += " id=\"" + task.t + "\">" + task.task + "</li>";
        } else {
            rhtml += "<li draggable=\"true\" ondragstart=\"drag(event)\"";
            rhtml += " id=\"" + task.t + "\">" + task.task + "</li>";
        }
    });
    document.getElementById("left-list").innerHTML = lhtml;
    document.getElementById("right-list").innerHTML = rhtml;
    // In those elements, store couchdb locale for use in dragging events
    $(tasks).each( function (index, task) {
        $("#" + task.t).data('couchid',task._id);
        $("#" + task.t).data('couchrev',task._rev);
    });
}

// What happens when you start dragging a task
function drag(ev)
{
    ev.dataTransfer.setData("Text",ev.target.id);
}

// A function that allows dropping
function allowDrop(ev)
{
    ev.preventDefault();
}

// Function for what happens at a drop in the recycling bin
function dropInRecyc(ev)
{
    ev.preventDefault();
    var time_of_movingtask = ev.dataTransfer.getData("Text");
    var i = $('#' + time_of_movingtask).data('couchid');
    var r = $('#' + time_of_movingtask).data('couchrev');
    deleteInternal(i,r,true);
}

// Function to delete task from database, re-makes html if desired
function deleteInternal(taskid, taskrev, show)
{
    var succfunc = function() { };
    if(show) {
        succfunc = getAndShowTasks;
    }
    $.ajax({
        type: "DELETE",
        url: DATABASE + "/" + taskid + "?rev=" + taskrev,
        success: succfunc
    });
}

// Function for what happens when drag task list to list
function dropInList(ev,lorr)
{
    ev.preventDefault();
    var time_of_movingtask = ev.dataTransfer.getData("Text");
    var descrip = document.getElementById(time_of_movingtask).innerHTML;
    // Delete the task as is... 
    var i = $('#' + time_of_movingtask).data('couchid');
    var r = $('#' + time_of_movingtask).data('couchrev');
    deleteInternal(i,r,false);
    // And then add one of same descript to specified left/rightness
    addTaskInternalAndShow(descrip, lorr);
}

// Add task to one of the todo lists (left or right one)
function addTask(leftorright) {
    var desc = prompt("Enter a task description");
    if (desc) {
        addTaskInternalAndShow(desc, "left");
    }
}

// Used above, and internally in the move left-right function
function addTaskInternalAndShow(description, lorr)
{
    var d = new Date();
    var t = d.getTime().toString();
    var task = {
        "task": description,
        "leftorright": lorr,
        "t": t
    };
    $.ajax({
        type: "POST",
        url: DATABASE,
        contentType: "application/json",
        data: JSON.stringify(task),
        success: function () {
            getAndShowTasks();
        }
    });
}

// Create view into CouchDB dbase -- run at page load, fails if already exists
function createView() {
    var view = {
       "language": "javascript",
       "views": {
           "tasks": {
               "map": "function(doc) {if (doc.task) {emit(doc.task, doc);}}"
           }
       }
    }
    $.ajax({
        type: "PUT",
        url: DATABASE + "/_design/tasks",
        contentType: "application/json",
        data: JSON.stringify(view)
    });
}
