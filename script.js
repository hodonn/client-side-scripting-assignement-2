//Search button even listener, the page is static until "Search!" is clicked
document.getElementById('sendSearchButton').addEventListener('click', async () => {
    //Gets the string that the user entered in the search box
    const searchTerm = document.getElementById('searchInput').value;

    let queryType = 'PLACEHOLDER';
    //Checks which radio button is selected
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            queryType = radioButtons[i].value;
        }
    }

    //This line was used in testing to see if the url was formed correctly before calling any other functions
    //console.log(`https://spotify23.p.rapidapi.com/search/?q=${searchTerm}&type=${queryType}&offset=0&limit=1&numberOfTopResults=1`);

    //Removes any other cards before starting a new search. The ability to have multiple cards at once was planned, but in practice there will only be one at a time
    const container = document.getElementById('spotify-container');
    const cards = container.querySelectorAll('.spotify-data');
    cards.forEach(card => {
        container.removeChild(card);
    })

    //Chooses which search function to call based on the selected radio button
    switch (queryType) {
        case 'tracks':
            getTrackDataSpotify(searchTerm, queryType);
            break;
        case 'albums':
            getAlbumDataSpotify(searchTerm, queryType);
            break;
        case 'artists':
            getArtistDataSpotify(searchTerm, queryType);
            break;
        default:
            break;
    }
});

//This function gets information about tracks
async function getTrackDataSpotify(searchTerm, queryType)
{
    //Defines the search url and API key
    const url = `https://spotify23.p.rapidapi.com/search/?q=${searchTerm}&type=${queryType}&offset=0&limit=1&numberOfTopResults=1`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '7324dd00c5msh75047e3c5dcceb7p1210e2jsnac430d4f2133',
            'x-rapidapi-host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        //Getting JSON data from the API
        const response = await fetch(url, options);
        const trackData = await response.json();

        //This was used in testing to print the raw JSON to the console
        //const result = await response.text();
        //console.log(result);

        //The forEach() is not necessary as the search will only return the top result, a "see more results" option was planned
        trackData.tracks.items.forEach(song => {
            //Creates the "card" div, where the results of the search will be displayed
            const card = document.createElement('div');
            card.classList.add('spotify-data')
            
            //Gets the track ID. The first 14 characters are removed with slice() as they are always "spotify:track:" and cannot be used in a url
            //The track ID is used for getting data from other endpoints
            const trackID = song.data.uri.slice(14);

            //Creates the h1 for the song title
            const songTitle = document.createElement('h1');
            songTitle.textContent = song.data.name;
            
            //Creates the img for the cover art, sets the source url and alt text
            const coverArt = document.createElement ('img');
            coverArt.src = song.data.albumOfTrack.coverArt.sources[2].url;
            coverArt.alt = song.data.name;

            //Creating paragraphs for the artist and album text. innerHTML is used to make part of the text bold, which is styled to be green in the css
            const artistName = document.createElement('p');
            artistName.innerHTML = '<strong>Artist: </strong>' + song.data.artists.items[0].profile.name;
            const albumTitle = document.createElement('p');
            albumTitle.innerHTML = '<strong>Album: </strong>' + song.data.albumOfTrack.name;
      
            //Creating a paragraph for the duration. The duration is given in milliseconds, so it is sent to another function to be displayed as minutes and seconds
            const duration = document.createElement('p');
            duration.innerHTML = '<strong>Duration: </strong>' + millisecondsToMinutesAndSeconds(parseInt(song.data.duration.totalMilliseconds));
            const releaseDate = document.createElement('p');

            
            //Creating elements for the release date and lyrics, which use data from other endpoints
            const lyricsText = document.createElement('p');
            lyricsText.classList.add('smaller-margin');
            lyricsText.innerHTML = '<strong>Lyrics:</strong>';
            const lyrics = document.createElement('div');
            //This function uses the trackID to get data from the "Get tracks" endpoint, as release date is not included in the search results
            async function getReleaseDate() {
                const trackUrl = `https://spotify23.p.rapidapi.com/tracks/?ids=${trackID}`;
                         
                try {
                    //Getting JSON data from the API
                    const response = await fetch(trackUrl, options);
                    const moreTrackData = await response.json();
    
                    //Getting the release date
                    releaseDate.innerHTML = '<strong>Release Date: </strong>' + moreTrackData.tracks[0].album.release_date;
                } catch (error) {
                    console.error(error);
                }
            }
            //This function gets the lyrics from the "Track lyrics" endpoint
            async function getLyrics() {
                const lyricsUrl = `https://spotify23.p.rapidapi.com/track_lyrics/?id=${trackID}`;
                         
                try {
                    const response = await fetch(lyricsUrl, options);
                    const lyricsData = await response.json();
    
                    //Using forEach() to create a paragraph element for each line of the lyrics, which is appended to the lyrics div
                    lyricsData.lyrics.lines.forEach(line => {
                        const lyricLine = document.createElement('p');
                        lyricLine.classList.add('lyrics');
                        lyricLine.textContent = line.words;
                        lyrics.appendChild(lyricLine);
                    })
                } catch (error) {
                    console.error(error);
                }
            }
            //Running the two functions for other endpoints above
            getReleaseDate();
            getLyrics();

            //Appending the card to the page, and each created element to the card
            document.getElementById('spotify-container').appendChild(card);
            card.appendChild(songTitle);
            card.appendChild(coverArt);
            card.appendChild(artistName);
            card.appendChild(albumTitle);
            card.appendChild(releaseDate);
            card.appendChild(duration);
            card.appendChild(lyricsText);
            card.appendChild(lyrics);
          });
        
    } catch (error) {
        console.error(error);
    }
}

