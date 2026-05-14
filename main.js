import { sounds } from './sounds.js';

let allowOverlap = false;
let showFavorites = false;
let currentAudios = [];

const toggleButton = document.getElementById('toggleButton');
const stopButton = document.getElementById('stopButton');
const searchInput = document.getElementById('searchInput');
const favoriteButton = document.getElementById('toggleFavorites');
const soundBoard = document.getElementById('soundboard');

toggleButton.onclick = () => {
    allowOverlap = !allowOverlap;
    toggleButton.textContent = allowOverlap ? '🔊 Overlap: ON' : '🔇 Overlap: OFF';
};

stopButton.onclick = () => {
    currentAudios.forEach(a => {
        a.pause();
        a.currentTime = 0;
    });
    currentAudios = [];
    if (window.speechSynthesis) window.speechSynthesis.cancel();
};

favoriteButton.onclick = () => {
    showFavorites = !showFavorites;
    favoriteButton.textContent = showFavorites ? '🌟 Favorites: ON' : '⭐ Favorites: OFF';
    renderSounds(showFavorites ? "filter:favorite " + searchInput.value : searchInput.value);
};

function renderSounds(filter = '') {
    soundBoard.innerHTML = '';
    let finalSound;

    const favoritesList = localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')) : [];

    if (filter.startsWith("filter:favorite ")) {
        const searchTerm = filter.replace('filter:favorite ', '').toLowerCase();
        finalSound = favoritesList.filter(s => s.name.toLowerCase().includes(searchTerm));
    } else {
        finalSound = sounds.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
    }

    finalSound.forEach(sound => {
        const wrapper = document.createElement('div');
        wrapper.className = 'sound-wrapper';

        const button = document.createElement('button');
        button.className = 'sound-button-img';
        button.style.setProperty('--btn-color', sound.color || '#7efacf');

        const image = document.createElement('div');
        image.className = 'sound-image';
        if (sound.image) image.style.backgroundImage = `url(${sound.image})`;
        
        button.appendChild(image);

        button.onclick = () => {
            if (!allowOverlap) {
                currentAudios.forEach(a => a.pause());
                currentAudios = [];
            }

            const audioPath = `https://cdn.jsdelivr.net/gh/FastyJay/soundboard@main/${sound.mp3}`;
            const audio = new Audio(audioPath);
            
            audio.play().catch(err => console.error(err));
            currentAudios.push(audio);

            image.classList.add('pressed');
            setTimeout(() => image.classList.remove('pressed'), 150);
        };

        wrapper.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            rightClickPanel(e, sound);
        });

        const label = document.createElement('div');
        label.className = 'sound-label';
        label.textContent = sound.name;

        wrapper.appendChild(button);
        wrapper.appendChild(label);
        soundBoard.appendChild(wrapper);
    });
}

function rightClickPanel(event, sound) {
    document.querySelectorAll('.right-click-panel').forEach(p => p.remove());

    const panel = document.createElement('div');
    panel.className = 'right-click-panel';
    panel.style.position = 'absolute';
    panel.style.left = `${event.pageX}px`;
    panel.style.top = `${event.pageY}px`;
    panel.style.setProperty('--btn-color', sound.color || '#a04cff');

    let favoriteJson = localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')) : [];
    const isFavorite = favoriteJson.some(item => item.name === sound.name);

    const favBtn = document.createElement('button');
    favBtn.className = 'right-click-panel-button';
    favBtn.textContent = isFavorite ? '⭐ Unfavorite' : "🌟 Favorite";

    favBtn.onclick = () => {
        if (isFavorite) {
            favoriteJson = favoriteJson.filter(item => item.name !== sound.name);
        } else {
            favoriteJson.push(sound);
        }
        localStorage.setItem("favorites", JSON.stringify(favoriteJson));
        panel.remove();
        renderSounds(showFavorites ? "filter:favorite " + searchInput.value : searchInput.value);
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'right-click-panel-button';
    downloadBtn.textContent = '💾 Download';
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = `https://cdn.jsdelivr.net/gh/FastyJay/soundboard@main/${sound.mp3}`;
        link.download = sound.mp3.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    panel.appendChild(favBtn);
    panel.appendChild(downloadBtn);
    document.body.appendChild(panel);

    setTimeout(() => {
        const closePanel = (e) => {
            if (!panel.contains(e.target)) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        };
        document.addEventListener('click', closePanel);
    }, 0);
}

renderSounds();

searchInput.addEventListener('input', () => {
    renderSounds((showFavorites ? "filter:favorite " : "") + searchInput.value);
});
