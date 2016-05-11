/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //alert("APIS are ready!");
        var notificationOpenedCallback = function(jsonData) {
    console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));

  };

  window.plugins.OneSignal.init("3768114a-92c1-4097-bdeb-ec5203a6a421",
                                 {googleProjectNumber: "391701487491"},
                                 notificationOpenedCallback);
  
  // Show an alert box if a notification comes in when the user is in your app.
  window.plugins.OneSignal.enableInAppAlertNotification(true);
    },
    // Update DOM on a Received Event
    // receivedEvent: function(id) {
    //     var parentElement = document.getElementById(id);
    //     var listeningElement = parentElement.querySelector('.listening');
    //     var receivedElement = parentElement.querySelector('.received');

    //     listeningElement.setAttribute('style', 'display:none;');
    //     receivedElement.setAttribute('style', 'display:block;');

    //     console.log('Received Event: ' + id);
    // },

    loginUser: function() {
        var em = $('#email').val();
        var pw = $('#password').val();
        pw = $.md5(pw);
        var url ="http://itccprojects.com.au/appandroid/login.php?callback=foo";
        var dataString = "email="+em+"&password="+pw;

        $.ajax({
            //type: "POST",
            url: "http://itccprojects.com.au/appandroid/login.php",
            //jsonp: "login",
            data: dataString,
            dataType: "jsonp",
            
            success: function(data){
                //alert("aaaa");
                console.log(data);
                if(data['success'] == 200){
                    //alert('hello');
                    localStorage.login="true";
                    localStorage.email=em;
                    window.plugins.OneSignal.sendTags({email: em});
                    localStorage.uid = data['uid'];
                    localStorage.setItem('user', JSON.stringify(data['user']));
                    window.location.href = "index.html";
                }
                else{
                    alert('wrong email or password');

                }

            }
        });
    },

    getUser: function(){
        var output = '';
        if (localStorage.user != null) {
            var user = JSON.parse(localStorage.user);
            output += "<p>Name: "+user['firstname']+" "+user['surname']+"</p>";
            output += "<p>Email: "+localStorage.email+"</p>";
            // js Date
            // var dob = user['dob'].split('-');
            var birth = new Date(user['dob']);
            var dob = [birth.getDate(), birth.getMonth()+1, birth.getFullYear()].join('/');
            output += "<p>Day of Birth: "+dob+"</p>";
            // 
            var usi ='';
            if(user['usi'] != null){
                usi = user['usi'];
            }
            output += "<p>USI: "+usi+"</p>";
            output += "<p>Contact: "+user['phone']+"</p>";
        }
        $('#user-info').html(output);
        console.log(output);
    },

    getPhoto: function(){
        //alert("hello");
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
            destinationType: Camera.DestinationType.FILE_URI, encodingType: Camera.EncodingType.JPEG, targetWidth:500, targetHeight:700 });

        function onSuccess(imageURI) {
            var image = document.getElementById('certi-photo');
            image.src = imageURI;
            image.style.display = 'block';
            // document.getElementById('upload-form').style.display = 'block';
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
    },

    uploadPhoto: function(edate, cname){
        var imageURI = document.getElementById('certi-photo').getAttribute("src");
        if (!imageURI) {
            alert('Please select an image first.');
            return;
        }
        //

        //
        var options = new FileUploadOptions();
        // var fileName = $.md5(localStorage.email)+".jpg";
        // alert(fileName);
        // 
        options.fileKey="file";
        // options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.fileName=localStorage.uid;
        options.mimeType="image/jpeg";
        options.chunkedMode = false;
        
        var params = new Object();
        params.edate = edate;
        params.cName = cname;
        params.uid = localStorage.uid;

        options.params = params;
        

        var ft = new FileTransfer();
        ft.upload(imageURI, "http://itccprojects.com.au/appandroid/uploadFile.php", win, fail, options);

        function win(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            //alert(r.response);
            var image = document.getElementById('certi-photo');
            image.src = '';
            image.style.display = 'none';
            // document.getElementById('btnUpload').style.display = 'none';
        }
 
        function fail(error) {
            alert("An error has occurred: Code = " + error.code);
        }

    },

    addReminder: function(start, end, cname){
        // prep some variables
        var startDate = new Date(start); // beware: month 0 = january, 11 = december
        var endDate = new Date(start);
        //var endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+1,0,0,0,0,0);
        var title = cname;
        var eventLocation = "";
        var notes = cname+" Certificate Expire Reminder";
        var success = function(message) { 
            //alert("Success: " + JSON.stringify(message)); 
            alert("Success: Add a Reminder on "+ start);
        };
        var error = function(message) { alert("Error: " + message); };

        window.plugins.calendar.createEvent(title,eventLocation,notes,startDate,endDate,success,error);
    },

    getRSSFeed: function(feed){
        // Build the YQL query
        var qryRSS = 'select * from rss where url='+'"'+feed+'"';
        //alert(qryRSS);
        // Initiate the YQL query
        $.getJSON("http://query.yahooapis.com/v1/public/yql",
        {
            // These are the settings for your API call
            q: qryRSS,
            format: "json"
        },
        // Take the data you got from the YQL server and output it to the screen.  The variable "data" holds the JSON you got back from the YQL server.
        function(data) {
            // alert(ata.query.results.item[0].title);
            // Just bother with the last 10 entries within the JSON feed
            for (i=0; i<data.query.count; i++)
              {
              // Output the title attribute
              var html = '<div data-role="collapsible" data-inset="false">'+'<h3>'+data.query.results.item[i].title+'</h3>'+'<div>'+data.query.results.item[i].encoded+'</div>'+'</div>';
              $('#accordion').append(html);
              console.log(html);
              // Output the description, using the description attribute. 
              // $('#accordion').append('<div>'+data.query.results.item[i].description+'</div>'+'</div>');
              // alert(i);
            }
            // Trigger the accordian
            // $(function() {
            //     $( "#accordion" ).accordion();
            // });
        });
    }
};

