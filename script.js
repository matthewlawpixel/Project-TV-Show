// Initialises the page
function initialisePage() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  addSearchFunctionality(allEpisodes);
  addEpisodeSelector(allEpisodes);
}

// Renders the grid containing all episode cards
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const episodeGrid = document.createElement("div");
  episodeGrid.className = "episode-grid";

  episodeList.forEach((episode) => {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    episodeCard.innerHTML = `
      <img src="${
        episode.image?.medium ||
        "https://via.placeholder.com/300x169?text=No+Image"
      }" alt="${episode.name}">
      <div class="episode-content">
        <h2>${episode.name} – ${episodeCode}</h2>
        <p>${
          episode.summary
            ? episode.summary.replace(/<[^>]+>/g, "")
            : "No summary available."
        }</p>
        <a href="${episode.url}" target="_blank">View on TVMaze</a>
      </div>
    `;

    episodeGrid.appendChild(episodeCard);
  });

  rootElem.appendChild(episodeGrid);
}


function addSearchFunctionality(allEpisodes) {
  const searchInput = document.getElementById("searchInput");
  const episodeCountElem = document.getElementById("episodeCount");

  
  episodeCountElem.textContent = `${allEpisodes.length} episode(s) found`;

  
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary
        ? episode.summary.toLowerCase().includes(searchTerm)
        : false;
      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);
    episodeCountElem.textContent = `${filteredEpisodes.length} episode(s) found`;
  });
}

function addEpisodeSelector(allEpisodes) {
  const episodeSelector = document.getElementById("episodeSelector");
  const showAllButton = document.getElementById("showAllButton");

  
  allEpisodes.forEach((episode) => {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });

  
  episodeSelector.addEventListener("change", (event) => {
    const selectedEpisodeId = event.target.value;
    if (selectedEpisodeId) {
      const selectedEpisode = allEpisodes.find(
        (episode) => episode.id == selectedEpisodeId
      );
      makePageForEpisodes([selectedEpisode]);
      showAllButton.style.display = "inline-block"; 
    }
  });

  
  showAllButton.addEventListener("click", () => {
    episodeSelector.value = ""; 
    makePageForEpisodes(allEpisodes);
    showAllButton.style.display = "none"; 
  });
}

window.onload = initialisePage;
