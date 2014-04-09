
/**
 *  Custom facebook login that requires user_likes and friends_likes
 */
function invisible(){
   document.getElementById("fbpic").style.visibility = "hidden";
}


function fbLogin() {
    FB.login(function(response) {
           // handle the response
         }, {scope: 'user_likes, friends_likes'});
}

/**
 *  User likes and friends info
 */

function fbUserInfo() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Good to see you, '+ response.name + '.');
  });

  FB.api("me/likes", function(res){
    console.log('My likes');
    console.log(res);
  });
}


/**
 *  Costum facebook login that requires user_likes and friends_likes
 *  limit: number of friends to get likes for
 *  TODO: concatenate the data lists from the different pages into one data list and return that
 *  iterate through res in the likes call and create the following object:
 *  object{
      friendid1: [likes] (this is a result of pagination)
      friendid2: [likes]
 *  }
 */
function fbFriendsLikes(limit) {
  FB.api("me/friends",{
    fields:'id',
    limit:limit
  },function(res){
    // console.log(res);
    var l=''
    $.each(res.data,function(idx,val){
       l=l+val.id+(idx<res.data.length-1?',':'')
    })
    FB.api("likes?ids="+l,function(res){
        console.log("friend's likes");
        console.log(res);
    })
  })

}

window.fbAsyncInit = function() {
  FB.init({
    appId      : id,
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });

  // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  // for any authentication related change, such as login, logout or session refresh. This means that
  // whenever someone who was previously logged out tries to log in again, the correct case below 
  // will be handled. 
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    console.log("Event subscribe is fired");
    // Here we specify what we do with the response anytime this event occurs. 
    if (response.status === 'connected') {
      // The response object is returned with a status field that lets the app know the current
      // login status of the person. In this case, we're handling the situation where they 
      // have logged in to the app.
      testAPI();
      if (collapsibleTreeVar) {
        collapsibleTree();
      }


    } else if (response.status === 'not_authorized') {
      // In this case, the person is logged into Facebook, but not into the app, so we call
      // FB.login() to prompt them to do so. 
      // In real-life usage, you wouldn't want to immediately prompt someone to login 
      // like this, for two reasons:
      // (1) JavaScript created popup windows are blocked by most browsers unless they 
      // result from direct interaction from people using the app (such as a mouse click)
      // (2) it is a bad experience to be continually prompted to login upon page load.
      // FB.login();
      fbLogin();

    } else {
      // In this case, the person is not logged into Facebook, so we call the login() 
      // function to prompt them to do so. Note that at this stage there is no indication
      // of whether they are logged into the app. If they aren't then they'll see the Login
      // dialog right after they log in to Facebook. 
      // The same caveats as above apply to the FB.login() call here.
      // FB.login();
      fbLogin();

    }
  });
  };

  // Load the SDK asynchronously
  (function(d){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all.js";
   ref.parentNode.insertBefore(js, ref);
  }(document));

  // Here we run a very simple test of the Graph API after login is successful. 
  // This testAPI() function is only called in those cases. 
  function testAPI() {
    fbUserInfo();    
    fbFriendsLikes(20);
  }

