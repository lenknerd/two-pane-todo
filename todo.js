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
    // Make list items for all the tasks
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
    $.ajax({
        type: "DELETE",
        url: DATABASE + "/" + i + "?rev=" + r,
        success: function () {
            getAndShowTasks();
        }
     });
}

// Function for what happens at a drop in another list
function dropInList(ev,lorr)
{
    ev.preventDefault();
    // Switch the leftorright value to ev.target's left/rightness
    //     in db corresponding to dragged guy
    // Call showTasks
}

// Add task to one of the todo lists (left or right one)
function addTask(leftorright) {
    var desc = prompt("Enter a task description");
    if (desc) {
        addTaskInternalAndShow(desc, "left");
    }
}

// Used above, and internally in the move left-right function
function addTaskInternalAndShow(description, lorl)
{
    var d = new Date();
    var t = d.getTime().toString();
    var task = {
        "task": description,
        "leftorright": lorl,
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
