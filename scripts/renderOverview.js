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

async function ensureValidNameSet() {
    if (validPokemonNames) return;
    const res = await fetch(`${BASE_URL}?limit=20000&offset=0`);
    if (!res.ok) { validPokemonNames = new Set(); return; }
    const data = await res.json();
    validPokemonNames = new Set((data.results || []).map(r => r.name));
}

function normalizeName(raw) {
    if (!raw) return '';
    const s = raw.toLowerCase().trim().replace(/:.+$/, '');
    return s;
}

function isValidNameSyntax(name) {
    return /^[a-z0-9-]+$/.test(name);
}

async function searchPokemonByName() {
    const input=document.getElementById('pokemon-search'), name=normalizeName(input.value);
    if (name.length<3) return setFeedback('Bitte mindestens 3 Buchstaben eingeben.');
    if (!isValidNameSyntax(name)) return setFeedback('Ungültiger Name. Erlaubt: Buchstaben, Ziffern, Bindestrich.');
    await ensureValidNameSet();
    if (!validPokemonNames.has(name)) return setFeedback(`Kein Pokémon mit dem Namen "${name}" gefunden.`);
    setFeedback('');
    await withLoader(async ()=>{
      const data=await fetchPokemonByNameAPI(name);
      if(!data) return setFeedback(`Kein Pokémon mit dem Namen "${name}" gefunden.`);
      if(!allDetails.find(x=>x.name===data.name)) allDetails.push(data);
      openPokemonOverlayFromObject(data); input.value='';
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
    try {
      const res = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
}



