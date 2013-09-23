// Retrieve database name from url, given naming convention in CouchDB
var DATABASE = "/" + window.location.href.split("/")[3];

// Get tasks from database
function getAndShowTasks() {
    $.ajax({
        url: DATABASE + "/_design/tasks/_view/tasks",
        success: function (data){
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
        if(task.rightorleft=="left") {
            lhtml += "<li>" + task.task + "</li>";
        } else {
            rhtml += "<li>" + task.task + "</li>";
        }
    });
    document.getElementById("left-list").innerHTML = lhtml;
    document.getElementById("right-list").innerHTML = rhtml;
}

// Add task to (right-screen) todo list
function addTask() {
    var desc = prompt("Enter a task description");
    if (desc) {
        var task = {
            "task": desc,
            "leftorright": "left"
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
