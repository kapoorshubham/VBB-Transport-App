const bookmarkForm = document.querySelector('#bookMarkForm');
const viewBmForm = document.querySelector('#viewBmForm');
const clearBmForm = document.querySelector('#clearBmForm');
const enquiryForm = document.querySelector('#enquiryForm');
const tableBody = document.querySelector('#table-content');
document.querySelector('.clearBmButton').style.display="none";


var clickedId;
var clickedName;
const result = [];
var bookmark;
var stopNames;
var ids;
var row;
var modes;
var modeName;
var modeId;
var departures;
var departureTimes;
const stopNamesArray = [];
const idsArray = [];
getStopNames();
viewBookmarkedStops();

function getStopNames () 
{
    enquiryForm.addEventListener('submit', function (e) 
    {
        document.querySelector('.clearBmButton').style.display="none";
        var from = enquiryForm.elements.inputFrom.value;
        if(!from){
            alert("Please enter a stop name!");
        }
        else{
            $("#stopsTable").addClass("table table-hover");
            $("th").css("border","2px solid black");
            $('#th1').text("#");
            $('#th2').text("Stops");
            $('#th3').text("Transports Available");
        }
        $('.rows').remove();
        e.preventDefault();
        $.getJSON("https://v5.vbb.transport.rest/locations?query=" + from + "&results=10", 
            function (data) 
            {
                for(var i=0; i<=data.length-1; i++) 
                {
                        stopNames = data[i].name;
                        ids = data[i].id;
                        modes = data[i].products;
                        stopNamesArray.push(stopNames);
                        idsArray.push(ids);
                        result[stopNamesArray[i]] = idsArray[i];

                        row = document.createElement('tr');
                        row.setAttribute("class", "rows");
                        
                        createBookmarks()
                        getLinks();
                        getModeNames();
                }
                window.onload = bookmarkStops();
            })
    });
}

function getStopDetails() {
    document.querySelector('.clearBmButton').style.display="none";
    $('#th1').text("Mode Name");
    $('#th2').text("Direction");
    $('#th3').text("Timing");
    $('.rows').remove();
    document.querySelector('.bookmarkButton').disabled = true;

    for(var key in result){
        if(key===clickedName){
            clickedId = result[key];
        }
    }

    $.getJSON("https://v5.vbb.transport.rest/stops/" + clickedId + "/departures?&duration=20",
    function (data) {
        if(data.length==0){
            alert("No upcoming departures in the next 20 minutes!");
        }
        for(var i=0; i<=data.length-1; i++) {

            row = document.createElement('tr');
            row.setAttribute("class", "rows");

            modeName = data[i].line.product;
            modeId = data[i].line.name;
            departures = data[i].direction;
            departureTimes = data[i].when;

            getDetailModeName();

            getDepartures();

            getDepartureTimes();
        }
    })
    
}

function bookmarkStops() {
    var checkedArray = [];
    document.querySelector('.bookmarkButton').disabled = true;

    $(".check").each(function() {
        $(this).change(function() {
        if(this.checked) {
          checkedArray.push(this.value);
          document.querySelector('.bookmarkButton').disabled = false;
        }
        else{
            checkedArray.pop(this.value);
            document.querySelector('.bookmarkButton').disabled = true;
        }
    });})

        bookmarkForm.addEventListener('submit', function (e) 
        {
            var i;
            e.preventDefault();
            for(i=0; i<=checkedArray.length-1; i++)
            {
                $.getJSON("https://v5.vbb.transport.rest/locations?query=" + checkedArray[i] + "&fuzzy=false&results=1", 
                function (data) 
                    {
                        localStorage.setItem(localStorage.length, JSON.stringify(data));
                    })
            }
            alert(i+" Stops bookmarked!");
        })
}

function viewBookmarkedStops () {

    if(localStorage.getItem('0')){
        $('.rows').remove();
        $("#stopsTable").addClass("table table-hover");
        $("th").css("border","2px solid black");
        $('#th1').text("#");
        $('#th2').text("Bookmarked Stops");
        $('#th3').text("Transports Available");
        clearBookmarks();
        saveBookmarkedStops();
    }
    viewBmForm.addEventListener('submit', function (e) 
        {
            if(localStorage.getItem('0')){
            viewBmForm.onsubmit = "index.html";
            }
            else{
                alert("No bookmarks to show!");
                e.preventDefault();
            }
        });
    
}

function getLinks () {
    const transportLinks = document.createElement('a');
    transportLinks.setAttribute("class", "links");
    const linkText = document.createTextNode(stopNames);
    const column = document.createElement('td');
    column.setAttribute("class", "columns");
    transportLinks.href = "javascript:";
    transportLinks.addEventListener("click", function()
        {
            clickedName = transportLinks.innerHTML;
            getStopDetails();
        });
    transportLinks.appendChild(linkText);
    column.append(transportLinks);
    row.append(column);
    tableBody.append(row);
}

function createBookmarks () {
    bookmark = document.createElement("input");
    bookmark.setAttribute("type", "checkbox");
    bookmark.setAttribute("class", "check");
    bookmark.setAttribute("value", stopNames);
    enquiryForm.append(bookmark);
    const column0 = document.createElement('td');
    column0.append(bookmark);
    row.append(column0);
    tableBody.append(row);
}

function getModeNames () {
    for(var key in modes){
        if(modes[key]===true)
        {
            const column2 = document.createElement('td');
            column2.setAttribute("class", "columns2");
            column2.append(key);
            row.append(column2);
            tableBody.append(row);
        }
    }
}

function getDetailModeName() {
    const column0 = document.createElement('td');
    column0.append(modeName);
    column0.append(` - ${modeId}`);
    row.append(column0);
    tableBody.append(row);
}

function getDepartures() {
    const column = document.createElement('td');
    column.setAttribute("class", "columns");
    column.append(departures);
    row.append(column);
    tableBody.append(row);
}

function getDepartureTimes () {
    var exactTime;
    if(departureTimes!== null)
    {
        exactTime = departureTimes.slice(11,19);
    }
    const column2 = document.createElement('td');
    column2.setAttribute("class", "columns2");
    column2.append(exactTime);
    row.append(column2);
    tableBody.append(row);
}

function clearBookmarks() {
    document.querySelector('.clearBmButton').style.display="block";
    clearBmForm.addEventListener('submit', function (e) 
        {
            if(localStorage.getItem('0')){
                if(confirm("Delete all bookmarks?")){
                    localStorage.clear();
                    alert("All bookmarks Deleted!");
                    clearBmForm.onsubmit = "index.html";
                    document.querySelector('.clearBmButton').style.display="none";
                } 
            }
            else{
                alert("Add more bookmarks to delete!")
                e.preventDefault();
            }
            
        })
}

function saveBookmarkedStops () {
    var data;
    for (let i = 0; i < localStorage.length; i++)
        {
            data=JSON.parse(localStorage.getItem(i));
            for(let j = 0; j < data.length; j++)
                {
                    stopNames = data[j].name;
                    ids = data[j].id;
                    modes = data[j].products;
                    stopNamesArray.push(stopNames);
                    idsArray.push(ids);
                    result[stopNamesArray[i]] = idsArray[i];
        
                    row = document.createElement('tr');
                    row.setAttribute("class", "rows");
                                
                    createBookmarks()
                    getLinks();
                    getModeNames();
                }
        }
}
