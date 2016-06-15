// jshint esversion:6
$( document ).ready(function() {
  // ----------------------
  // - Global Variables -
  // ---------------------
  var baseUrl = "https://" + key + ":" + pass + "@" + user + ".cloudant.com/" + db;


  // -----------------------
  // - General Functions -
  // -----------------------

  // -- Read the Playlists for the DropDown --
  function refreshDropdown(playl) {
    playl = playl | false;
    $("#playlists").empty(); // Clear the DropDown

    var docUrl = baseUrl + "/"+"_design/Playlist/_view/getNames"; // URL of the Playlists view

    function parse(data) {
      var doc = JSON.parse(data); // Parse JSON Data into Obj. doc
      for(var i=0; i < doc.rows.length; i++) { // Go through each Document and insert into Dropdown
        $("#playlists").append(new Option(doc.rows[i].id, doc.rows[i].id)); // Set Value and Text of Select Option
      }
    }

    function parseFail(data) {
      $("#playlists").append(new Option("No Playlists found", 0)); // Set Value and Text of Select Option
    }

    ajaxGet(docUrl, parse, parseFail);

    if(playl) { // If new Playlist was created
      $("#playlists").select('refresh'); // Refresh Dropdown
      $("#playlists").val(playl); // Select the Value of the new Playlist
      readPlaylists(); // Read the Songs of the new Playlist
    }
  }

  // -- Create Autocomplete for artists-field --
  function artistAutocomplete() {
    var docUrl = baseUrl + "/"+"_design/Songs/_view/showArtists?group=true"; // URL to the Artists View
    var availableArtists = []; // Array for all Artists

    function parse(data) {
      var doc = JSON.parse(data); // Parse the JSON data
      for(var i=0; i < doc.rows.length; i++) {
        availableArtists.push(doc.rows[i].key); // Push the Artist to the Array
      }
      $( "#artistname" ).autocomplete({ // Activate Autocomplete
        source: availableArtists
      });
    }

    ajaxGet(docUrl, parse); // AJAX Call to load all Artists
  }

  // -- Create delete button for a song --
  function createDeleteButtons() {
    $(".delete-icon").css('cursor', 'pointer'); // Change cursor

    $(".delete-icon").hover(function () {
      this.src = 'img/delete_hover.png'; // Show this image on hover
    }, function () {
      this.src = 'img/delete_icon.png'; // Show this image when normal
    });

    $(".delete-icon").click(function () { // Delete this song
        goThroughSonglist($(this).closest("li").index()); // Go trough song-list an exclude this one
    });
  }

  // -- Iterate through the Songs and save them --
  function goThroughSonglist(deleter) {
    var songs = []; // Array for all songs
    var artist, song, id; // Define variables

    for(var p=0; p < $("#sortable li").length; p++) { // For all songs in the <ul> item
      if(p !== deleter) { // if the song should not be deleted
        artist = $("#sortable li:eq("+p+")").find("#artist").text(); // Search for div id=artist in <li>
        song = $("#sortable li:eq("+p+")").find("#song").text(); // Search for div id=song in <li>
        songs.push({"artist":artist,"title":song, "position":p}); // Push song in the array
      }
    }

    saveSortedSongs(songs); // Save the songs array
  }

  // -- Save the song list after it has been reordered --
  function saveSortedSongs(songs) {
    var docUrl = baseUrl + "/" + $( "#playlists" ).val(); // URL to get selected playlist

    function parseGet(data) {
      var doc = JSON.parse(data); // Parse data into Object
      doc.songs = songs;  // Replace songs - Array with the songs in the JSON
      ajaxPost(docUrl, parsePost, JSON.stringify(doc));
    }

    function parsePost(data) {
      showStatus("good", "<b>Status:</b> Updated Songs successfull"); // Show Status Message
      readPlaylists(); // Read Playlist again to verify update
    }

    ajaxGet(docUrl, parseGet); // Get the current playlist & proceed
  }

  // -- Read the current playlist --
  function readPlaylists()  {
    var docUrl = baseUrl + "/" + $( "#playlists" ).val(); // URL to get selected playlist

    function parse(data) {
      var doc = JSON.parse(data);
      showStatus("good", "<b>Status:</b> Reading successfull"); // Show Status Message
      handlePlaylist(doc); // Read all Songs in the playlist
    }
    ajaxGet(docUrl, parse); // AJAX Call to get Playlist
  }

  // --  Shows all Songs in a Playlist --
  function handlePlaylist(doc) {
    $( "#sortable" ).empty(); // Clears all Songs
    $( "#songs-playlist" ).text("Songs of "+doc._id); // Changes the title

    if(doc.songs.length > 0) { // If there are songs in the playlist
      for(var i = 0; i < doc.songs.length; i++) { // Add every Song to the Playlist
        $( "#sortable" ).append('<li class="song-item"><div class="song-list" id='+doc._id+'><div id="number" style="display:inline">'+(i+1)+'</div>) <div id="artist" style="display:inline">'+doc.songs[i].artist+'</div> - <div id="song" style="display:inline">'+doc.songs[i].title+'</div><img src="img/delete_icon.png" class="delete-icon" width="15" height=""></div></li>');
      }
    }else{ // If there are no songs in the playlist
      $( "#songs" ).append("No Songs included!"); // Show that no songs are available
    }

    createDeleteButtons(); // Create delete button for all songs
  }


  // ----------------------
  // - Helper Functions -
  // ----------------------

  // - AJAX GET -
  function ajaxGet(docUrl, func, funcFail) {
    funcFail = funcFail | 0;
    $.ajax({ // Start AJAX Call
      url: docUrl,
      crossDomain: true,
      xhrFields: { withCredentials: true },
      type: 'GET',
      error: errorHandler,
      complete: completeHandler
    }).done(func).fail(funcFail);
  }

  // - Ajax PUT -
  function ajaxPost(docUrl, func, myData) {
    $.ajax({ // AJAX Call
      url: docUrl,
      xhrFields: { withCredentials: true },
      type: "PUT",
      data: myData,
      contentType: "application/json",
      error: errorHandler,
      complete: completeHandler
    }).done(func);
  }

  // - Ajax DELETE -
  function ajaxDelete(docUrl, func) {
    $.ajax({  // AJAX Call
       url: docUrl,
       crossDomain: true,
       xhrFields: { withCredentials: true },
       type: "DELETE",
       error: errorHandler,
       complete: completeHandler
    }).done(func);
  }

  // - Handle AJAX Completion -
  function completeHandler(jqXHR, textStatus, errorThrown) {
    $.JSONView(jqXHR, $("#output-data")); // Add the default JSON error data
    $.JSONView(jqXHR.responseText, $("#output-resp")); // Add the default JSON error data
  }

  // - Handle AJAX errors -
  function errorHandler(jqXHR, textStatus, errorThrown) {
    $.JSONView(jqXHR, $("#output-data")); // Add the default JSON error data
    var error = "";

    if(jqXHR.status == "404") { // If status is 404
      error = "File not Found"; // say "File not Found"
    }else if(jqXHR.status == "409") { // If status is 409
      error = "Document update conflict (Documents already exists)"; // Say error-msg
    }else{
      error = jqXHR.status; // Else just say the error message
    }

    showStatus("bad", "<b>Status:</b> "+error); // Show Status Message
  }

  // - Show the Status Message on top of the page -
  function showStatus(mood, text) {
    if(mood == "bad") { // Depending on the "mood" change the color of the div
      $( "#wrapper-status" ).css( "background-color", "#C30"); // Change div color to red
    }else{
      $( "#wrapper-status" ).css( "background-color", "#390"); // Change div color to green
    }

    if ($("#wrapper-status").is(':visible')) { // When the div is visible
      $( "#toodle" ).append("</br>"+text); // Just appent the text
    }else{
      $( "#toodle" ).empty().append(text); // Add Message to the Error - div
      $( "#wrapper-status" ).show("Blind"); // Show the Error - div
      $("#wrapper-status").delay(5000).hide("Blind"); // Remove the Error - div after 5sec
    }
  }


  // -------------------
  // - Button Events -
  // -------------------

  // -- On create --
   $( "#create" ).click(function( event ) {
     var newplaylist = $( "#newplaylistname" ).val();
      function parsePost(data) {
        var doc = JSON.parse(data);
        $( "#toodle" ).text("Test");
        $( "#newplaylistname" ).val("");
        refreshDropdown(newplaylist); // Refresh the DropDown Menu
      }

      if(newplaylist) {
        ajaxPost(baseUrl+ "/" + newplaylist, parsePost, JSON.stringify({type: "playlist", songs: []}));
      }
   });

   // -- On read --
   $( "#read" ).click(function( event ) {
        readPlaylists(); // Read the Playlist
   });

   // -- On update --
   $( "#update" ).click(function( event ) {
      var playlist = $( "#playlists" ).val();
      var artist = $( "#artistname" ).val();
      var song = $( "#songname" ).val();
      var pos = 0;

      var docUrl = baseUrl + "/" + playlist;

      function parseGet(data) {
        var doc = JSON.parse(data);
        pos = doc.songs.length;
        doc.songs.push({"artist":artist,"title":song, "position":pos});
        ajaxPost(docUrl, parsePost, JSON.stringify(doc));
      }

      function parsePost(data) {
        var doc = JSON.parse(data);
        $.JSONView(doc, $("#output-data")); // Create JSON optimized text-output
        showStatus("good", "<b>Status:</b> Update successfull"); // Show Status Message
        $( "#artistname" ).val("");
        $( "#songname" ).val("");
        readPlaylists(); // Read Playlist again to verify update
      }

      if(playlist && artist && song) {
        ajaxGet(docUrl, parseGet);
      }
   });

   // -- On delete --
   $( "#delete" ).click(function( event ) {
      var playlist = $( "#playlists" ).val();
      var docUrl = baseUrl + "/" + playlist;

      function parseGet(data) {
        var doc = JSON.parse(data);
        docUrl += "?rev=" + doc._rev;
        ajaxDelete(docUrl, parseDelete);
      }

      function parseDelete(data) {
        var doc = JSON.parse(data);
        $.JSONView(doc, $("#output-data")); // Create JSON optimized text-output
        refreshDropdown(); // DropDown aktualisieren
        showStatus("good", "<b>Status:</b> Successfully deleted"); // Show Status Message
        $( "#songs-playlist" ).text(""); // Delete the songs title
      }

      if(playlist) {
        ajaxGet(docUrl, parseGet);
      }
   });

   // -- Sortable --
  $( "#sortable" ).on( "sortstop", function( event, ui ) {
     var newIndex = Number(ui.item.index());
     var oldIndex = Number($(this).attr('data-previndex'));

     $(this).removeAttr('data-previndex');
     if(newIndex-oldIndex > 0) {
       for(var i=0; i <= newIndex-oldIndex; i++) {
         $("#sortable li:eq("+(oldIndex+i)+")").find("#number").text(oldIndex+i+1);
       }
     }else if(newIndex-oldIndex < 0) {
       for(var o=(newIndex-oldIndex)+1; o <= oldIndex; o++) {
         $("#sortable li:eq("+(oldIndex-o)+")").find("#number").text(oldIndex-o+1);
       }
     }

    if(newIndex-oldIndex !== 0) {
      goThroughSonglist(-1);
    }
  });

  $( "#sortable" ).on( "sortstart", function(e, ui) {
      ($(this).attr('data-previndex', ui.item.index()));
    });


  // -------------------
  // - Start Settings -
  // -------------------

  // - On Load of the Website -
  window.onload = function() {
      refreshDropdown(); // Refresh/Load the Playlist DropDown
      $( "#wrapper-status" ).hide(); // Hide the Container including status messages

      artistAutocomplete();

      var doc = "{}";
      $.JSONView(doc, $("#output-data")); // Add the default JSON '{}' to the JSON Output container

      $( "#sortable" ).sortable();
      $( "#sortable" ).disableSelection(); // Disable Text-Selection on sortables
      $( "#sortable" ).sortable({ axis: "y" });
      $( "#sortable" ).sortable({ cursor: "move" });
    };
});
