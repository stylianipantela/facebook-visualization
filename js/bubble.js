var diameter = 500;

var color = d3.scale.linear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - 20, diameter - 20])
    .value(function(d) { return d.size; })

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


/**
 *  User likes and friends info
 */

var likesarray = [];

function addToLikes(nextPage) {
  // console.log(nextPage);
    if (typeof nextPage !== 'undefined') {
        d3.json(nextPage, function(error, d) {
            (d.data).map(function(d) {
              likesarray.push(d);
            });
            
            addToLikes(d.paging.next);
        });
    }
    else {
      // console.log(likesarray);
      // pre-process data by category

      var numKeys = 0;
      var categoryMap = {}
      likesarray.forEach(function(val, idx) {
        if (!(val.category in categoryMap)) {
          categoryMap[val.category] = [];
          numKeys++;
        }

        categoryMap[val.category].push({name: val.name});
      
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
                return {name:o.name, size: 4000};
              })
            };
          });
          console.log(flare);
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

function finishBubble (root) {
        var focus = root,
            nodes = pack.nodes(root),
            view;

        var circle = svg.selectAll("circle")
            .data(nodes)
          .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
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

        d3.select("body")
            .style("background", color(-1))
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

function bubble () {

    // get the friend's likes on click, right now just gets user's likes
    FB.api("me/likes", function(res){
      (res.data).map(function(d) {
        likesarray.push(d);
      })
      addToLikes(res.paging.next);
    });   
}

