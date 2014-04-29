var diameter = 550;


var color = d3.scale.linear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - 20, diameter - 20])
    .value(function(d) { return d.size; })

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 775 - margin.left - margin.right;
var height = 500 - margin.bottom - margin.top;

// var canvas = d3.select("#vis").append("svg").attr({
//     width: width + margin.left + margin.right,
//     height: height + margin.top + margin.bottom
//     })


var svg = d3.select("#detailVis").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

/**
 *  User likes and friends info
 */

var likesarray = [];
var present = false;

function addToLikes(nextPage) {
    if (typeof nextPage !== 'undefined') {
        d3.json(nextPage, function(error, d) {
            (d.data).map(function(d) {
              likesarray.push(d);
            });
            
            if (typeof d.paging !== 'undefined') {
              addToLikes(d.paging.next);
            }
            else {
              addToLikes(d.paging);
            }
        });
    }
    else {
      // pre-process data by category

      var numKeys = 0;
      var categoryMap = {}
      likesarray.forEach(function(val, idx) {
        if (!(val.category in categoryMap)) {
          categoryMap[val.category] = [];
          numKeys++;
        }

        categoryMap[val.category].push({name: val.name, id: val.id});
      
      });

      categoryMap["Other"] = [];

      function rest() {
        numKeys--;
        if (numKeys == 0) {
          flare = {}
          flare.name = "flare";

          // filter out the Categories with just one element
          categoryMapT = categoryMap
          categoryMap = {}
          d3.keys(categoryMapT).forEach(function(d) {
            if (categoryMapT[d].length != 1 || d == "Other")
              categoryMap[d] = categoryMapT[d];
          });

          flare.children = d3.keys(categoryMap).map(function(d) {
            return {name:d, size: 6725, 
              children: categoryMap[d].map(function(o) {
                return {name:o.name, size: 4000, id: o.id};
              })
            };
          });
          finishBubble(flare);
        }
      }

      d3.keys(categoryMap).forEach(function(d) {
        if (categoryMap[d].length == 1 && d != "Other") {
          categoryMap["Other"].push(categoryMap[d][0]);
        }
        rest();
      });
      
    }
}



// this is just for the details view
function finishBubble (root) {
        var focus = root,
            nodes = pack.nodes(root),
            view;

        var circle = svg.selectAll("circle")
            .data(nodes)
          .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { 
              var present = false;
              // TODO: check if d.id exists in pageIDs give it d3.rgb(201, 0, 122) instead of color(d.depth)
              pageIDs.map(function (id) {
                if (d.id == id)
                  present = true;
              })
              if (present)
                return "rgba(29, 164, 232, 0.5)";
              else
                return "rgba(187, 79, 255,0.50)";
            })
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        var text = svg.selectAll("text")
            .data(nodes)
          .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? null : "none"; })
            .text(function(d) { 
              if ((typeof d.children !== 'undefined' && d.children.length > 1) || d.parent.name != "flare")          
                return d.name.substring(0, 15);
              else 
                return "";
            });

        var node = svg.selectAll("circle,text");

        d3.select("#detailVis")
            //.style("background", color(10))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r]);

        function zoom(d) {
          var focus0 = focus; focus = d;

          var transition = d3.transition()
              .duration(d3.event.altKey ? 7500 : 750)
              .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r]);
                return function(t) { zoomTo(i(t)); };
              });

          transition.selectAll("text")
            .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
              .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
              .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
              .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v) {
          var k = root.r / v[2]; view = v;
          node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
          circle.attr("r", function(d) { return d.r * k; });
        }
      d3.select(self.frameElement).style("height", diameter + "px");
}

//TODO: pass id into bubble and instead of calling FB.api("me/likes") call FB.api("" + id + "/like");
// and in order make the vis less messy you might have to remove the details svg
function bubble(id) {

  // console.log("bubble is called");
  FB.api('/' + id, function(user) { 
    console.log(user.first_name, user.last_name);
    $('#detailsUser').text(user.first_name + ' ' + user.last_name + '\'s Likes');

  });

  // get the friend's likes on click, right now just gets user's likes
  FB.api(id+"/likes", function(res){
    if (typeof res.data !== 'undefined'){
      res.data.map(function(d) {
        likesarray.push(d);
      })
    }
   
    if (typeof res.paging !== 'undefined') {
      addToLikes(res.paging.next);
    }
    else {
      addToLikes(res.paging);
    }
  });   
  likesarray = [];
}



var diameter1 = 600,
    format = d3.format(",d"),
    color = d3.scale.category20c();




