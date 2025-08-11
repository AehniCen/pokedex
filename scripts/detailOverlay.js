const pokeOverlayRef = document.getElementById('pokemon-details-div');
let currentDetailIndex = 0; 

function openPokemonOverlay(index) {
    currentDetailIndex = index;
    const pokeOverlayRef = document.getElementById('pokemon-details-div');
    const backgroundRef = document.getElementById('background-overlay');
    const pokemon = renderedPokemon[index];
    if (!pokemon) return;
    pokeOverlayRef.classList.remove('d_none');
    backgroundRef.classList.remove('d_none');
    applyTypeColor(pokemon);
    renderPokeDetails(pokemon, index);
}

function handleCloseOverlay() {
    if (AUDIO_DELAY) {
        AUDIO_DELAY.pause();
        AUDIO_DELAY.currentTime = 0;
    }
    closePokemonOverlay();
    playAudio();
}

function closePokemonOverlay() {
    document.getElementById('pokemon-details-div').classList.add('d_none');
    document.getElementById('background-overlay').classList.add('d_none');
}

function playDelay() {
    if (disableSound || !AUDIO_DELAY) return;

    AUDIO_DELAY.pause();
    AUDIO_DELAY.currentTime = 0;
    AUDIO_DELAY.play().catch(error => {
        if (error.name !== 'AbortError') {
            console.error('Audio konnte nicht abgespielt werden:', error);
        }
    });
}

function applyTypeColor(pokemon) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');
    pokeOverlayRef.classList.forEach(cls => {
        if (cls.startsWith('type-')) {
            pokeOverlayRef.classList.remove(cls);
        }
    });
    let mainType = pokemon.types[0].type.name;
    pokeOverlayRef.classList.add(`type-${mainType}`);
}

function renderPokeDetails(pokemon, index) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');
    pokeOverlayRef.innerHTML = "";
    pokeOverlayRef.innerHTML += pokeDetailsTemplate(pokemon, index);

    const allPTags = pokeOverlayRef.querySelectorAll('p');
        allPTags.forEach(p => {
          typeText(p, p.textContent);
        });
    animateAllSprites(pokemon);
}

async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
}

async function fetchEvolutionNamesForPokemon(pokemon) {
    const species = await fetchJSON(pokemon.species.url);
    const evo = await fetchJSON(species.evolution_chain.url);
    const names = [];
    let cur = evo.chain;
    while (cur) { names.push(cur.species.name); cur = cur.evolves_to[0]; }
    return names;
}

async function fetchSpritePairs(names) {
    const jobs = names.map(n => fetchJSON(`https://pokeapi.co/api/v2/pokemon/${n}`));
    const list = await Promise.all(jobs);
    return list.flatMap(d => (d.sprites.front_default && d.sprites.back_default)
      ? [{ front: d.sprites.front_default, back: d.sprites.back_default, name: d.name }]
      : []);
}

function hideSpritesUI({formsLabel, spriteImg, spriteContainer, spriteRow}) {
    formsLabel.style.display = 'none';
    if (spriteImg) { spriteImg.style.display = 'none'; spriteImg.src = ''; }
    spriteRow.style.display = 'none';
    spriteContainer.innerHTML = '';
    spriteContainer.classList.add('d_none');
}

function showSpritesUI({formsLabel, spriteRow, spriteContainer}) {
    if (spriteContainer.children.length) spriteContainer.classList.remove('d_none');
    formsLabel.style.display = 'block';
    spriteRow.style.display = 'flex';
}

function renderSpriteList(container, pairs, onClick) {
    pairs.forEach(p => {
      const img = document.createElement('img');
      img.src = p.front; img.alt = `${p.name}-sprite`; img.classList.add('evo-sprite');
      img.addEventListener('click', () => onClick(p.name));
      container.appendChild(img);
    });
}

function startFlipAnimation(container, pairs, ms = 700) {
    let front = true;
    stopFlipAnimation();
    spriteAnimationInterval = setInterval(() => {
      [...container.querySelectorAll('img.evo-sprite')]
        .forEach((img, i) => img.src = front ? pairs[i]?.front : pairs[i]?.back);
      front = !front;
    }, ms);
}

function stopFlipAnimation() {
    if (spriteAnimationInterval) clearInterval(spriteAnimationInterval);
}

async function animateAllSprites(pokemon) {
    const refs = {
      spriteRow: pokeOverlayRef.querySelector('.sprite-current-col'),
      formsLabel: pokeOverlayRef.querySelector('#forms-label'),
      spriteImg: pokeOverlayRef.querySelector('#poke-sprite'),
      spriteContainer: pokeOverlayRef.querySelector('#poke-details-sprite-div')
    };
    hideSpritesUI(refs);
    stopFlipAnimation();
    try {
      const names = await fetchEvolutionNamesForPokemon(pokemon);
      const pairs = await fetchSpritePairs(names);
      if (!pairs.length) return;
      renderSpriteList(refs.spriteContainer, pairs, openPokemonOverlayByName);
      showSpritesUI(refs);
      startFlipAnimation(refs.spriteContainer, pairs);
    } catch (e) {
      console.error('Fehler beim Laden der Sprites:', e);
    }
}

function typeText(element, text, delay = 160) {
    element.innerHTML = '';
    let i = 0;

    const interval = setInterval(() => {
      element.innerHTML += text.charAt(i);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, delay);
}

function openPokemonOverlayByName(name) {
    let index = renderedPokemon.findIndex(p => p.name === name);
    if (index !== -1) {
        currentDetailIndex = index;
        openPokemonOverlay(index);
        playDelay();
    } else if (typeof allDetails !== 'undefined') {
        let pokemon = allDetails.find(p => p.name === name);
        if (pokemon) {
            openPokemonOverlayFromObject(pokemon);
            playDelay();
        } else {
            console.warn(`Pokémon mit Name "${name}" nicht gefunden.`);
        }
    }
}

function openPokemonOverlayFromObject(pokemon) {
    const pokeOverlayRef = document.getElementById('pokemon-details-div');
    const backgroundRef = document.getElementById('background-overlay');
    if (!pokemon) return;
    pokeOverlayRef.classList.remove('d_none');
    backgroundRef.classList.remove('d_none');
    applyTypeColor(pokemon);
    const index = renderedPokemon.findIndex(p => p.name === pokemon.name);
    renderPokeDetails(pokemon, index);
    playDelay();
}

function showPrev() {
    playDelay();
    if (!renderedPokemon.length) return;
    currentDetailIndex = (currentDetailIndex - 1 + renderedPokemon.length) % renderedPokemon.length;
    openPokemonOverlay(currentDetailIndex);
}

function showNext() {
    playDelay();
    if (!renderedPokemon.length) return;
    currentDetailIndex = (currentDetailIndex + 1) % renderedPokemon.length;
    openPokemonOverlay(currentDetailIndex);
}