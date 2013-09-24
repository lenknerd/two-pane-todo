// Retrieve database name from url, given naming convention in CouchDB
var DATABASE = "/" + window.location.href.split("/")[3];

// Get tasks from database
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
    // Search out task with right id
}

// Function for what happens at a drop in another list
function dropInList(ev,lorr)
{
    ev.preventDefault();
    // Switch the leftorright value to ev.target's left/rightness
    //     in db corresponding to dragged guy
    // Call showTasks
}

// Add task to (right-screen) todo list
function addTask() {
    var d = new Date();
    var t = d.getTime().toString();
    var desc = prompt("Enter a task description");
    if (desc) {
        var task = {
            "task": desc,
            "leftorright": "left",
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