var bubble1 = d3.layout.pack()
    .sort(null)
    .size([diameter1, diameter1])
    .padding(1.5);

var svg1 = d3.select("#vis").append("svg")
       //     .style("background", color(-1))

     .attr("width", diameter1)
    .attr("height", diameter1)
    .attr("class", "bubble");

var clearAndUpdate = function(data) {
  d3.select("#detailVis").select("svg").remove();             
  svg = d3.select("#detailVis").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
  
  bubble(data);

}

var pageIDs = []
var userPageIDsDone = 0;
var jSite = ""

function json2(jsonSite) {
    if (jsonSite !== undefined) {
        d3.json(jsonSite, function(error, d) {

            (d.data).map(function(d) {
              pageIDs.push(d.id);
            })
            
            jSite = d.paging.next;
            
            json2(jSite);

        })
    }
// console.log(pageIDs);
userPageIDsDone = 1;
}


function collectNames(data) {
  (data.data).map(function (d) {
    pageIDs.push(d.id);
  })

  // TODO: check for data.paging undefined
  jSite = data.paging.next;

  json2(jSite);

}

// Responsible for the general view

function generalBubbles() {

  
  // gets all your friends

  FB.api('/me', function(user) {

      FB.api("me/likes", function (d) {
        collectNames(d); 
      })

      FB.api("me/friends",{
      fields:'id',
      limit:100
    },function(friends){

      // add number of mutual friends
      // TODO rank the friends and only keep the top 40 based on count_mf
      // rather than filtering out
      // TODO speedup

      var newfriends = [];
      friends.data.forEach(function(val, idx) {
        
        FB.api(val.id + "/likes", function(likes) {

        FB.api("/" + val.id + "/mutualfriends", function(res){
          if (typeof likes.data !== 'undefined' && likes.data.length){
                friends.data[idx].total = res.data.length;
                newfriends.push(friends.data[idx]); 
            }
            afterRankingDataAdded(friends.data.length);
        });
      
      
                 
        
        });
      });
     


      // after friends are ranked and filtered processing
      var rankedFriends = 0;
      function afterRankingDataAdded(max) {

        rankedFriends++;
        if (rankedFriends != max)
          return;

          // putting them in structure
          root = {}
          root.name = user.name;
          root.children = []
          newfriends.sort(function(a, b){   
              return -a.total+b.total;
            });
            newfriends.splice(40, newfriends.length-40);
          // friend names and genders, val is a friend's id and idx is the indexs
          newfriends.forEach(function(val, idx) {

            root.children.push({name: "Dummy name", size: 1400, id: val.id});

            FB.api('/' + val.id, function(friend) {
              root.children[idx].name = friend.name;
              root.children[idx].gender = friend.gender;
              friendNames(root.children.length);
            })
          });
      }

      var friendCount = 0;
      function friendNames(max) {
        friendCount++;
        if (friendCount != max)
          return;
        restBubbles();
      }

      function restBubbles () {
        var node = svg1.selectAll(".node")
        .data(bubble1.nodes(classes(root))
        .filter(function(d) { return !d.children; }))
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        //node.append("title")
         //   .text(function(d) { 
           //   return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) {

              // add colors for the two genders
              if (d.gender == "female")
                 return "rgba(187, 79, 255,0.50)";
              else
                return "rgba(29, 164, 232, 0.5)";
            })
            .on("click", function(d) { 
              clearAndUpdate(d.id);

            })
            .on("mouseover", function(d) {
              d3.select(this).style("fill", "black");

            })
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .on("mouseout", function(d) {

              d3.select(this).style("fill", function() {
              if (d.gender == "female")
                return "rgba(187, 79, 255,0.50)";
              else
               return "rgba(29, 164, 232, 0.5)";})
            });

        node.append("text")
            .attr("dy", ".3em")


            .style("text-anchor", "middle")
            .text(function(d) {
              var nameArray = (d.className).split(" ");
              //d3.select(this).text(nameArray[0])
              return nameArray[0].substring(0, d.r / 4)//  + '<br/>' + nameArray[nameArray.length - 1]
              ;
               })
            .attr({transform: "translate(0,-10)"})
            .attr("fill", "white")
            .attr("font-size", "15px");

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) {
              var nameArray = (d.className).split(" ");
              
              return nameArray[nameArray.length - 1].substring(0, d.r / 4);
               })
            .attr({transform: "translate(0,10)"})
            .attr("fill", "white")
            .attr("font-size", "12px");
      }
      
    });
  });

}

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size, gender: node.gender, id: node.id});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter1 + "px");