//This function gets information about albums
async function getAlbumDataSpotify(searchTerm, queryType)
{
    //Defines the URL and API key
    const url = `https://spotify23.p.rapidapi.com/search/?q=${searchTerm}&type=${queryType}&offset=0&limit=1&numberOfTopResults=1`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '7324dd00c5msh75047e3c5dcceb7p1210e2jsnac430d4f2133',
            'x-rapidapi-host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        //Getting JSON data
        const response = await fetch(url, options);
        const albumData = await response.json();

        albumData.albums.items.forEach(album => {
            //Creating card
            const card = document.createElement('div');
            card.classList.add('spotify-data')
            
            //Gets the album ID. The first 14 characters are removed with slice() as they are always "spotify:album:" and cannot be used in a url
            const albumID = album.data.uri.slice(14);

            //Getting album title
            const albumTitle = document.createElement('h1');
            albumTitle.textContent = album.data.name;
            
            //Getting cover art
            const coverArt = document.createElement ('img');
            coverArt.src = album.data.coverArt.sources[0].url;
            coverArt.alt = album.data.name;

            //Getting artist
            const artistName = document.createElement('p');
            artistName.innerHTML = '<strong>Artist: </strong>' + album.data.artists.items[0].profile.name;

            //Creating elements for the release date and track list, which use data from other endpoints
            const releaseDate = document.createElement('p');
            const trackListText = document.createElement('p');
            trackListText.classList.add('smaller-margin');
            trackListText.innerHTML = '<strong>Track List: </strong>';
            const trackList = document.createElement('ol');
      
            //This function gets more JSON data from the "Get albums" endpoint so that the release date and track list can be displayed
            async function getReleaseDateAndTracks() {
                const albumUrl = `https://spotify23.p.rapidapi.com/albums/?ids=${albumID}`;
                         
                try {
                    const response = await fetch(albumUrl, options);
                    const moreAlbumData = await response.json();
    
                    //Adding the release date
                    releaseDate.innerHTML = '<strong>Release Date:</strong>' + moreAlbumData.albums[0].release_date;
                    //Going through each track and adding it to the list
                    moreAlbumData.albums[0].tracks.items.forEach(track => {
                        const trackName = document.createElement('li');
                        trackName.textContent = track.name;
                        trackList.appendChild(trackName);
                    })
                } catch (error) {
                    console.error(error);
                }
            }
            //Calling the above function
            getReleaseDateAndTracks();

            //Adding the card to the page, then adding each element to the card
            document.getElementById('spotify-container').appendChild(card);
            card.appendChild(albumTitle);
            card.appendChild(coverArt);
            card.appendChild(artistName);
            card.appendChild(releaseDate);
            card.appendChild(trackListText);
            card.appendChild(trackList);
          });
        
    } catch (error) {
        console.error(error);
    }
}

