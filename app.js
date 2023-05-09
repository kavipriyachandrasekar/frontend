let tagInput = document.getElementById('tagInput')
let songsContainer = document.querySelector('.songsContainer')
let statusSpan = document.querySelector('.status')
let vibeIt = document.querySelector('.vibeIt')  

const API_ENDPOINT = `https://tvrsimhan-text-to-tags.hf.space/run/predict`

vibeIt.addEventListener('click', async (e) => {
    songsContainer.innerHTML = ''    
    statusSpan.innerHTML = 'Getting the tags...'
    let response = await getTags(tagInput.value)
    // let response = await request.json()
    getSongs(response)
    statusSpan.innerHTML = 'Done!'   
})

async function getTags(sentence) {
    let response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: [
                sentence
            ]
        })
    })
    let json = await response.json()
    return json.data[0]
}


function getSongs(tagsQuery) {
    let SHOW_MATCHES = 5

    tagsQuery = convertToArray(tagsQuery)
    let results = searchForTags(tagsQuery)

    let html = ''

    // update the result array with the match percent
    results = results.map(song => {
        return computeSongMatch(song, tagsQuery)
    })

    // sort the results array by the match percent
    results.sort((a, b) => {
        return b.vibeMatch - a.vibeMatch
    })

    results.sort((a, b) => {
        if (a.vibeMatch === b.vibeMatch) {
            return b.exploreMatch - a.exploreMatch
        }
    })

    // remove duplicates
    results = results.filter((song, index, self) =>
        index === self.findIndex((t) => (
            t.songName === song.songName
        ))
    )

    results = results.slice(0, SHOW_MATCHES)

    results.forEach(result => {
        html += generateSongCard(result)
    })

    // console.log(results)

    songsContainer.innerHTML = html
}

function searchForTags(tagsQueryArray) {
    let results = []
    tagsQueryArray.forEach(tag => {
        let filtered = tags.filter(song => {
            return song.tags.includes(tag)
        })
        results.push(...filtered)
    })
    return results
}

function generateSongCard(song) {
    try {
        let songName = song.songName // but remove the last "-song-lyrics.txt"
        songName = songName.split('-')
        songName.pop()
        songName.pop()
        songName = songName.join(' ')

        let html = `
        <div class="songCard">
            <span class="songName">${songName}</span>
        </div>
        `
        //     <span class="matchPercent">${song?.vibeMatch.toFixed(1)}, ${song?.exploreMatch.toFixed(1)}</span>
        // </div>
        // `
        return html
    } catch (error) { }
}

function computeSongMatch(songItem, tagsQueryArray) {

    let song = JSON.parse(JSON.stringify(songItem))

    let matchPercent = 0
    let songTags = song.tags

    let matches = tagsQueryArray.filter(tag => {
        return songTags.includes(tag)
    })

    matchPercent = (matches.length / tagsQueryArray.length) * 100

    let matchPercent2 = (matches.length / songTags.length) * 100

    song.vibeMatch = matchPercent
    song.exploreMatch = matchPercent2

    return song
}

function convertToArray(string) {
    let array = string.split(', ')
    return array
}