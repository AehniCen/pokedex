let validPokemonNames = null;

function renderPokeMenu(pokemon, index) {
    let pokeRef = document.getElementById('poke-div'); 
    
    renderedPokemon.push(pokemon);

    pokeRef.innerHTML += pokeTemplate(pokemon, index);
    renderTypeIcon(pokemon, index);
    getTypeColor(pokemon, index);
}

function getTypeColor(pokemon, index) {
    let pokeOverlayRef = document.getElementById(`poke-div-img-${index}`);

    pokeOverlayRef.classList.forEach(cls => {
        if (cls.startsWith('type-')) {
            pokeOverlayRef.classList.remove(cls);
        }
    });

    let mainType = pokemon.types[0].type.name;
    pokeOverlayRef.classList.add(`type-${mainType}`);
}

function renderTypeIcon(pokemon, index) {
    let typeRef = document.getElementById(`poke-div-type-${index}`);
    typeRef.innerHTML = '';

    pokemon.types.forEach(t => {
      const typeName = t.type.name;
      const iconPath = typeIcons[typeName];

      if (iconPath) {
        typeRef.innerHTML += `<img id="poke-type-icon" src="${iconPath}" alt="type-icon">`;
      }
    });
}

function normalizeName(raw) {
    if (!raw) 
        return '';
    return raw.toLowerCase().trim().replace(/:.+$/, '');
}

function isValidNameSyntax(name) {
    return /^[a-z0-9-]+$/.test(name);
}

async function searchPokemonByName() {
    const input = document.getElementById('pokemon-search');
    const name = normalizeName(input.value);
    const v = validateSearchInput(name);
    if (v) 
        return setFeedback(v);
    await ensureValidNameSet();
    const matches = findMatchingNames(name, 60);
    if (!matches.length) 
        return setFeedback(`Kein Pokémon mit "${name}" im Namen gefunden.`);
    setFeedback('');
    await withLoader(async () => await loadAndRenderPokemonOverview(matches));
    input.value = '';
}   


async function ensureValidNameSet() {
    if (validPokemonNames) 
        return;
    try {
      const res = await fetch(`${BASE_URL}?limit=20000&offset=0`);
      if (!res.ok) { validPokemonNames = new Set(); return; }
      const data = await res.json();
      validPokemonNames = new Set((data.results || []).map(r => r.name));
    } catch (e) {
      console.warn('Could not load name list:', e);
      validPokemonNames = new Set();
    }
}


function validateSearchInput(name) {
    if (name.length < 3)
        return 'Bitte mindestens 3 Buchstaben eingeben.';
    if (!isValidNameSyntax(name))
        return 'Ungültiger Name. Erlaubt: Buchstaben, Ziffern, Bindestrich.';
    return null;
}

function findMatchingNames(partialName, limit = 60) {
    if (!validPokemonNames) 
        return [];
    return [...validPokemonNames].filter(n => n.includes(partialName)).slice(0, limit);
}


async function loadAndRenderPokemonOverview(nameList) {
    const jobs = nameList.map(n => fetchPokemonByName(n));
    const settled = await Promise.allSettled(jobs);
    const pokes = settled
      .map(s => s.status === 'fulfilled' ? s.value : null)
      .filter(Boolean);

    pokes.forEach(p => { if (!allDetails.find(x => x.name === p.name)) allDetails.push(p); });

    renderPokemonOverview(pokes);
}

function filterPokemonByInput() {
    const input = document.getElementById('pokemon-search');
    const search = normalizeName(input.value);
    if (search.length < 3) {
        setFeedback('Bitte mindestens 3 Buchstaben eingeben.');
        return;
    }
    const filtered = allDetails.filter(pokemon => 
        pokemon.name.includes(search)
    );
    if (filtered.length === 0) {
        setFeedback(`Kein Pokémon mit "${search}" im Namen gefunden.`);
        return;
    }

    setFeedback('');
    renderPokemonOverview(filtered);
}

function renderPokemonOverview(pokemonList) {
    renderedPokemon = pokemonList.slice();
    const container = document.getElementById('poke-div');
    container.innerHTML = '';
    if (!pokemonList.length) {
        container.innerHTML = '<p>Keine Pokémon gefunden.</p>';
        return;
    }
    pokemonList.forEach((pokemon, index) => {
        renderPokeMenu(pokemon, index);
    });
}

function applyTypeColorToCard(pokemon, index) {
    const cardTypeDiv = document.getElementById(`poke-div-type-${index}`);
    if (!cardTypeDiv) 
        return;
    cardTypeDiv.className = 'poke-div-type';
    const mainType = pokemon.types[0].type.name;
    cardTypeDiv.classList.add(`type-${mainType}`);
}

function renderPokemonCard(pokemon, index) {
    return `
    <div class="template-div" id="poke-card-${index}">
        <div class="poke-div-type" id="poke-div-type-${index}"></div>
        <div id="poke-div-img-${index}" class="poke-div-img">
            <img id="poke-img-image" src="${pokemon.sprites.other["official-artwork"].front_default || './assets/images/fallback-picture.png'}" alt="pokemon-image" onclick="openPokemonOverlayByName('${pokemon.name}')">
        </div>
        <div class="poke-div-name">
            <p id="poke-name-p">${capitalize(pokemon.species.name)}</p>
        </div>
    </div>
    `;
}

function setFeedback(msg = '') {
    const el = document.getElementById('search-feedback');
    if (el) 
        el.textContent = msg;
}

async function withLoader(fn) {
    const loader = document.getElementById('loading-overlay');
    loader?.classList.remove('d_none');
    try { return await fn(); } finally { loader?.classList.add('d_none'); }
}



