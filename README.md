facebook-visualization
======================

Visualization of Facebook Data of you and your network

###Background and Motivation. Discuss your motivations and reasons for choosing this project, especially any background or research interests that may have influenced your decision.


We believe that Social Media serves multiple purposes, and among those are to connect distanced individuals online and also to help share individual interests in hopes of connecting people not only because of an established acquaintanceship, but also because of a mutual interest (or many).   
We would like to use the Facebook API to obtain information from users, helping us visualize not only their friendships, but also their likes (and thus, interests).  This can both serve to help display/evaluate possible interests that are holding a virtual “friend group” together, as well as display simple trends that come about and fade away over time.

###Project Objectives. Provide the primary questions you are trying to answer with your visualization. What would you like to learn and accomplish? List the benefits. What do a given user’s friends, and the user himself, seem to like the most?

Does location of user noticeably have a causational/correlational effect the information retrieved?
Generally, we would like to simply use this information to learn more about interests among users and visualize trends that otherwise would not have been. This is particularly important for both Facebook users and the outside world, because the users would attempt to perfect what they signed up online to show off –their image, while the outside world have an idea of what is currently the trending concept/good/activity in which it must capitalize on to maximize either public efficiency or overall happiness.

Data. From where and how are you collecting your data? If appropriate, provide a link to your data sources.
We are collecting our data from the Facebook API. Basically once a user gives us access to their account we collect information on their friends, their facebook likes of various categories - including but not limited to Movies, TV shows and Sports. At the same, again through the API we get information on how many people have liked a specific page.

###Data Processing. Do you expect to do substantial data cleanup? What quantities do you plan to derive from your data? How will data processing be implemented?

We do not expect that we need to do major data cleaning but we will be doing filtering.  As we said above we can get statistics for single pages on facebook. That can help us determine the most important pages to a person and filter out the noise. Our assumption is that the less people that like a page the more relevant the page is to a person.

###Visualization. How will you display your data? Provide some general ideas that you have for the visualization design. Include sketches of your design.
    
Tentatively we imagine visualizing this data in the form of “Stacked-to-group” bars “bl.ocks.org/mbostock/3943967” or possibly a streamgraph, showing the density of likes for the specific data. We believe that the visual representation of these collected metrics could provide valuable insights upon where users interests lie, and how this correlates with other users data. 

###Must-Have Features. These are features without which you would consider your project to be a failure.

Our visualization would ideally employ techniques in order to highlight specific parts of data. This could range anywhere from highlights, to data transparency, to overlays. Additionally, if possible, we would show the aggregation of likes over time which would help employ a stream graph. We would have the option to show three different visualizations for the data. 

###Optional Features. Those features which you consider would be nice to have, but not critical.

It would be nice to provide numerical metrics for a user’s profile data in order to  streamline the process of obtaining numerical data. 

###Project Schedule. Make sure that you plan your work so that you can avoid a big rush right before the final project deadline, and delegate different modules and responsibilities among your team members. Write this in terms of weekly deadlines. 

End of spring break: Setup the facebook login for users and be able to save the data in a json file.
April 14th: Implement the network visualization
April 21st: Read facebook data and implement filtering
April 28th: Add the cleaned data to the network
May 1st: Focus on the data representation and the user experience/ Potentially add more visualizations.
