let songs_names;
let update_folder = [];
let current_audio = new Audio()
function convertSecondsToMinutesAndSeconds(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function get_songs(folder) {
    update_folder = folder
    let a = await fetch(`http://127.0.0.1:3000/Spotify_clone/Songs/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let songs_links = []
    songs_names = []

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs_links.push(element.href);
        }
    }

    for (const song_link of songs_links) {
        let c = song_link.split(`/Songs/${folder}/`)[1];
        c = c.replaceAll("%20", " ");
        songs_names.push(c);
    }

    let song_list = document.body.querySelector(".songs-by-name")
    song_list.innerHTML = ''
    for (const name of songs_names) {
        song_list.innerHTML = song_list.innerHTML + `
        
    <li class="song-details">
        <img class="music-library" src="Svg/music_library.svg" alt="">
        <div class="info">
            <div>${name}</div>
        </div>
        <img class="music-library-play" id="lib_play" src="Svg/music_library_play.svg" alt="">
    </li>`


    }
    // previous Event
    previous.addEventListener("click", () => {
        let serc = current_audio.src.split(`/Spotify_clone/Songs/${folder}/`)[1].replaceAll("%20", " ")
        let index = songs_names.indexOf(serc)
        if (index >= 1) {
            play_music(songs_names[index - 1])
        }
    })
    // next Event
    next.addEventListener("click", () => {
        let serc = current_audio.src.split(`/Spotify_clone/Songs/${folder}/`)[1].replaceAll("%20", " ")
        let index = songs_names.indexOf(serc)
        if (index < songs_names.length - 1) {
            play_music(songs_names[index + 1])
        }
    })
    return songs_links
}
const play_music = (track) => {
    current_audio.src = `/Spotify_clone/Songs/${update_folder}/` + track
    current_audio.play()
    play.src = "Svg/pause.svg"

    document.querySelector(".music-name").innerHTML = track
    document.querySelector(".duration").innerHTML = ""
}
// display albums in library
async function display_albums() {
    let a = await fetch(`http://127.0.0.1:3000/Spotify_clone/Songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let songs_cards = document.querySelector(".songs-cards")
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs/")) {
            let folder   = e.href.split("/Songs/")[1]
            // Meta data of folder
            let a = await fetch(`http://127.0.0.1:3000/Spotify_clone/Songs/${folder}Headings.json`)
            let response = await a.json()
            songs_cards.innerHTML = songs_cards.innerHTML + `                    <div class="card rounded ">
            <img class="thumbnail" src="http://127.0.0.1:3000/Spotify_clone/Songs/${folder}cover.jpg"
                alt="thumbnail">
            <h4>${response.title}</h4>
            <p>${response.description}</p>
            <img class="play" src="Svg/play.svg" alt="play">
        </div>`


        }
    }

}
async function main() {
    await display_albums()
    // Click on playlist
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder_name = card.querySelector(".thumbnail").src.split("/Songs/")[1].split("/")[0]
            songs = await get_songs(folder_name);
            Array.from(document.querySelector(".songs-by-name").getElementsByClassName("song-details")).forEach(e => {
                e.addEventListener("click", () => {
                    document.querySelector(".duration").classList.remove("opacity")
                    console.log(e.querySelector(".info").firstElementChild.innerHTML)
                    play_music(e.querySelector(".info").firstElementChild.innerHTML)

                })
            })
        });
    });


    // console.log(songs)
    // Array.from(document.querySelector(".songs-by-name").getElementsByClassName("song-details")).forEach(e => {
    //     e.addEventListener("click", () => {
    //         document.querySelector(".duration").classList.remove("opacity")
    //         console.log(e.querySelector(".info").firstElementChild.innerHTML)
    //         play_music(e.querySelector(".info").firstElementChild.innerHTML)

    //     })
    // })
    
    play.addEventListener("click", () => {
        if (current_audio.paused) {
            current_audio.play()
            play.src = "Svg/pause.svg"
            document.querySelector(".music-library-play").src = "Svg/music_library_pause.svg"
        }

        else {
            current_audio.pause()
            play.src = "Svg/player_button.svg"
            document.querySelector(".music-library-play").src = "Svg/music_library_play.svg"
        }
        console.log("hey");
    })
    current_audio.addEventListener("timeupdate", () => {
        current_Time = parseInt(current_audio.currentTime)
        current_duration = parseInt(current_audio.duration)
        document.querySelector(".duration").innerHTML = `${convertSecondsToMinutesAndSeconds(current_Time)} / ${convertSecondsToMinutesAndSeconds(current_duration)}`
        document.querySelector(".circle").style.left = (current_audio.currentTime) / (current_audio.duration) * 100 + '%'
        if (current_Time == current_duration) {
            play.src = "Svg/player_button.svg"
        }
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let song_per = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = song_per + '%';
        current_audio.currentTime = ((current_audio.duration) * song_per) / 100;
    })
    // Hamburger Event
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.cssText = "width:100%";
        document.querySelector(".right").style.cssText = "display:none"
        document.querySelector(".left").classList.toggle("display");
    })

    // close Event
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("display");
        document.querySelector(".right").style.cssText = "width:100vw";
        document.querySelector(".right").classList.toggle("display");
    })

    // volume Event
    drag.addEventListener("change", (e) => {
        console.log(current_audio.volume = e.target.value / 100)
        if (current_audio.volume == .0) {
            level.src = "Svg/volume_L0.svg"
        }
        else if (current_audio.volume < 0.20) {
            level.src = "Svg/volume_L1.svg"
        }
        else if (current_audio.volume < 0.50) {
            level.src = "Svg/volume_L2.svg"
        }
        else if (current_audio.volume < 1) {
            level.src = "Svg/volume_L3.svg"
        }

    })
    level.addEventListener("click", () => {
        if (current_audio.volume == 0) {
            current_audio.volume = 1
            level.src = "Svg/volume_L3.svg"
            document.querySelector(".volume").querySelector("input").value = 100
        }
        else {
            current_audio.volume = 0
            level.src = "Svg/volume_L0.svg"
            document.querySelector(".volume").querySelector("input").value = 0
        }
    })

    // mute Event
    
}
console.log(update_folder)
main()