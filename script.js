// Initialises the page
function initialisePage() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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

window.onload = initialisePage;
