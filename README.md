Cloudant Songs Example
=================

##Live action?
Demo available via: http://cloudant-songs.mybluemix.net

##Description
A very simple app that demonstrates how CRUD (Create, Read, Update, Delete) instructions are used with **IBM Cloudant** and **Javascript / HTML5**.

With the app you can **create/delete** playlists, **add/remove** songs and **reorder** the songs,

The app is just quickly hacked to demonstrate Cloudant CRUD instructions, no awareness given to optimized or good coding! It's developed to be displayed on Safari, no work was done to make it a responsive Web app.

##Screenshots
The interface:<br />
<img src="https://raw.githubusercontent.com/DeMoehn/Cloudant-songs/master/github-data/app-overview.png" width="500"/>

See what happens behind the curtains:<br />
<img src="https://raw.githubusercontent.com/DeMoehn/Cloudant-songs/master/github-data/app-log.png" width="500"/>

Load and reorder Playlists:<br />
<img src="https://raw.githubusercontent.com/DeMoehn/Cloudant-songs/master/github-data/app-playlist.png" width="500"/>

Autofill:<br />
<img src="https://raw.githubusercontent.com/DeMoehn/Cloudant-songs/master/github-data/app-autofill.png" width="500"/>


##Deploy on IBM Bluemix
* Login to IBM Bluemix via the CF Command Line Tool
```
      $ cf login
```

* Change to the app directory and push the inital application via (Change APPN-AME!):
```
      $ cf push APP-NAME -m 64M -b https://github.com/cloudfoundry/staticfile-buildpack.git -s cflinuxfs2
```

* To add Git-Integration go to: https://hub.jazz.net/ and either login or create an account

* Create a new Project and choose "From an existing Git Project" and choose your Git Project

* Use the "Build&Deploy" Button (upper right)

* Create a new Phase, make sure the GIT URL is correct, and tick the box "Run job, when GIT Repo changes"

* Choose "Jobs" add a new "Deploy" Job and make sure to change the script to only include the app/ directory (otherwise Jazzhub pushes the whole repo!)
```
#!/bin/bash
cf push "${CF_APP}" -p app/
```


##Changes
Original from: millayr
- Added a DropDown for Playlists
- Added a Cloudant Response and Response Text
- Added Status Messages
- Added JSON Formatting
- Added Songs View
- Added Sortable Songs
- Added Deletable Songs
- Added Playlist Autocompletion
