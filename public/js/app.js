const colors = ['green', 'purple', 'orange', 'red'];
const error_message = "<img src='assets/error.jpg' style='object-fit: cover;display: block;margin-left: auto;margin-right: auto;'>";
var userexpenses = [];
var logindata = null, expenses = null, filteredCategories = null, filteredProject = null;
var projectdata = null, categorydata = null, filterPicker = null, selected_index = null;
var user_emails = null, vcategory, vclientname, vprojectname;
var isUser = null, isAdmin = null, isManager = null;
var bContinue = false;

var app = new Framework7({
  picker: {
    toolbarCloseText: "Close"
  },
  swipeout: {
    noFollow: true,
    removeElements: false
  },
on: {
  init: function () {
  console.log('App initialized');
},
pageInit: function (page) {
if(page.name=='expenses'){
  bContinue = false;
  if(selected_index != null && filteredCategories != null && filteredProject != null && expenses != null){
    let filteredExpenses = null;
    let type = null;
    let value = document.getElementById("filter").value;
    switch(value)
    {
      case "Categories":
      filteredExpenses = expenses.filter(item => item.Category === filteredCategories[selected_index].name);
      type = "category";
      break;
      case "Project Name":
      filteredExpenses = expenses.filter(item => item.Client_Project === filteredProject[selected_index].name);
      type = "projectname";
      break;
      default:
      console.error("Unable to filter results, no definition for: " + value);
      break;
    }
    
    if(filteredExpenses != null){
      for(var i = 0; i < filteredExpenses.length; i++){
        let title = null;
        let subtitle = null;
        switch(type){
          case "category":
            title = filteredExpenses[i].Category;
            subtitle = filteredExpenses[i].Client_Project;
          break;
          case "projectname":
            title = filteredExpenses[i].Client_Project;
            subtitle = filteredExpenses[i].Category;
          break;
        }
        let randomcolor = colors[Math.floor(Math.random() * colors.length)];
        document.getElementById("expenses").innerHTML += "<a href='#' onclick=" + "updateExpense(" + filteredExpenses[i].Report_ID + "," + "'" + filteredExpenses[i].Date_of_Submission + "'" + "," + "'" + filteredExpenses[i].Reciept + "'" + "," + "'" + escape(filteredExpenses[i].Expense_Desc) + "'" + "," + "'" + escape(filteredExpenses[i].Category) + "'" + "," + "'" + escape(filteredExpenses[i].Client_Name) + "'" + "," + "'" + escape(filteredExpenses[i].Client_Project) + "'" + "," + "'" + escape(filteredExpenses[i].Payment_Method) + "'" + "," + "'" + filteredExpenses[i].Amount + "'" + ")><div class='card theme-" + randomcolor + "' style='margin-top: 50px'><div class='card__part card__part-2 card__hover'><div class='card__part__side m--back'><div class='card__part__inner card__face' style='box-shadow: 5px 10px 8px #888888; height: 100px;'><div class='card__face__colored-side'></div><div style='float: right;position: relative;top: 0px;padding-right: 10px;' class='card__greytext'><span>" + filteredExpenses[i].Amount + "</span><i class='f7-icons' style='position: absolute;top: 25px;font-size: 20px;padding-left: 5px'>chevron_right</i></div><h3 class='card__face__price ng-binding text-limited'>" + title + "</h3><h4 class='card__greytext' style='font-weight: normal;margin: auto;margin-top: 15px;margin-bottom: 15px;'>" + filteredExpenses[i].Client_Name + ", " + subtitle + "</h4><p class='card__greytext' style='width: 80%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;'>" + filteredExpenses[i].Expense_Desc + "</p><div class='card__greytext' style='font-size: 15px'><i class='f7-icons' style='font-size: 18px; padding-right: 10px'>time</i>" + filteredExpenses[i].Status + "</div></div></div></div></div></a>";
      }
    }
    selected_index = null;
  }
}
else if(page.name=='categories'){
    updateStatusBar();
    fetchExpenses(logindata[0].id);
    filterPicker = app.picker.create({
    inputEl: '#filter',
    cols: [
      {
        textAlign: 'center',
        values: ['Categories', 'Project Name'],
        displayValues: ['Categories', 'Project Name']
      }
    ],
    on: {
    change: function (picker, values, displayValues) {
      if(document.getElementById("filter").value != displayValues){
        const column = picker.cols[0];
        switch(displayValues[0]){
          case column.values[0]:
          // First column selected run code here...
          displayCategories(filteredCategories);
          break;
          case column.values[1]:
          // Second column selected run code here...
          displayCategories(filteredProject);
          break;
        }
          filterPicker.close();
      }
    }
  },
});
app.preloader.hide();
}
else if(page.name == 'addexpenses'){
  bContinue = true;
  if(projectdata == null || categorydata == null){
     fetchFormData();
   }
   else{
    displayFormData();
  }

  // Preview Image
  window.preview = function (input) {
    if (input.files && input.files[0]) {
      $("#previewImg").empty();
        $(input.files).each(function () {
            var reader = new FileReader();
            reader.readAsDataURL(this);
            reader.onload = function (e) {
                $("#previewImg").append("<img src='" + e.target.result + "' style='width:150px;padding:15px'>");
            }
        });
    }
}

  // Handle Image Upload Here...
  $('#uploadForm').submit(function() {
          
    var $fileUpload = $("input[type='file']");
             if (parseInt($fileUpload.get(0).files.length) > 3){
                app.dialog.alert("You can only upload a maximum of 3 images!", "InfiniTech 👊");
             }
             else {
              app.preloader.show();
              $(this).ajaxSubmit({
              error: function(xhr) {
              app.preloader.hide();
              console.error('Error: ' + xhr.status);
              app.dialog.alert("Uh oh! Something went terribly wrong!! please try again later.", "Sorry 😭😭");
              },
              success: function() {
              addExpenseReport();
              }
              });
             }

return false;
  }); 
}
else if(page.name == 'admin'){
  updateStatusBar();
  fetchAdminExpenses(logindata[0].id);
  if(document.getElementsByClassName("drawer-list-item")[1].childNodes[2].innerText == "Add Expense") {document.getElementsByClassName("drawer-list-item")[1].remove();}
  document.getElementsByClassName("drawer-list-item")[0].href = "/admin/";
  app.preloader.hide();
  console.log("admin page loaded!");
}
else if(page.name == 'manager'){
  updateStatusBar();
  fetchUserEmails();
  if(document.getElementsByClassName("drawer-list-item")[1].childNodes[2].innerText == "Add Expense") {document.getElementsByClassName("drawer-list-item")[1].remove();}
  document.getElementsByClassName("drawer-list-item")[0].href = "/manager/";
  fetchFormData();
  app.preloader.hide();
  console.log("manager page loaded!");
  
}
else if(page.name == 'profile'){
    let type = null;
    if(isUser){
    type = "user";
    }else if(isAdmin) {
    type = "admin";
    }else if(isManager) {
    type = "manager"}
    
    // Update the form
    document.getElementById("myuser").value = logindata[0].name;
    document.getElementById("mypass").value = logindata[0].pass;
    document.getElementById("myemail").value = logindata[0].email;
    document.getElementById("mygoogle").value = logindata[0].gid;
    document.getElementById("myfacebook").value = logindata[0].fid;
    document.getElementById("table").value = type;
    document.getElementById("user_col").value = type + "_username";
    document.getElementById("password_col").value = type + "_password";
    document.getElementById("google_col").value = type + "_google_id";
    document.getElementById("facebook_col").value = type + "_facebook_id";
    document.getElementById("id_col").value = type + "_id";
    document.getElementById("id").value = logindata[0].id;
    document.getElementById("email_col").value = type + "_email";

      // Wait for Form Submission...
    $('#updateProfile').submit(function() {
          // Convert form data into JSON
          var formData = app.form.convertToData('#updateProfile');
          // Validate at least one field has changed
          if(logindata[0].name != formData.username || logindata[0].pass != formData.password || logindata[0].email != formData.email || logindata[0].gid != formData.google || logindata[0].fid != formData.facebook) {
          // Send to the server
          formData.id = parseInt(formData.id);
          app.request.postJSON('https://stormy-coast-58891.herokuapp.com/profile', formData);
          // Update Front End
          logindata[0].name = formData.username;
          logindata[0].pass = formData.password;
          logindata[0].email = formData.email;
          logindata[0].gid = formData.google;
          logindata[0].fid = formData.facebook;
          // Display Success
          app.dialog.alert("New profile was saved successfully.", "Success! 😄👏");
          let home = document.getElementsByClassName("drawer-list-item")[0];
          isActive(home);
          home.click();
          }
          else{
            app.dialog.alert("You must change at least 1 field!", "InfiniTech 👊");
          }
        
          // Finally stop the page from reloading
          return false;
          
  }); 
}
},
},
  // App root element
  root: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Add default routes
  routes: routes

});

