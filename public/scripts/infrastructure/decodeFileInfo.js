function decodeFileInfo(fileName, folderName) {
  var originalFileName = fileName;
  var output = { title: "", series: "", fullEp: "", season: "0", ep: "0" }

  fileName = removeUselessLabels(fileName);
  var episodeLabel = findEpisodeLabel(fileName);
  if(episodeLabel != null) {
    output.fullEp = createEpisodeString(episodeLabel);
    fileName = fileName.replace(episodeLabel, "-");
  }

  findTitleAndSeries(fileName, folderName);
  
  if(output.series == "") {
    output.fullTitle = output.title;
  } else if(output.title == "") {
    output.fullTitle = output.series;
  } else {
    output.fullTitle = output.series + " - " +  output.title;
  }
  
  return output;

  function removeUselessLabels(s) {
    var ignored = [
      "\\.eng+\\.", "720p", "hdtv", "x264", "dvd-?rip",
      "xvid", "(dv)?divx", "\\.ws\\.", "ac3", "ds-?rip", "TDKeD2k",
      "widescreen", "-[0-9A-Z]*\\.", "\.[a-z]{1,2}tv", "klaxxon", "axxo",
      "\\[.*\\]", "\\(.*\\)", "\\{.*\\}", 
      "(\\.[^\.]*)$", "_", " "
    ];

    for(var i=0;i<ignored.length;i++) {
      var regexp = new RegExp(ignored[i], "ig");
      s = s.replace(regexp, ".");
    }

    s = s.replace(/\.+/g, " ").trim();
    return s;
  }

  function findEpisodeLabel(s) {
    var label = s.match(/s?[0-9]{1,2}(e|x|-)?[0-9]{1,2}/i);
    return label != null ? label[0] : null;
  }

  function createEpisodeString(s) {
    s = s.replace(/s|e|x|-/ig, "")
    switch (s.length) {
      case 2: 
        output.season = "00";
        output.ep = s; 
        break;
      case 3:
        output.season = "0" + s.substring(0, 1); 
        output.ep = s.substring(1, 3);
        break;
      case 4:
        output.season = s.substring(0, 2);
        output.ep = s.substring(2, 4);
        break;
    }
    return "S" + output.season + "E" + output.ep;
  }

  function findTitleAndSeries(s, defaultSeries) {
    var splits = s.split("-")
    var split1 = ("" + splits[0]).trim();
    var split2 = ("" + splits[splits.length - 1]).trim();
    if(split2 == split1) split2 = "";
    
    if(split1 == "" && split2 != "") {
      output.series = defaultSeries;
      output.title = split2;
    } else if(split1 != "" && split2 == "") {
      if(output.fullEp != "") {
        output.title = output.fullEp;
        output.series = split1;
      } else {
        output.title = split1;
        output.series = "";
      }
    } else if(split1 == "" && split2 == "") {
      if(output.fullEp == "") {
        output.title = s;
      } else {
        output.title = output.fullEp;
        output.series = defaultSeries;        

      }
    } else {
      output.series = split1.trim();
      output.title = split2.trim();
    }
  }
}

