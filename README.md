# INTRODUCTION TO METEOR

### Objectives

- Be able to describe what MeteorJS is
- Build a complete "ToDo" list application with MeteorJS

---

### What is MeteorJS?

From Wikipedia:

``` 
Meteor, or MeteorJS is an open-source JavaScript web application framework written using Node.js. Meteor allows for rapid prototyping and produces cross-platform (web, Android, iOS) code.
```

### Pros and Cons of Using Meteor

* Pros
  * One language on the front and back end
  * Packages that "just work" and don't require hours of configuration
  * Reactive front-end
* Cons
  * Lack of emphasis on testing
  * Lack of "best practices" and common conventions
  * More or less locked into using MongoDB



***Create a new Meteor app using the generator***

``` 
//inside Terminal

meteor create todo-list
```

***Examine the file structure***

``` 
.
└── todo-list
    ├── todo-list.css
    ├── todo-list.html
    └── todo-list.js
```

***Replace the starter HTML code***

``` html
<!-- todo-list.html -->

<head>
  <title>Todo List</title>
</head>

<body>
  <div class="container">
    <header>
      <h1>Todo List</h1>
    </header>
    {{>todoList}}
  </div>
</body>

<template name="todoList">
  <ul>
    {{#each tasks}}
      <li>{{text}}</li>
    {{/each}}
  </ul>
</template>
```

***Replace the starter JS code***

``` javascript
// todo-list.js

if (Meteor.isClient) {
  // This code only runs on the client
  Template.todoList.helpers({
    tasks: [
      { text: "This is task 1" },
      { text: "This is task 2" },
      { text: "This is task 3" }
    ]
  });
}
```

***Replace the starter CSS code***

``` css
/* CSS declarations go here */

body {
  font-family: sans-serif;
  background-color: #315481;
  background-image: linear-gradient(to bottom, #315481, #918e82 100%);
  background-attachment: fixed;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0;
  margin: 0;
  font-size: 14px;
}
.container {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100%;
  background: white;
}
header {
  background: #d2edf4;
  background-image: linear-gradient(to bottom, #d0edf5, #e1e5f0 100%);
  padding: 20px 15px 15px 15px;
  position: relative;
}
#login-buttons {
  display: block;
}
h1 {
  font-size: 1.5em;
  margin: 0;
  margin-bottom: 10px;
  display: inline-block;
  margin-right: 1em;
}
form {
  margin-top: 10px;
  margin-bottom: -10px;
  position: relative;
}
.new-task input {
  box-sizing: border-box;
  padding: 10px 0;
  background: transparent;
  border: none;
  width: 100%;
  padding-right: 80px;
  font-size: 1em;
}
.new-task input:focus {
  outline: 0;
}
ul {
  margin: 0;
  padding: 0;
  background: white;
}
.delete {
  float: right;
  font-weight: bold;
  background: none;
  font-size: 1em;
  border: none;
  position: relative;
}
li {
  position: relative;
  list-style: none;
  padding: 15px;
  border-bottom: #eee solid 1px;
}
li .text {
  margin-left: 10px;
}
li.checked {
  color: #888;
}
li.checked .text {
  text-decoration: line-through;
}
li.private {
  background: #eee;
  border-color: #ddd;
}
header .hide-completed {
  float: right;
}
.toggle-private {
  margin-left: 5px;
}
@media (max-width: 600px) {
  li {
    padding: 12px 15px;
  }
  .search {
    width: 150px;
    clear: both;
  }
  .new-task input {
    padding-bottom: 5px;
  }
}

```

---

***Add code to store/retrieve tasks in a Mongo collection***

By default Meteor uses MongoDB as its datastore. 

``` javascript
// todo-list.js

//Declare a new Mongo collection named 'tasks' that is 
//accessible in a global variable named Tasks

Tasks = new Mongo.Collection("tasks");

//Replace the array of tasks with a function that queries Mongo
//to return all documents in the 'tasks' collection

if (Meteor.isClient) {
  Template.todoList.helpers({
    // tasks: [
    //   { text: "This is task 1" },
    //   { text: "This is task 2" },
    //   { text: "This is task 3" }
    // ]
    tasks: function () {
          return Tasks.find({});
        }
  });
}
```



***Insert/Remove a document into the 'tasks' collection in the browser***

``` javascript
//Inside of your browser's JS console

Tasks.insert({text:"Buy some cold beer"})
//"fWFnypJCWa8XfhtgY"

Tasks.insert({text:"Wow, that went by really fast"})
//"iRh43BvMGj9uoJk9B"

Tasks.remove({_id:"iRh43BvMGj9uoJk9B"})
//1

Tasks.findOne("fWFnypJCWa8XfhtgY")
//Object {_id: "fWFnypJCWa8XfhtgY", text: "Buy some cold beer"}
```