var dynamicPopup = app.popup.create({
  content: '<div class="popup"><div class="block" style="height:100%"><i class="icon f7-icons" style="top:-15px;" onclick="dynamicPopup.close()">close</i><form id="myForm" class="gform pure-form pure-form-stacked" method="POST" data-email="" action="https://script.google.com/macros/s/AKfycbxSpRr_JqfzJC49xvYpb-0N8vGMa0UuvwyDtS5d/exec" onsubmit="displayFormSuccess();' + 'removeExpenseReport()"><div id="alertmessage"></div><div class="list inset"><ul><div class="form-elements"><li class="item-content item-input" style="margin-bottom: 15px;"><div class="item-inner"><div class="item-input-wrap"><input type="text" id="name" name="name" placeholder="Username" required><span class="input-clear-button"></span></div></div></li><li class="item-content item-input" style="margin-bottom: 15px;"><div class="item-inner"><div class="item-input-wrap"><input type="text" id="subject" name="subject" placeholder="Subject" required><span class="input-clear-button"></span></div></div></li><li class="item-content item-input" style="margin-bottom: 15px"><div class="item-inner"><div class="item-input-wrap"><textarea id="message" name="message" rows="10" placeholder="Your message..." required spellcheck="true"></textarea><span class="input-clear-button"></span></div></div></li><li class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="email" id="email" name="email" placeholder="E-mail" oninput="updateFormEmail()" required><span class="input-clear-button"></span></div></div></li><li class="item-content item-input item-input-with-value" style="display: none"><div class="item-inner"><div class="item-input-wrap"><textarea id="others" name="others" placeholder="cc" class="input-with-value"></textarea><span class="input-clear-button"></span></div></div></li></div></ul></div><div class="block block-strong row no-hairlines" style="position: absolute; bottom: 0px; width: 100%; left: 0px"><div class="col"><button class="button popup-close button-fill-md color-red" href="#" type="button">Cancel</button></div><div class="col"><button class="button button-fill-md color-green" href="#" type="submit">Confirm</button></div></div></form><h4 style="text-align: center; font-weight: normal; font-style: italic">An automatic email 📧 will be sent to the user.</h4></div></div>',
  on: {
    opened: function (popup) {
      loaded();
    },
  }
});

