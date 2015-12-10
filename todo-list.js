Tasks = new Mongo.Collection("tasks");

if(Meteor.isServer){
  Meteor.publish('tasks', function(userId){
    if (userId) {
      return Tasks.find({owner:userId});
    }
  });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Tracker.autorun(function(){
    if (Meteor.userId()) {
      console.log('a user is logged in');
    }else{
      console.log('a user is not logged in');
    }
    Meteor.subscribe('tasks', Meteor.userId());
  });

  Meteor.subscribe('tasks');

  Session.set('hideCompleted', false);
  Template.todoList.helpers({
    // tasks: [
    //   { text: "This is task 1" },
    //   { text: "This is task 2" },
    //   { text: "This is task 3" }
    // ]
    tasks: function() {
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
    "submit form": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      // Get value from form element
      var inputFromForm = event.target.taskForm.value;

      // Insert a task into the collection
      Meteor.call("addTask", inputFromForm);

      // Clear form
      event.target.taskForm.value = "";
    },
    // "click .toggle-checked": function () {
    "click [data-action=complete-task]": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("completeTask", this._id, ! this.checked);
    },
    // "click .delete": function () {
    "click [data-action=delete-task]": function () {
      Meteor.call("deleteTask", this._id);
    },
    "change [data-action=hide-completed]": function(event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
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
