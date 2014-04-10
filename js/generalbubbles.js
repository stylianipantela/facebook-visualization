
var diameter1 = 800,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter1, diameter1])
    .padding(1.5);

var svg1 = d3.select("#vis").append("svg")
     .attr("width", diameter1)
    .attr("height", diameter1)
    .attr("class", "bubble");


function generalBubbles() {
  FB.api('/me', function(user) {
      FB.api("me/friends",{
      fields:'id',
      limit:40
    },function(friends){
      root = {}
      root.name = user.name;
      root.children = []
      friends.data.forEach(function (d, idx) {
        root.children.push({name: "Stella", size: 1400, id: d.id});
      });

      // friend names and genders
      friends.data.forEach(function(val, idx) {
        FB.api('/' + val.id, function(friend) {
          root.children[idx].name = friend.name;
          root.children[idx].gender = friend.gender;
          friendNames(root.children.length);
        })
      });

      var friendCount = 0;
      function friendNames(max) {
        friendCount++;
        if (friendCount != max)
          return;
        // console.log(root);
        restBubbles();
      }


      function restBubbles () {
        var node = svg1.selectAll(".node")
        .data(bubble.nodes(classes(root))
        .filter(function(d) { return !d.children; }))
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) {

              // add colors for the two genders
              if (d.gender == "female")
                return d3.rgb(255, 0, 0);
              else
                return d3.rgb(0, 0, 255);
            });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className.substring(0, d.r / 3); });
      }
      
    });
  });

}


// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    console.log(name, node);
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size, gender: node.gender, id: node.id});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter1 + "px");


