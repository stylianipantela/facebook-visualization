var diameter = 960,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

function bubbles(res) {
FB.api('/me', function(user) {
      FB.api("me/friends",{
      fields:'id',
      limit:40
    },function(friends){
      var l=''
      friends.data.forEach(function(val,idx){
         l=l+val.id+(idx<friends.data.length-1?',':'')
      })

      FB.api("likes?ids="+l,function(res){
          console.log(res);
          flare = {}
          flare.name = user.name;
          flare.children = d3.keys(res).map(function(d) {
            return {name:d, size: 6725, 
              children: res[d].data.map(function(o) {
                return {name:o.name, sizE: 4000};
              })
            };
          });
          friends.data.forEach(function(val, idx) {
            FB.api('/' + val.id, function(friend) {
              flare.children[idx].name = friend.name;
              friendNames(flare.children.length);
            })
          });

          var friendCount = 0;
          function friendNames(max) {
            friendCount++;
            if (friendCount != max)
              return;
            // original code
            root = flare;
            root.x0 = height / 2;
            root.y0 = 0;

            function collapse(d) {
              if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
              }
            }

            root.children.forEach(collapse);
            update(root);


            console.log(flare);
          }
      })
    }); 
  });


}










function update(source){
 
  var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.packageName); });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.className.substring(0, d.r / 3); });
};

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