* While convenient, the ability to insert documents into a collection from the browser is not something you'd want to allow in a production environment. If this was allowed in production then anyone visiting your website could make changes to your database. We will remove this ability later on.

***Create a form to add Tasks in the browser***

``` html
<!-- todo-list.html -->

<!-- Add the form element to your existing todoList template -->
<template name="todoList">

  <form class="new-task">
    <input name="taskForm" placeholder="New Task" type="text"/>
  </form>
  ...
  ...
  ...
```

``` javascript
// todo-list.js

if (Meteor.isClient) {
	...
	...
  Template.todoList.events({
    "submit form": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      // Get value from form element
      var inputFromForm = event.target.taskForm.value;

      // Insert a task into the collection
      Tasks.insert({
        text: inputFromForm,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.taskForm.value = "";
    }
  })
}
```

***Sort the posts in reverse order of creation***

``` javascript
// todo-list.js

Template.body.helpers({
    tasks: function () {
      // Show newest tasks at the top
      return Tasks.find({}, {sort: {createdAt: -1}});
    }
  });
```

***Completing and Deleting Tasks***

``` html
<!-- todo-list.html -->

{{#each tasks}}
      <!-- <li>{{text}}</li> -->
      <li class="{{#if this.checked}}checked{{/if}}">
        <button class="delete">&times;</button>

        <input checked="{{this.checked}}" class="toggle-checked" type="checkbox"/>

        <span class="text">{{text}}</span>
      </li>
  {{/each}}
```

``` javascript
Template.todoList.events({
    "submit form": function (event, templ) {
      // Prevent default browser form submit
      event.preventDefault();
      console.log(templ);
      // Get value from form element
      var inputFromForm   = event.target.taskForm.value;

      // Insert a task into the collection
      Tasks.insert({
        text: inputFromForm,
        createdAt: new Date(), // current time
        checked: false
      });

      // Clear form
      event.target.taskForm.value = "";
    },
    // "click .toggle-checked": function () {
    "click [data-action=complete-task]": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },
    // "click .delete": function () {
    "click [data-action=delete-task]": function () {
      Tasks.remove(this._id);
    }
  })
```

In the above code you'll see `"click .toggle-checked"` and `"click .delete"` commented out of the code. Writing your events by tying them to CSS classes or ids is perfectly valid, but a bad idea in the long run.

If for some reason we need to change the CSS stylesheet (e.g., renaming a class) we now ALSO have to change our JavaScript. This is a very bad idea. Consider using the `data-*` HTML attribute instead. I would also advise you to start writing your jQuery this way also.

***Bad***

``` javascript
$('.myClass').on('click', function(){
  console.log('you should avoid doing this');
});
```

***Good***

``` javascript
$("*[data-action='doSomething'"]).on('click', function(){
  console.log('consider doing it this way')
});
```

Read more about the `data-*` attribute on MDN: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes

---



***Session Variables and hiding checked boxes***

``` html
<!-- todo-list.html -->

<template name="todoList">

  <label class="hide-completed" data-action="hide-completed">
    <input type="checkbox" />
    Hide Completed Tasks
  </label>

```



``` javascript
//todo-list.js

if (Meteor.isClient) {
  Session.set('hideCompleted', false);
  ...
  ...
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    }
  });
  
  Template.todoList.events({
    "change [data-action=hide-completed]": function(event) {
      Session.set("hideCompleted", event.target.checked);
    }
  })
}
```

***Adding User Accounts***

Add the accounts-ui and accounts-password packages. The Meteor package repository can be found at https://atmospherejs.com/

``` 
//inside Terminal

meteor add accounts-ui accounts-password
```

Adding accounts-ui and accounts-password will create a "users" collection to your project as well as handle authentication.

``` html
<!-- todo-list.html -->

<template name="todoList">

  <label class="hide-completed">
    <input type="checkbox" /> Hide Completed Tasks
  </label>

  <hr>
  <div>
    {{>loginButtons}}
  </div>
  <hr>
```

The `{{>loginButtons}}` template is provided by accounts-ui.

``` javascript
//inside your browser console

	//WHEN A USER IS SIGNED IN//
Meteor.user()
//Object {_id: "9cs9NBR7LDhnYYEhs", emails: Array[1]}

Meteor.userId()
//"9cs9NBR7LDhnYYEhs"

	//WHEN A USER ISN'T SIGNED IN// 
Meteor.user()
//null
```