//This function gets information about musicians
async function getArtistDataSpotify(searchTerm, queryType)
{
    //Defines the URL and API key
    const url = `https://spotify23.p.rapidapi.com/search/?q=${searchTerm}&type=${queryType}&offset=0&limit=1&numberOfTopResults=1`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '7324dd00c5msh75047e3c5dcceb7p1210e2jsnac430d4f2133',
            'x-rapidapi-host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        //Getting JSON data
        const response = await fetch(url, options);
        const artistData = await response.json();

        artistData.artists.items.forEach(artist => {
            //Creating card
            const card = document.createElement('div');
            card.classList.add('spotify-data')
            
            //Gets the artist ID. The first 15 characters are removed with slice() as they are always "spotify:artist:" and cannot be used in a url
            const artistID = artist.data.uri.slice(15);

            //Adding name
            const artistName = document.createElement('h1');
            artistName.textContent = artist.data.profile.name;
            
            //Adding artist image
            const artistImage = document.createElement ('img');
            artistImage.src = artist.data.visuals.avatarImage.sources[0].url;
            artistImage.alt = artist.data.profile.name;
            
            //Creating elements for the biography and top tracks sections, which get their data from another endpoint
            const artistBiography = document.createElement('p');
            const topTracksText = document.createElement('p');
            topTracksText.classList.add('smaller-margin');
            topTracksText.innerHTML = '<strong>Top Tracks:</strong>';
            const topTracks = document.createElement('ul');

            //This function gets JSON data from the "Get artists" endpoint
            async function getBioAndTopTracks() {
            const artistUrl = `https://spotify23.p.rapidapi.com/artist_overview/?id=${artistID}`;
                     
            try {
                const response = await fetch(artistUrl, options);
                const moreArtistData = await response.json();

                //Adding biography
                artistBiography.innerHTML = '<strong>Biography: </strong>' + moreArtistData.data.artist.profile.biography.text;

                //Adding each track to the list
                moreArtistData.data.artist.discography.topTracks.items.forEach(song => {
                    const trackName = document.createElement('li');
                    trackName.textContent = song.track.name;
                    topTracks.appendChild(trackName);
                })
            } catch (error) {
                console.error(error);
            }
            }
            //Calling the above function
            getBioAndTopTracks();

            //Adding the card to the page, then adding each element to the card
            document.getElementById('spotify-container').appendChild(card);
            card.appendChild(artistName);
            card.appendChild(artistImage);
            card.appendChild(artistBiography);
            card.appendChild(topTracksText);
            card.appendChild(topTracks);
            });

    } catch (error) {
        console.error(error);
    }
}

//Youtube Music support was planned
async function getDataYoutube()
{
    /*
    const url = 'https://youtube-music-api3.p.rapidapi.com/search?q=Three%20Star%20Compartment&type=song';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '7324dd00c5msh75047e3c5dcceb7p1210e2jsnac430d4f2133',
            'x-rapidapi-host': 'youtube-music-api3.p.rapidapi.com'
        }
    };
    
    try {
        const response = await fetch(url, options);
        const result = await response.text();
        console.log(result);

        const data = document.createElement('div');
        data.textContent = result;
        document.getElementById('youtube-data').appendChild(data);
    } catch (error) {
        console.error(error);
    }
    */
}

function millisecondsToMinutesAndSeconds(duration)
{
    //This function converts milliseconds (which is how song duration is given in the JSON data) into minutes and seconds and returns it as a string

    //Coverting milliseconds to seconds by dividing by 1000 and rounding
    let seconds = Math.round(duration / 1000);
    let minutes = 0;
    let minString;
    let secString;
    let timeString;

    //As long as there are 60 seconds left in the seconds variable 60 seconds will be removed from it and the minutes variable will be incremented
    while (seconds >= 60) {
        minutes++;
        seconds -= 60;
    }

    //Creating strings for minutes and seconds. If there is only 1 minute or second it won't be pluralised
    if (minutes === 1) {
        minString = minutes + " Minute";
    }
    else {
        minString = minutes + " Minutes";
    }

    if (seconds === 1) {
        secString = seconds + " Second";
    }
    else {
        secString = seconds + " Seconds";
    }

    //Only seconds or minutes will be returned if the other number's value is 0. If they are both at least 1 both will be returned
    if (minutes === 0) {
        return secString;
    }
    else if (seconds === 0) {
        return minString;
    }
    else {
        return timeString = minString + ", " + secString;
    }

}