var ac1 = app.actions.create({
  buttons: [
    {
      text: 'Issue Reminder Messages',
      onClick: function () {
        dynamicPopup.open();
        document.getElementById("alertmessage").innerHTML = '<div class="list inset"><ul><li class="item-content item-input item-input-with-value"><div class="item-inner"><div class="item-title item-label">Message Type:</div><div class="item-input-wrap input-dropdown-wrap"><select onchange="fillFormData(this.value)" placeholder="Please choose..." class="input-with-value"><option value="incomplete">Incomplete Expenses Submission</option><option value="reminder">Payroll Deadline Reminder</option></select></div></div></li></ul></div>';
        document.getElementById("myForm").nextSibling.innerHTML= '<h4 style="text-align: center; font-weight: normal; font-style: italic">An automatic email 📧 will be sent to all users.</h4>';
        document.getElementById("myForm").setAttribute("onsubmit", "displayFormSuccess()");
        document.getElementsByClassName("form-elements")[0].childNodes[3].style = "display: none";
        document.getElementsByClassName("form-elements")[0].childNodes[4].style = "display: block";
        let emails = "";
        if(user_emails) {for (var i = 0; i < user_emails.length; i++){if(user_emails[i].user_email != null){ if(i == 0){document.getElementById("email").value = user_emails[0].user_email;} else if(i == (user_emails.length) - 1){emails += user_emails[i].user_email} else {emails += user_emails[i].user_email + ","; } } } updateFormEmail();}
        document.getElementById("others").value = emails.substring(0, (emails.length - 1));
      }
    },
    {
      text: 'Cancel',
      color: 'red'
    },
  ]
});

var photobrowse = app.photoBrowser.create({
  photos : [],
  routableModals: false
});

var mainView = app.views.create('.view-main');

function loginOnKeyEnter(input1, input2, button){
  input1.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     button.click();
    }
  });
  input2.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     button.click();
    }
  });
}

function onGoogleSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  saveLogin([{name: profile.getName(), email: profile.getEmail(), picture: profile.getImageUrl(), id: profile.getId()}]);
  validateSocialMediaLogin(logindata[0].id, null);
}

function onGoogleSignOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    document.location.reload(true);
  });
}

function onFBSignin() {
  FB.getLoginStatus(function(response) {
    let image_url = 'https://graph.facebook.com/' +  response.authResponse.userID + '/picture?type=normal';
    let id = response.authResponse.userID;
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      saveLogin([{name: response.name, picture: image_url, email: "", id: id}]);
      validateSocialMediaLogin(null, logindata[0].id);
    });
  }
  });
}

function saveLogin(response){
  if(response[0].hasOwnProperty("User_Username")){
      logindata = response.map(item => ({name: item.User_Username, pass: item.User_Password, gid: item.User_Google_ID, fid: item.User_Facebook_ID, email: item.User_Email, id: item.User_ID}));
      isUser = true;
  }
  else if(response[0].hasOwnProperty("Admin_Username")){
      logindata = response.map(item => ({name: item.Admin_Username, pass: item.Admin_Password, gid: item.Admin_Google_ID, fid: item.Admin_Facebook_ID, email: item.Admin_Email, id: item.Admin_ID}));
      isAdmin = true;
  }
  else if(response[0].hasOwnProperty("Manager_Username")){
    logindata = response.map(item => ({name: item.Manager_Username, pass: item.Manager_Password, gid: item.Manager_Google_ID, fid: item.Manager_Facebook_ID, email: item.Manager_Email, id: item.Manager_ID}));
    isManager = true;
  }
  else if(response[0].hasOwnProperty("name")){
      logindata = response.map(item => ({name: item.name, email: item.email, id: item.id, picture: item.picture}));
  }
  else {
    console.error("Failed to save login information!");
  }
}

function validateSocialMediaLogin(googleid, facebookid){
  let is_User = null;
  let is_Admin = null;
  let is_Manager = null;

  let user = fetch(`https://stormy-coast-58891.herokuapp.com/user_social_login?googleid=${googleid}&facebookid=${facebookid}`)
  .then(response => response.json())
  .then(response => {if(response.length == 0) {is_User = false;} else if(response.length == 1){logindata[0].id = response[0].User_ID; logindata[0].name = response[0].User_Username; logindata[0].email = response[0].User_Email; app.views.main.router.navigate('/categories/'); is_User = true; isUser = true}})
  .catch(err => console.error(err))

  let admin = fetch(`https://stormy-coast-58891.herokuapp.com/admin_social_login?googleid=${googleid}&facebookid=${facebookid}`)
  .then(response => response.json())
  .then(response => {if(response.length == 0) {is_Admin = false} else if(response.length == 1){logindata[0].id = response[0].Admin_ID; logindata[0].name = response[0].Admin_Username; logindata[0].email = response[0].Admin_Email; app.views.main.router.navigate('/admin/'); is_Admin = true; isAdmin = true}})
  .catch(err => console.error(err))

  let manager = fetch(`https://stormy-coast-58891.herokuapp.com/manager_social_login?googleid=${googleid}&facebookid=${facebookid}`)
  .then(response => response.json())
  .then(response => {if(response.length == 0) {is_Manager = false} else if(response.length == 1){logindata[0].id = response[0].Manager_ID; logindata[0].name = response[0].Manager_Username; logindata[0].email = response[0].Manager_Email; app.views.main.router.navigate('/manager/'); is_Manager = true; isManager = true}})
  .catch(err => console.error(err))

  Promise.all([user,admin,manager]).then(function(){if(is_User == null || is_Admin == null || is_Manager){app.dialog.alert("There are too many users are associated with that account, please contact ­the system administrator.", "Too many users registered!");} else if(!is_User && !is_Admin && !is_Manager){let idtype = null; if(googleid) {idtype = "googleID: #" + googleid} else if(facebookid) {idtype = "facebookID: #" + facebookid} app.dialog.alert("Sorry we couldn't find an account with the login you provided to us.­ 🤷 " + idtype, "User account not found! 😲");}})
}

function fetchExpenses(id){
  fetch("https://stormy-coast-58891.herokuapp.com/expenses/" + id)
  .then(response => response.json())
  .then(response => {expenses = response.slice(0); updateUserExpenses();})
  .catch(err => console.error(err))
}