Add the accounts package also makes available a number of useful helper methods as seen above.

We can also change the signup fields to request a username instead of an email address.

At the bottom of `todo-list.js` but also within the `Meteor.isClient()` block type:

``` javascript
//todo-list.js

if (Meteor.isClient) {
  ...
  ...
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}
```

We will also add the username of the person who created the task to the task itself.

``` javascript
//todo-list.js

// Insert a task into the collection
Tasks.insert({
  text: inputFromForm,
  createdAt: new Date(), // current time
  checked: false,
  owner: Meteor.userId(),
  username: Meteor.user().username
});
```



***Resetting your database***

The documents in your Tasks collection may have an inconsistent schema. Before going forward let's clear our database of all tasks (and users) and start fresh.

Press CTRL-C to stop your server in terminal and then type:

``` 
meteor reset
```



***Security with Meteor Methods***

Up until this point anyone visiting our site could create, modify or delete tasks from our database. Let's fix that by first removing Meteor's package named `insecure`.

``` javascript
meteor remove insecure
```

If you try to use the app after removing this package, you will notice that none of the inputs or buttons work anymore. This is because all client-side database permissions have been revoked.

We will need to define Meteor methods that interact with the client and the server. The client will request that the database action be performed and the server will either process the request or reject it. Similar to how we defined our Tasks collection OUTSIDE of the `Meteor.isClient()` block we will need to do the same for our `Meteor.methods()` 

``` javascript
//todo-list.js

if (Meteor.isClient) {
  ...
  ...
}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      checked: false,
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  completeTask: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});

```

We also need to replace our explicit database calls from inside `Meteor.isClient()` with calls to the appropriate Meteor method.

``` javascript
//todo-list.js

"submit form": function(event, templ) {
  // Prevent default browser form submit
  event.preventDefault();
  // Get value from form element
  var inputFromForm = event.target.taskForm.value;
  Meteor.call("addTask", inputFromForm);

  // Clear form
  event.target.taskForm.value = "";
},
"click [data-action=complete-task]": function() {
  Meteor.call("completeTask", this._id, ! this.checked);
},
"click [data-action=delete-task]": function() {
  Meteor.call("deleteTask", this._id);
}
	...
	...
});
```

***Publishing and Subscribing to collections***

Publishing all of your data to the client by default is probably a bad idea. For small projects it doesn't matter, but once your database is full of documents it will seriously slow your app down. You may also have a situation in which you only want to display a subset of your data to the client (e.g., protected or private data).

``` 
//inside terminal

meteor remove autopublish
```

Your list of tasks should now be empty.



``` javascript
//todo-list.js

if(Meteor.isServer){
  Meteor.publish("tasks", function(argument){
    return Tasks.find();
  });
}

if (Meteor.isClient) {
  Meteor.subscribe('tasks');
	...
    ...
}
```

***Filtering subscriptions by User Id***

Imagine that we want to further filter our publication/subscription to only return posts created by the user who is currently signed in.

``` javascript
//todo-list.js

if(Meteor.isServer){
  Meteor.publish('tasks', function(userId){
    if (userId) {
      return Tasks.find({owner:userId});
    }
  });
}

if (Meteor.isClient) {

  Tracker.autorun(function(){
    if (Meteor.userId()) {
      console.log('a user is logged in');
    }else{
      console.log('a user is not logged in');
    }
    Meteor.subscribe('tasks', Meteor.userId());
  });
  ...
  ...
}
```

Two new concepts are being introduced in this example, `Tracker.autorun()` and passing a second argument to `Meteor.subscribe()`

***Second argument to Meteor.subscribe()***

The parameter being passed is the userId of the user who is currently logged in. The `Meteor.subscribe()` function receives this userId, which we can use to request a subset of our Tasks collection and not the entire collection.

***Tracker.autorun()***

When a user signs in or signs out we want our view to automatically re-render with either no posts (user isn't signed in) or posts created by the user who is logged in.

`Tracker.autorun()` is a function that runs automatically when any of it's dependencies change. 

Notice that we have placed the `Meteor.subscribe()` function inside of `Tracker.autorun()`. When a user signs in/out `Meteor.userId()` is rerun by Meteor and the value is changed. When this value changes it "bubbles up" to `Tracker.autorun()` that detects `Meteor.userId()` has changed, and in return reruns the `Meteor.subscribe()` function.

---

## RESOURCES

* Official Meteor docs: http://docs.meteor.com/
* Official Meteor forums: https://forums.meteor.com/