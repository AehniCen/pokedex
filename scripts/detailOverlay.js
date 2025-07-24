function togglePokemonOverlay(index) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');
    pokeOverlayRef.classList.toggle('d_none');
    let pokemon;

    if (index !== undefined) {
        pokemon = allDetails[index];
        applyTypeColor(pokemon);
    }

    if (pokemon) {
        renderPokeDetails(pokemon, index);
    }

    console.log(pokemon);
}

function playAudio() {
    AUDIO_CLICK.play()
}

function playDelay() {
    AUDIO_DELAY.play()
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

function generateStatsBars(pokemon) {
  return pokemon.stats.map(stat => {
    const name = stat.stat.name;
    const value = stat.base_stat;
    const percentage = Math.min((value / 200) * 100, 100); 

    return `
      <div class="stat-row">
        <span class="stat-label"><p>${name}</p></span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

async function animateAllSprites(pokemon) {
    
    const evoImgContainer = document.getElementById('poke-evolution-sprite');
    evoImgContainer.innerHTML = '';

    const spriteRef = document.getElementById('poke-sprite');

    // 1. Lade Species → Evolution Chain
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    // 2. Sammle alle Evolutionsnamen (linear)
    const evolutionNames = [];
    let current = evoData.chain;

    while (current) {
        evolutionNames.push(current.species.name);
        current = current.evolves_to[0];
    }

    // 3. Animierte Anzeige der ersten Form in #poke-sprite
    const baseName = evolutionNames[0];
    const baseRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseName}`);
    const baseData = await baseRes.json();

    const baseFront = baseData.sprites.front_default;
    const baseBack = baseData.sprites.back_default;

    spriteRef.src = baseFront;
    let showBaseFront = true;
    setInterval(() => {
        spriteRef.src = showBaseFront ? baseFront : baseBack;
        showBaseFront = !showBaseFront;
    }, 500);

    // 4. Restliche Formen anzeigen (einschließlich aktuelle)
    for (let name of evolutionNames.slice(1)) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();

        const front = data.sprites.front_default;
        const back = data.sprites.back_default;

        const evoImg = document.createElement('img');
        evoImg.src = front;
        evoImg.alt = `${name}-sprite`;
        evoImg.classList.add('evo-sprite');

        if (name === pokemon.name) {
            evoImg.classList.add('current-pokemon'); // visuelle Hervorhebung
        }

        evoImg.setAttribute('onclick', `openPokemonOverlayByName('${name}')`);
        evoImgContainer.appendChild(evoImg);

        let showFront = true;
        setInterval(() => {
            evoImg.src = showFront ? front : back;
            showFront = !showFront;
        }, 500);
    }
}

function typeText(element, text, delay = 80) {
  element.innerHTML = ''; // Text leeren
  let i = 0;

  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, delay);
}