function updateUserExpenses(){
  let array = expenses.map((item) => item.Category); 
  let listofcategories = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); 
  let categoryarray = Object.keys(listofcategories).map(item => ({name: item, count: listofcategories[item]})); 
  filteredCategories = categoryarray.slice(0); displayCategories(categoryarray); 
  let array2 =  expenses.map((item) => item.Client_Project); 
  let listofprojects = array2.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); 
  let projectarray = Object.keys(listofprojects).map(item => ({name: item, count: listofprojects[item]})); filteredProject = projectarray.slice(0);
}

function fetchAdminExpenses(id){
  let datapack1 = fetch("https://stormy-coast-58891.herokuapp.com/adminexpenses/" + id)
  .then(response => response.json())
  .then(response => {if(response.length > 0) {expenses = response.slice(0);} else {expenses = false}})
  .catch(err => console.error(err), expenses = false)

  let datapack2 = fetch("https://stormy-coast-58891.herokuapp.com/users/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){projectdata = response.slice(0)} else{projectdata = false}})
  .catch(err => console.error(err), projectdata = false)

  Promise.all([datapack1,datapack2]).then(function(){if(projectdata && expenses){displayAdminExpenses();}else{console.log("Failed to fetch data :("); document.getElementsByClassName("page-content")[1].innerHTML = error_message}})
}


function displayAdminExpenses(){
  let counter = 0;
  let position = 0;
  for(var i = 0; i < expenses.length; i++){
    let Old_UserID = null;
    if(i > 0){Old_UserID = expenses[(i - 1)].User_ID;} else {const index = projectdata.map(e => e.user_id).indexOf(expenses[0].User_ID); document.getElementById("expenselist").innerHTML = "<div class='block block-strong no-hairlines tablet-inset' style='background: transparent'><div class='card data-table data-table-collapsible data-table-init' style='height: auto'><div class='card-header'><div class='data-table-header'><div class='data-table-title'>" + projectdata[index].user_username + "</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>sort</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div><div class='data-table-header-selected'><div class='data-table-title-selected'><span class='data-table-selected-count'>0</span> items selected</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>trash</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div></div><div class='card-content'><div class='list'><ul id=" + "user0" + "></ul></div></div></div></div>"; injectAdminCategories(expenses[0].User_ID, 0, projectdata[index].user_username, projectdata[index].user_email);}
    let Current_UserID = expenses[i].User_ID;

    if(Old_UserID != Current_UserID && Old_UserID != null){
    const index = projectdata.map(e => e.user_id).indexOf(expenses[i].User_ID);
    counter++;
    position += 60;
    document.getElementById("expenselist").innerHTML += "<div class='block block-strong no-hairlines tablet-inset' style='background: transparent; top: -" + position + "px'><div class='card data-table data-table-collapsible data-table-init' style='height: auto'><div class='card-header'><div class='data-table-header'><div class='data-table-title'>" + projectdata[index].user_username + "</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>sort</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div><div class='data-table-header-selected'><div class='data-table-title-selected'><span class='data-table-selected-count'>0</span> items selected</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>trash</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div></div><div class='card-content'><div class='list'><ul id=" + "user" + counter + "></ul></div></div></div></div>"; injectAdminCategories(expenses[i].User_ID, counter, projectdata[index].user_username, projectdata[index].user_email);
    }
  }
}

function injectAdminCategories(id, counter, username, email){
  let array = [];
  userexpenses = [];
  for(var i = 0; i < expenses.length; i++){
    if(id == expenses[i].User_ID)
    {
      userexpenses.push(expenses[i]);
      array.push(expenses[i].Client_Project);
    }
}
let arrayreduced = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {});
let filteredarray = Object.keys(arrayreduced).map(item => ({name: item, count: arrayreduced[item]}));

if(email == null){
  email = "";
}

for(var i = 0; i < filteredarray.length; i++){
  document.getElementById("user" + counter).innerHTML += "<li class='accordion-item'><a href='#' class='item-content item-link'><div class='item-inner'><div class='item-title'>" + filteredarray[i].name + " (" + filteredarray[i].count + ")" + "</div></div></a><div class='accordion-item-content' aria-hidden='true'><div class='block'>" + injectAdminExpenses(filteredarray[i].name, username, email) + "</div></div></li>";
}
}

function injectAdminExpenses(name, username, email) {
  let rows = "";
  for(var i = 0; i < userexpenses.length; i++){
    if(userexpenses[i].Client_Project == name)
    {
      rows += "<tr><td class='checkbox-cell'><label class='checkbox'><input type='checkbox'><i class='icon-checkbox'></i></label></td><td class='label-cell' data-collapsible-title='Project Name:'>" + userexpenses[i].Client_Project + "</td><td class='numeric-cell' data-collapsible-title='Report ID:'>" + userexpenses[i].report_ID + "</td><td class='numeric-cell' data-collapsible-title='Description:'>" + userexpenses[i].Expense_Desc + "</td><td class='numeric-cell' data-collapsible-title='Category:'>" + userexpenses[i].Category + "</td><td class='numeric-cell' data-collapsible-title='Amount:'>" + userexpenses[i].Amount + "</td><td class='numeric-cell' data-collapsible-title='Evidence:'>" + displayEvidence(userexpenses[i].Evidence) + "</td><td class='actions-cell'><a class='link icon-only' onclick=" + "approveExpense(" + userexpenses[i].report_ID + "," + "'" + username + "'" + "," + "'" + escape(userexpenses[i].Expense_Desc) + "'" + "," + "'" + escape(userexpenses[i].Category) + "'" + "," + "'" + userexpenses[i].Amount + "'" + "," + "'" + escape(email) + "'" + ")" + "><i class='icon f7-icons if-not-md' style='color: green'>check</i></a><a class='link icon-only' onclick=" + "rejectExpense(" + userexpenses[i].report_ID + "," + "'" + username + "'" + "," + "'" + escape(userexpenses[i].Expense_Desc) + "'" + "," + "'" + escape(userexpenses[i].Category) + "'" + "," + "'" + userexpenses[i].Amount + "'" + "," + "'" + escape(email) + "'" + ")" + "><i class='icon f7-icons if-not-md' style='color: red'>close</i></a></td></tr>";
    }
  }
    return "<table><thead><tr><th class='checkbox-cell'><label class='checkbox'><input type='checkbox' disabled><i class='icon-checkbox'></i></label></th><th class='label-cell'>Project Name:</th><th class='numeric-cell'>Report ID:</th><th class='numeric-cell'>Description:</th><th class='numeric-cell'>Category:</th><th class='numeric-cell'>Amount:</th><th class='numeric-cell'>Evidence:</th><th class='numeric-cell'>Approve / Reject:</th></tr></thead><tbody>" + rows + "</tbody></table>";
}

