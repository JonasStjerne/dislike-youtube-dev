const apiKey = YOUR_API_KEY

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function main() {
    //Get video info from Youtube API
    var videoId = youtube_parser(window.location.href);
    httpGetAsync(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`,
    (result) => {
        resultParsed = JSON.parse(result);
        let videoInfo = resultParsed.items[0].statistics;

        //Set the dislike count
        // let likeElement = document.evaluate("//yt-formatted-string[contains(., 'Kan ikke lide')]", document, null, XPathResult.ANY_TYPE, null );
        // let ThisElement = likeElement.iterateNext();

        let ratingContainer = document.getElementsByClassName("top-level-buttons style-scope ytd-menu-renderer")[0];
        
        ratingContainer.childNodes[1].childNodes[0].childNodes[1].innerHTML = videoInfo.dislikeCount;

        //Calculate the like to dislike percent
        let likeDislikePercent = videoInfo.likeCount/(parseInt(videoInfo.likeCount) + parseInt(videoInfo.dislikeCount))*100;

        //Make and insert the like-dislike percent as a element
        var ratioElement = document.createElement("p");
        // ratioElement.innerHTML = Math.round(likeDislikePercent)+ "% likes";
        var ratioText = document.createTextNode(Math.round(likeDislikePercent)+ "% likes");
        ratioElement.appendChild(ratioText);

        ratingContainer.insertBefore(ratioElement,ratingContainer.childNodes[1]);
        console.log("ran");
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'pageChange') {
        main();
    }

});

main();

