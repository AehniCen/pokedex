function openPokemonOverlay(index) {
    const pokeOverlayRef = document.getElementById('pokemon-details-div');
    const backgroundRef = document.getElementById('background-overlay');

    const pokemon = renderedPokemon[index]; // ✅ Zugriff auf die aktuelle Anzeige-Liste
    if (!pokemon) return;

    pokeOverlayRef.classList.remove('d_none');
    backgroundRef.classList.remove('d_none');

    applyTypeColor(pokemon);
    renderPokeDetails(pokemon, index);
}

function closePokemonOverlay() {
    document.getElementById('pokemon-details-div').classList.add('d_none');
    document.getElementById('background-overlay').classList.add('d_none');
}

function playAudio() {
    AUDIO_CLICK.play()
}

function playDelay() {
    AUDIO_DELAY.pause();
    AUDIO_DELAY.currentTime = 0;
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
        <span class="stat-value">${value}</span>
      </div>
    `;
  }).join('');
}

async function animateAllSprites(pokemon) {
    const spriteContainer = document.getElementById('poke-details-sprite-div');
    spriteContainer.innerHTML = '<p>Forms:</p>';

    if (spriteAnimationInterval) {
        clearInterval(spriteAnimationInterval);
    }

    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const evolutionNames = [];
    let current = evoData.chain;

    while (current) {
        evolutionNames.push(current.species.name);
        current = current.evolves_to[0];
    }

    const spritePairs = []; // { front, back, element }

    for (let name of evolutionNames) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();

        const front = data.sprites.front_default;
        const back = data.sprites.back_default;

        const evoImg = document.createElement('img');
        evoImg.src = front;
        evoImg.alt = `${name}-sprite`;
        evoImg.classList.add('evo-sprite');

        if (name === pokemon.name) {
            evoImg.classList.add('current-pokemon');
        }

        evoImg.setAttribute('onclick', `openPokemonOverlayByName('${name}')`);
        spriteContainer.appendChild(evoImg);

        spritePairs.push({ front, back, element: evoImg });
    }

    let showFront = true;
    spriteAnimationInterval = setInterval(() => {
        for (let sprite of spritePairs) {
            sprite.element.src = showFront ? sprite.front : sprite.back;
        }
        showFront = !showFront;
    }, 500);
}



function typeText(element, text, delay = 160) {
  element.innerHTML = ''; // Text leeren
  let i = 0;

  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, delay);
}

function openPokemonOverlayByName(name) {
    const index = renderedPokemon.findIndex(p => p.name === name);
    if (index !== -1) {
        openPokemonOverlay(index);
        playDelay(); // falls du Ton willst
    }
}