function displayCategories(categories){
    while(document.getElementById("categories") != null) {
    document.getElementById("categories").innerHTML = "";
    if(categories.length > 0){
      for(var i = 0; i < categories.length; i++){
        let randomcolor = colors[Math.floor(Math.random() * colors.length)];
        let multiples = "s";
        if(categories[i].count > 1) {multiples = "s"} else {multiples = ""}
        document.getElementById("categories").innerHTML += "<a href='/expenses/' data-force='true' data-ignore-cache='true' onclick=" + "'updateIndex(" + i + ")'" + "><div class='card theme-" + randomcolor + "' style='margin-top: 25px'><div class='card__part card__part-2 card__hover'><div class='card__part__side m--back'><div class='card__part__inner card__face' style='box-shadow: 5px 10px 8px #888888'><div class='card__face__colored-side'></div><div style='float: right;position: relative;top: 0px;padding-right: 10px;' class='card__greytext'><span>£3839.23</span><i class='f7-icons' style='position: absolute;top: 25px;font-size: 20px;padding-left: 5px'>chevron_right</i></div><h3 class='card__face__price ng-binding text-limited'>" + categories[i].name + "</h3><p class='card__greytext' style='width: 150px'>" + categories[i].count + " Expense" + multiples + "</p><div class='card__greytext' style='font-size: 15px'><i class='f7-icons' style='font-size: 18px; padding-right: 10px'>time</i>Awaiting confirmation...</div></div></div></div></div><a>";
      }
    }
    else{
      document.getElementById("categories").innerHTML = "<h3 style='font-weight: normal; padding: 20px'>Uh oh! Looks like we couldn't find any expenses associated with your account 😭 Try creating a new expense by clicking the button in the bottom-right hand corner.</h3>";
    }
    break;
  }
}

function updateIndex(index){
  selected_index = index;
}

function fetchFormData(){
  let datapack1 = fetch("https://stormy-coast-58891.herokuapp.com/projects/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){projectdata = response.slice(0)} else{projectdata = false}})
  .catch(err => console.error(err), projectdata = false)

  let datapack2 = fetch("https://stormy-coast-58891.herokuapp.com/categories/")
  .then(response => response.json())
  .then(response => {if(response.length > 0) {categorydata = response.slice(0)} else{categorydata = false}})
  .catch(err => console.error(err), categorydata = false)

  Promise.all([datapack1,datapack2]).then(function(){if(categorydata && projectdata){if(isUser) {displayFormData()} else {displayAdminTables()}} else {console.error("Failed to fetch data :("); document.getElementsByClassName("page-content")[1].innerHTML = error_message;}})
}

function displayFormData(){
  let clientNameElement = document.getElementById("clientname");
  let projectNameElement = document.getElementById("projectname");
  let categoryElement = document.getElementById("category");
  clientNameElement.style = "";
  projectNameElement.style = "";
  categoryElement.style = "";

  if(bContinue) {
    // Only run this code if user wants to creates a new expense report
    document.getElementById("username").innerHTML = "<input type='text' readonly value='" + logindata[0].name + "'></input>";
    document.getElementById("userid").innerHTML = "<input type='text' name='userId' readonly value='" + logindata[0].id + "'></input>";

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2){ month = '0' + month};
    if (day.length < 2) {day = '0' + day};

    document.getElementById("date").value = [year, month, day].join('-');
  }

  if(projectdata.length > 0 && categorydata.length > 0){
    for(var i = 0; i < projectdata.length; i++){
      let option = document.createElement("option"); 
      option.text = projectdata[i].Client_Name; 
      clientNameElement.add(option, clientNameElement[i]); 
      let option2 = document.createElement("option"); 
      option2.text = projectdata[i].Project_Name; 
      projectNameElement.add(option2, projectNameElement[i])
    }
    for(var i = 0; i < categorydata.length; i++) {
      let option = document.createElement("option"); 
      option.text = categorydata[i].Categories; 
      categoryElement.add(option, categoryElement[i]);
    }
      clientNameElement.remove(projectdata.length);
      projectNameElement.remove(projectdata.length);
      categoryElement.remove(categorydata.length);
  }

  if(!bContinue){
    updateFormData();
  }
}