var signOut = function(){
    window.localStorage.clear();
    // localStorage.login = "";
    // localStorage.email = "";
    // localStorage.uid = "";
    //alert("aaaa");
    // window.location.href = "certificates.html";
    window.location.href = "index.html";
}

function getCourse(){
    //alert("getCourse");
    if (localStorage.login == "true" && localStorage.getItem("uid")!= null) {
        var dataString = "uid="+localStorage.uid;
        //alert(dataString);
        $.ajax({
            //type: "POST",
            url: "http://itccprojects.com.au/appandroid/getcourse.php",
            //jsonp: "login",
            data: dataString,
            dataType: "jsonp",
            
            success: function(data){
                //alert("aaaa");
                console.log(data);
                if(data['count'] > 0){                   
                    localStorage.setItem('courses', JSON.stringify(data['courses']));
                    var output = '';
                    // <div data-role="collapsible" data-inset="false">
                    //     <h3>Traffic Management Course at Rowville</h3>
                    //     <ul data-role="listview">
                    //         <li>Start Date: Wed, Mar 2 2016</li>
                    //         <li>End Date: Wed, Mar 2 2016</li>
                    //         <li>Time: 8:00 AM - 4:00 PM</li>
                    //         <li>Location: Rowville</li> 
                    //     </ul>
                    // </div>
                    for(i=0; i<data['count']; i++){
                        output += "<div data-role='collapsible' data-inset='false'>";
                        output += '<h3>'+data['courses'][i]['title']+'</h3>';
                        output += "<ul data-role='listview'>";
                        var start = new Date(data['courses'][i]['start']);
                        output += "<li>Start Date: "+start.toDateString()+"</li>";
                        var end = new Date(data['courses'][i]['end']);                  
                        output += "<li>End Date: "+end.toDateString()+"</li>";                   
                        output += "<li>Time: "+data['courses'][i]['session']+"</li>";                   
                        output += "<li>Location: "+data['courses'][i]['location']+"</li>";                   
                        output += "</ul>";
                        output += "</div>";
                    }
                    $('#course-list').html(output);
                }
            }
        });
    }
}

function getCert(){
    if(localStorage.login == "true" && localStorage.getItem("uid")!= null){
        var dataString = "uid="+localStorage.uid;
        $.ajax({
            //type: "POST",
            url: "http://itccprojects.com.au/appandroid/getcerti.php",
            //jsonp: "login",
            data: dataString,
            dataType: "jsonp",
            
            success: function(data){
                //alert("aaaa");
                console.log(data);
                if(data['count'] > 0){                   
                    //localStorage.setItem('certificates', JSON.stringify(data['certificates']));
                    var output = '';
                    // <li><a href="#">
                    //     <img src="http://itccprojects.com.au/appandroid/upload/img/0efc6a6c4d42180415bf5d077e1be73c.jpg">
                    //     <h2>Certificates A</h2>
                    //     <p>Expire Date: 10/05/2016</p></a>
                    // </li>
                    for(i=0; i<data['count']; i++){
                        // output += "<li><a href='#img-"+i+"' data-rel='popup'>";
                        // output += "<img src='"+data['certificates'][i]['image']+"''>";
                        // output += "<h2>"+data['certificates'][i]['name']+"</h2>";
                        // output += "<p>Expire Date: "+data['certificates'][i]['end']+"</p></a>";
                        // output += "<div data-role='popup' id='img-"+i+"'>";
                        // output += "<p><img src='"+data['certificates'][i]['image']+"''></p>";
                        // output += "</div>";
                        // output += "</li>";
                        output += "<li>";
                        output += "<img src='"+data['certificates'][i]['image']+"''>";
                        output += "<h2>"+data['certificates'][i]['name']+"</h2>";
                        output += "<p>Expire Date: "+data['certificates'][i]['end']+"</p></a>";
                        output += "</li>";
                    }
                    $('#certi-list').html(output);
                }
            }
        });
    }
}
