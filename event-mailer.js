/**
 * A script to install into google app scripts
 * https://www.google.com/script/start/
 * That will email your agenda for the next day whenever
 * you specify a trigger. (I set it daily at 8-9pm)
 *
 * Why? I use this to remind me via personal email what I'm
 * going to be doing the next day at work without having to
 * load my whole work google account onto my phone.
 */

function timeConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}

function getEventsAndMail() {
  // message defaults - set to address in the script properties
  // File -> Project Properties -> Script properties tab
  var scriptProps = PropertiesService.getScriptProperties();
  var mailTo = scriptProps.getProperty('MAILTO');
  var subject = "Weekly Family Schedule"
  var calendarId = ""; //PUT ID HERE
  var message = '';
  var timeSplit;
  var startSplit;
  var endSplit;
  var niceTime;
  var niceStart;
  var niceEnd;
  var eventLoc;
  var locSplit;
  var niceLoc = '';
  var dateOfEvent;

  // event data
  var messageEvents = [];
  var events;
  var eventTime;
  var eventTitle;
  
  function createList() {
        startSplit = events[i].getStartTime().toTimeString().split(':');
        niceStart = startSplit[0] + ':' + startSplit[1]
        endSplit = events[i].getEndTime().toTimeString().split(':');
        niceEnd = endSplit[0] + ':' + endSplit[1];
        dateOfEvent = events[i].getStartTime().toDateString();
        eventLoc = events[i].getLocation();
        niceLoc = '';
        if (eventLoc) {
          locSplit = eventLoc.split('(');
          niceLoc = ' at ' + locSplit[0].trim()
        }
    if(niceStart == "00:00" && niceEnd == "23:59") { //12AM to 11:59PM
      message += '     ALL DAY' + ":   " + events[i].getTitle().trim() + "\n\t"
          + niceLoc + "\n\n";
    } else {
      message += '     ' + timeConvert(niceStart) + ' - ' + timeConvert(niceEnd) + ":   " + events[i].getTitle().trim() + "\n\t"
          + niceLoc + "\n\n";
    }
  }

  // Get Date objects for tomorrow morning and night
  var d = new Date();
  d.setHours(0,0,0,-5);
  d.setDate(d.getDate() + 1);
  var tomorrowAm = new Date(d);
  d.setDate(d.getDate() + 7);
  var tomorrowPm = new Date(d)

  // not a weekend
  // if (tomorrowAm.getDay() !== 4) {
    // get the events
    events = CalendarApp.getCalendarById(calendarId).getEvents(tomorrowAm, tomorrowPm);

    if (!events.length) {
      subject = 'Weekly Family Schedule: None This Week';
      message = "Nothing on the schedule for family this week";
    } else {
      // create the list
      var i = 0;
      var starter = 3;
      var eventDay = starter; //Starting on Wednesday
      message = "Weekly Calendar from Google's Neal Family Calendar \n\n\n";
      var dayOfWeek = events[i].getStartTime().toDateString();
       for (i = 0; i < events.length; i++) {
         var temp = events[i].getStartTime().getDay();
         var test = events[i].getStartTime();
         if(starter === temp) {
           message += dayOfWeek + "\n\n";
           createList();
         }
         else if(temp === eventDay) {
             createList()
           } else {
             eventDay = temp;
             dayOfWeek= events[i].getStartTime().toDateString();
             message += dayOfWeek + "\n\n";
             createList();
           }
       }
    }

    MailApp.sendEmail(mailTo, subject, message);
  //}
}
