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

async function searchPokemonByName() {
    const input = document.getElementById('pokemon-search');
    const name = (document.getElementById('pokemon-search').value || '').trim().toLowerCase();
    if (name.length < 3) { setFeedback('Bitte mindestens 3 Buchstaben eingeben.'); return; }
    setFeedback('');
    await withLoader(async () => {
      const data = await fetchPokemonByNameAPI(name);
      if (!data) { setFeedback(`Kein Pokémon mit dem Namen "${name}" gefunden.`); return; }
      if (data && !allDetails.find(x => x.name === data.name)) allDetails.push(data);
      openPokemonOverlayFromObject(data);
      input.value = '';
    });
}

function setFeedback(msg = '') {
    const el = document.getElementById('search-feedback');
    if (el) el.textContent = msg;
}

async function withLoader(fn) {
    const loader = document.getElementById('loading-overlay');
    loader?.classList.remove('d_none');
    try { return await fn(); } finally { loader?.classList.add('d_none'); }
}

async function fetchPokemonByNameAPI(name) {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`);
    return res.ok ? res.json() : null;
}