function addExpenseReport(){
  let hasFetched = false;
  var formData = app.form.convertToData('#uploadForm');
  let newprojectid = fetch("https://stormy-coast-58891.herokuapp.com/maxprojectid/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){ hasFetched = true; formData.reportId = ((response[0].Report_ID) + 1)}})
  .catch(err => console.error(err))
  formData.userId = parseInt(formData.userId);
  formData.amount = "£" + formData.amount;
  Promise.all([newprojectid]).then(function(){if(hasFetched){
  app.request.postJSON('https://stormy-coast-58891.herokuapp.com/addexpense', formData); 
  // Update the front end
  app.preloader.hide();
  let newobject = {User_ID: formData.userId, Report_ID: formData.reportId, Date_of_Submission: formData.subdate, Reciept: formData.reciept, Expense_Desc: formData.desc, Category: formData.category, Client_Name: formData.clientname, Client_Project: formData.clientproject, Billable: formData.bill, Payment_Method: formData.paymeth, Amount: formData.amount};
  expenses.push(newobject);
  updateUserExpenses();
  app.dialog.alert("A new expense report has been created successfully!", "Success! 😄👏"); let home = document.getElementsByClassName("drawer-list-item")[0];isActive(home);home.click();}})
}

function removeExpenseReport(){
  // Define expense id object for database deletion. 
  let id = {id: expenses[selected_index].report_ID}

  // Copy the report into the archive table.
  //let archived = {userId: expenses[selected_index].User_ID, reportId: expenses[selected_index].report_ID, subdate: expenses[selected_index].Date_of_Submission, reciept: expenses[selected_index].Reciept, desc: expenses[selected_index].Expense_Desc, category: expenses[selected_index].Category, clientname: expenses[selected_index].Client_Name, clientproject: expenses[selected_index].Client_Project, bill: expenses[selected_index].Billable, paymeth: expenses[selected_index].Payment_Method, amount: expenses[selected_index].Amount};
  //app.request.postJSON('https://stormy-coast-58891.herokuapp.com/archiveexpense', archived);
  
  // Remove the report from the report table in the database.
  app.request.postJSON('https://stormy-coast-58891.herokuapp.com/deleteexpense', id);
  // Remove expense from the front end.
  expenses.splice(selected_index, 1);
  // Reload the page to update the changes.
  displayAdminExpenses();
}

function approveExpense(id, username, desc, category, amount, sender){
  dynamicPopup.open();
  document.getElementById("alertmessage").innerHTML = '<h1 style="text-align: center">Approve Report #' + id + '</h1><h3 style="text-align: center">Are you sure you want to approve this expense report?</h3>';
  document.getElementById("name").value = username;
  document.getElementById("subject").value = "Your Expense Report Was Approved!";
  document.getElementById("message").value = "Your expense: " + unescape(desc) + ", Category: " + unescape(category) + ", Amount: " + amount + " has been approved! 😄👏";
  document.getElementById("email").value = unescape(sender);
  updateFormEmail();
  updateIndex(expenses.findIndex(item => item.report_ID === id));
}

function rejectExpense(id, username, desc, category, amount, sender){
  dynamicPopup.open();
  document.getElementById("alertmessage").innerHTML = '<h1 style="text-align: center">Reject Report #' + id + '</h1><h3 style="text-align: center">Are you sure you want to reject this expense report?</h3>';
  document.getElementById("name").value = username;
  document.getElementById("subject").value = "Your Expense Report Was Rejected!";
  document.getElementById("message").value = "Sorry your expense: " + unescape(desc) + ", Category: " + unescape(category) + ", Amount: " + amount + " has been rejected! 😭";
  document.getElementById("email").value = unescape(sender);
  updateFormEmail();
  updateIndex(expenses.findIndex(item => item.report_ID === id));
}

function updateFormEmail(){
  document.getElementById("myForm").setAttribute("data-email", document.getElementById("email").value);
}

function displayFormSuccess(){
  dynamicPopup.close();
  app.dialog.alert("Your email has been sent successfully! 😄", "Email was sent to user");
}

function updateStatusBar() {
  if(logindata != null) {
    document.getElementById("drawer-meta").innerHTML = "<span class='drawer-name'>" + logindata[0].name + "</span><span class='drawer-email'>" + logindata[0].email +"</span>";
    if(logindata[0].hasOwnProperty("picture")){document.getElementById("drawer-icon").src = logindata[0].picture}
  } else {console.log("Failed to update status bar :(")}
}

function isActive(element){
    let others = document.getElementsByClassName("drawer-list-item");
    for(var i = 0; i < others.length; i++){if(others[i] != element){ others[i].className = "drawer-list-item"; } else {element.classList.add("is-active");} }
    app.panel.close();
  }

function fillFormData(x){
  switch(x){
    case "reminder":
    document.getElementById("subject").value = "Payroll Deadline Reminder";
    document.getElementById("message").value = "This email is to remind all employees that the payroll deadline is ... for expense claim submissions.";
    break;
    case "incomplete":
    document.getElementById("subject").value = "Incomplete Expense Submission Received";
    document.getElementById("message").value = "We have recently received your expenses claim submission. Unfortunately, some of the information required is missing. Please check your submission and complete in full. Incomplete submissions will not be approved.";
    break;
  }
}

function fetchUserEmails(){
  fetch("https://stormy-coast-58891.herokuapp.com/users/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){user_emails = response.slice(0)} else{user_emails = false}})
  .catch(err => console.error(err), user_emails = false)
}

function displayEvidence(string){
  if(string != null){
    let images = string.split(',');
    return "<a onclick=" + "displayPhotos(" + "'" + escape(images.join(" ").toString()) + "'" + ")" + "><img style='width:30px;height:30px' src='/uploads/"  + images[0] + "'></img></a>"
  } else {return false}
}

function displayPhotos(string){
  let raw_data = unescape(string);
  let photos = raw_data.split(" ");
  photobrowse.params.photos = photos.map(photo => '/uploads/' + photo);
  photobrowse.open();
}

function updateExpense(id, date, reciept, description, category, client, project, paymeth, amount){
  dynamicPopup.open();
  // Reset Form with data
  document.getElementById("myForm").innerHTML = '<input id="report_id" name="report_id" type="number" class="input-with-value" readonly required style="display:none"><div class="list no-hairlines-md" style="top:-20px"><ul><li class="item-content item-input item-input-with-value" style="padding-left: 0px"><div class="item-media"></div><div class="item-inner"><div class="item-title item-label">Date: </div><div class="item-input-wrap"><input id="date" type="date" name="date" placeholder="Please choose..." class="input-with-value" required></div></div></li><li class="item-content item-input item-input-with-value" style="padding-left: 0px"><div class="item-media"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Reciept: </div><div class="item-input-wrap input-dropdown-wrap"><select placeholder="Please choose..." name="reciept" class="input-with-value"><option value="hard">Hard copy</option><option value="soft">Soft copy</option><option value="no">No</option></select></div></div></li><li class="item-content item-input" style="padding-left: 0px"><div class="item-media" style="padding-left: 0px"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Description: </div><div class="item-input-wrap"><textarea id="desc" name="description" placeholder="Description goes here.." spellcheck="true" style="height:25px" required></textarea></div></div></li><li class="item-content item-input" style="padding-left: 0px"><div class="item-media"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Category: </div><div class="item-input-wrap input-dropdown-wrap"><select name="category" id="category" placeholder="Please choose..."></select></div></div></li><li class="item-content item-input" style="padding-left: 0px"><div class="item-media" style="padding-left: 0px"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Client Name: </div><div class="item-input-wrap input-dropdown-wrap"><select name="client" id="clientname" placeholder="Please choose..."></select></div></div></li><li class="item-content item-input" style="padding-left: 0px"><div class="item-media"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Project Name: </div><div class="item-input-wrap input-dropdown-wrap"><select name="project" id="projectname" placeholder="Please choose..."></select></div></div></li><li class="item-content item-input item-input-with-value" style="padding-left: 0px"><div class="item-media"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Payment Method: </div><div class="item-input-wrap input-dropdown-wrap"><select name="payment" placeholder="Please choose..." class="input-with-value"><option value="Own Payment">Own Payment</option><option value="Corporate Card">Corporate Card</option></select></select></div></div></li><li class="item-content item-input" style="padding-left: 0px"><div class="item-media"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Amount (£): </div><div class="item-input-wrap"><input id="amount" name="amount" type="number" required></div></div></li><li class="item-content item-input" style="padding-left: 0px"><div class="item-media"><i class="icon demo-list-icon"></i></div><div class="item-inner"><div class="item-title item-label">Evidence: </div><div class="item-input-wrap"><input type="file" name="myImage" accept="image/jpg, image/jpeg, image/png" multiple required></div></div></li></ul></div><div class="block block-strong row no-hairlines" style="position: absolute; bottom: 0px; width: 100%; left: 0px"><div class="col"><button class="button popup-close button-fill-md color-red" type="button" onclick="dynamicPopup.close();">Close</button></div><div class="col"><button class="button button-fill-md color-green" type="button" onclick="confirmChanges()">Update Changes</button></div></div>';
  let element = document.getElementById("myForm").nextElementSibling;
  if(element) { element.remove(); }
  // Now display values...
  document.getElementById("desc").innerText = unescape(description);
  document.getElementById("amount").value = amount.substring(1, amount.length);
  // Check format of date string and display value...
  if(date.includes("/")) {
    document.getElementById("date").value = date.replace(new RegExp('/', 'g'), '-').split("-").reverse().join("-");
  } else {document.getElementById("date").value = date}

  document.getElementById("report_id").value = id;
  vclientname = unescape(client);
  vcategory = unescape(category);
  vprojectname = unescape(project);
  fetchFormData();
}


function updateFormData(){
  let categoryElement = document.getElementById("category");
  let clientNameElement = document.getElementById("clientname");
  let projectNameElement = document.getElementById("projectname");

  for(var i = 0; i < categoryElement.options.length; i++){
    if(categoryElement.options[i].innerText == vcategory){
      categoryElement.selectedIndex = i;
    }
  }
  for(var i = 0; i < clientNameElement.options.length; i++){
    if(clientNameElement.options[i].innerText == vclientname){
      clientNameElement.selectedIndex = i;
    }
  }
  for(var i = 0; i < projectNameElement.options.length; i++){
    if(projectNameElement.options[i].innerText == vprojectname){
      projectNameElement.selectedIndex = i;
    }
  }
}

function confirmChanges(){
  var formData = app.form.convertToData('#myForm');
  const index = expenses.map(e => e.Report_ID).indexOf(parseInt(formData.report_id))
  // Validate at least 1 field has changed
  if(expenses[index].Date_of_Submission != formData.date || expenses[index].Reciept != formData.reciept || expenses[index].Expense_Desc != formData.description || expenses[index].Category != formData.category || expenses[index].Client_Name != formData.client || expenses[index].Client_Project != formData.project || expenses[index].Payment_Method != formData.payment || expenses[index].Amount != ("£" + formData.amount)){
    // Update Database
    app.preloader.show();
    formData.amount = "£" + formData.amount;
    app.request.postJSON('https://stormy-coast-58891.herokuapp.com/updateexpense', formData);
  // Update Front End
    expenses[index].Date_of_Submission = formData.date;
    expenses[index].Reciept = formData.reciept;
    expenses[index].Expense_Desc = formData.description;
    expenses[index].Category = formData.category;
    expenses[index].Client_Name = formData.client;
    expenses[index].Client_Project = formData.project;
    expenses[index].Payment_Method = formData.payment;
    expenses[index].Amount = formData.amount;
    updateUserExpenses();
    app.preloader.hide();
    dynamicPopup.close();
  // Display Success
    app.dialog.alert("Expense updated successfully!", "Success! 😄👏");
    app.views.main.router.back();
  }
  else
  {
    app.dialog.alert("You must change at least 1 field!", "InfiniTech 👊");
  }
}

function newItem(element, type){
  if(type == 'Category Name:') {
  app.dialog.prompt('Please enter a new category:', 'New Category', function (name) {
    if(name == "") {app.dialog.alert("Field was blank. Invalid input!", "No input detected!")} else {
      let newelement = '<tr><td class="label-cell" data-collapsible-title=' + '"' + type + '"' + '>' + name + '</td><td class="actions-cell" data-collapsible-title=""><a onclick="editItem(this.parentElement.parentElement)" class="link icon-only"><i class="icon f7-icons if-not-md">compose</i></a><a onclick="deleteItem(this.parentElement.parentElement)" class="link icon-only"><i class="icon f7-icons if-not-md">trash</i></a></td></tr>';
      element.childNodes[3].children[0].children[0].children[0].children[1].children[0].children[0].children[0].innerHTML += newelement;
      let catobject = {category: name}
      app.request.postJSON('https://stormy-coast-58891.herokuapp.com/addcategory', catobject);
      }
      app.dialog.alert(name + ' was added! 😄', 'Item Added 🎉');
  });
} else if(type == 'Project Name:'){
  let project = null;
  app.dialog.prompt('Please enter a new project name:', 'New Project', function(name) {
    if(name == "") {app.dialog.alert("Field was blank. Invalid input!", "No input detected!")} else {
    project = name;
    app.dialog.prompt('Please enter a new client name:', 'New Client', function(name) {
      if(name == "") {app.dialog.alert("Field was blank. Invalid input!", "No input detected!")} else {
      let projectobject = {projectname: project, clientname: name}
      let newel = '<tr><td class="label-cell" data-collapsible-title=' + '"' + type + '"' + '>' + project + '</td><td class="label-cell" data-collapsible-title="Client Name:">' + name + '</td><td class="actions-cell" data-collapsible-title=""><a onclick="editItem(this.parentElement.parentElement, ' + "'project'" + ')" class="link icon-only"><i class="icon f7-icons if-not-md">compose</i></a><a onclick="deleteItem(this.parentElement.parentElement,' + "'project'" + ')" class="link icon-only"><i class="icon f7-icons if-not-md">trash</i></a></td></tr>'
      element.children[1].children[0].children[0].children[0].children[1].children[0].children[0].children[1].innerHTML += newel;
      app.request.postJSON('https://stormy-coast-58891.herokuapp.com/addproject', projectobject);
      app.dialog.alert(project + ' & ' + name + ' was added! 😄', 'Item Added 🎉');
      }
    });
  }
  });
}
}

function editItem(element, type){
  let newproj = null;
  let newname = null;
      
      if(type == 'project'){
        let dialog = app.dialog.prompt('', 'Enter a new ' + type + ' name:', function (name) {
          if(name == "") {app.dialog.alert("Field was blank. Invalid input!", "No input detected!")} else {
            newproj = name;
            let dialog = app.dialog.prompt('', 'Enter a new client name:', function (name) {
              if(name == "") {app.dialog.alert("Field was blank. Invalid input!", "No input detected!")} else {
                  let projectobject = {projectname: newproj, clientname: name, oldproject: element.children[0].innerText, oldclient: element.children[1].innerText}
                  // Update Front End
                  element.children[0].innerText = newproj;
                  element.children[1].innerText = name;
                  // Send to Server
                  app.request.postJSON('https://stormy-coast-58891.herokuapp.com/updateproject', projectobject);
                  app.dialog.alert('Item was updated successfully. ', 'Item Updated!');
              }
            });
            dialog.$el.find('input').val(element.children[1].innerText);
          }
        });
        dialog.$el.find('input').val(element.children[0].innerText);
      }
      else if(type == 'category'){
        let dialog = app.dialog.prompt('', 'Enter a new ' + type + ' name:', function (name) {
          if(name == "") {app.dialog.alert("Field was blank. Invalid input!", "No input detected!")} else {
            newname = name;
            if(type == 'category'){
              let catobject = {oldcat: element.firstElementChild.innerText, newcat: newname}
              // Update Front End
              element.firstElementChild.innerText = name;
              // Send to Server
              app.request.postJSON('https://stormy-coast-58891.herokuapp.com/updatecategory', catobject);
              app.dialog.alert('Item was updated successfully. ', 'Item Updated!');
            }
      }
    });
    dialog.$el.find('input').val(element.firstElementChild.innerText);
  }
}

function deleteItem(element, type){
  app.dialog.confirm('Are you sure you want to delete this?', 'Confirm Deletion', function () {
    if(type == 'project'){
      // Send to Server
      const data = {projectname: element.firstElementChild.innerText, clientname: element.children[1].innerText}
      app.request.postJSON('https://stormy-coast-58891.herokuapp.com/deleteproject', data);
    }
    else if(type == 'category'){
      // Send to Server
      const data = {category: element.firstElementChild.innerText}
      app.request.postJSON('https://stormy-coast-58891.herokuapp.com/deletecategory', data);
    }
    // Update Front End
    element.remove();
    app.dialog.alert('Item Deleted! 😄', 'Item Removed 🗑');
  });
}

function displayAdminTables(){
  // Define tables
  let category_table = document.getElementById("category_table");
  let project_table = document.getElementById("project_table");

  // Reset tables in duplicates are created
  category_table.innerHTML = "";
  project_table.innerHTML = "";

  // Display table info
  for(var i = 0; i < categorydata.length; i++){
    category_table.innerHTML += '<table><tbody><tr><td class="label-cell" data-collapsible-title="Category Name:">' + categorydata[i].Categories  + '</td><td class="actions-cell" data-collapsible-title=""><a onclick="editItem(this.parentElement.parentElement, ' + "'category'" + ')" class="link icon-only"><i class="icon f7-icons if-not-md">compose</i></a><a onclick="deleteItem(this.parentElement.parentElement, ' + "'category'" + ')" class="link icon-only"><i class="icon f7-icons if-not-md">trash</i></a></td></tr></tbody></table>';
  }

  for(var i = 0; i < projectdata.length; i++){
    project_table.innerHTML += '<tr><td class="label-cell" data-collapsible-title="Project Name:">' + projectdata[i].Project_Name + '</td><td class="label-cell" data-collapsible-title="Client Name:">' + projectdata[i].Client_Name + '</td><td class="actions-cell" data-collapsible-title=""><a onclick="editItem(this.parentElement.parentElement, ' + "'project'" + ')" class="link icon-only"><i class="icon f7-icons if-not-md">compose</i></a><a onclick="deleteItem(this.parentElement.parentElement, ' + "'project'" + ')" class="link icon-only"><i class="icon f7-icons if-not-md">trash</i></a></td></tr>';
  }
}