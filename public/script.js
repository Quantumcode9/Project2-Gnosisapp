document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');

  searchInput.addEventListener('keyup', function(event) {
      const query = event.target.value;
  
      if (query.length > 2) {
          fetch(`/search-tv-shows?q=${encodeURIComponent(query)}`)
              .then(response => response.json())
              .then(data => {
                  const searchResults = document.getElementById('searchResults');
                  searchResults.innerHTML = ''; 

                  data.forEach(show => {
                      const showDiv = document.createElement('div');
                      showDiv.className = 'show';
                      showDiv.innerHTML = `
                          <a href="/pages/show/${show.id}">
                          <div class="show-card">
                          <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}"  style="height: 300px;">
                          <div id="messageBox-${show.id}" class="message-box"></div>
                          <div class= "show-icons">
                          <form class="favorite-form">
                          <input type="hidden" name="id" value="${show.id}">
                          <input type="hidden" name="name" value="${show.name}">
                          <input type="hidden" name="poster_path" value="${show.poster_path}">
                          <button type="submit" class="icon-button">
                          <img class="icon" src="/images/Favorites.png" alt="Add to Favorites">
                          </button>
                      </form>
                    
                      <form class="watched-form">
                      <input type="hidden" name="id" value="${show.id}">
                      <input type="hidden" name="name" value="${show.name}">
                      <input type="hidden" name="poster_path" value="${show.poster_path}">
                      <button type="submit" class="icon-button">
                          <img class="icon" src="/images/Watched.png" alt="Mark as Watched">
                      </button>
                  </form>
                  <form class="watchlist-form">
                      <input type="hidden" name="id" value="${show.id}">
                      <input type="hidden" name="name" value="${show.name}">
                      <input type="hidden" name="poster_path" value="${show.poster_path}">
                      <button type="submit" class="icon-button">
                          <img class="icon" src="/images/Watching.png" alt="Add to Watchlist">
                      </button>
                  </form>
              </div>
              </div>
                      `;
                      searchResults.appendChild(showDiv);
                  });
              })
              .catch(error => console.error('Error:', error));
      }
  });
  document.body.addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(event.target);
    formData.append('userId', userId); 
    const showId = formData.get('id');
    const showTitle = formData.get('name');
    const showPoster = formData.get('poster_path');
  
    let route;

    if (form.classList.contains('favorite-form')) {
      route = '/shows/add';
    } else if (form.classList.contains('watched-form')) {
      route = '/shows/watched/add';
    } else if (form.classList.contains('watchlist-form')) {
      route = '/shows/watchlist/add';
    }
    fetch(route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId, 
        id: showId,
        name: showTitle,
        poster_path: showPoster
      })
    })
    .then(response => response.json())
    .then(data => {
      const messageBox = document.getElementById(`messageBox-${showId}`);
      if (data.message === 'Show added') {
        fetchRecommendations(showId); 
        messageBox.innerText = 'Show added';
    } else {
        console.error(data.message);
        messageBox.innerText =  data.message;
    }
    setTimeout(() => {
        messageBox.innerText = '';
    }, 1000);
})
.catch(error => {
    console.error('Error:', error);
    const messageBox = document.getElementById(`messageBox-${showId}`);
    messageBox.innerText = 'Error: ' + error;

    setTimeout(() => {
        messageBox.innerText = '';
    }, 1000);
  });
});
});

// Fetch recommendations

function fetchRecommendations(showId) {
fetch(`/get-recommendations/${showId}`)
  .then(response => response.json())
  .then(recommendations => {
    displayRecommendations(showId, recommendations);
  })
  .catch(error => console.error('Error fetching recommendations:', error));
}

// Display recommendations

function displayRecommendations(showId, recommendations) {
let recommendationsContainer = document.getElementById(`recommendations_${showId}`);


if (!recommendationsContainer) {
  recommendationsContainer = document.createElement('div');
  recommendationsContainer.id = `recommendations_${showId}`;
  recommendationsContainer.className = 'recommendations-container';
  
  const showElement = document.getElementById(`show_${showId}`);
  showElement.after(recommendationsContainer);
}

recommendationsContainer.innerHTML = '';

recommendations.forEach(show => {
  const recommendationElement = document.createElement('div');
  recommendationElement.className = 'recommendation';
  recommendationElement.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}" class="recommendation-poster">
    <div class= "show-icons">
    <form class="favorite-form">
    <input type="hidden" name="id" value="${show.id}">
    <input type="hidden" name="name" value="${show.name}">
    <input type="hidden" name="poster_path" value="${show.poster_path}">
    <button type="submit" class="icon-button">
    <img class="icon" src="/images/Favorites.png" alt="Add to Favorites">
    </button>
</form>
</div>
  `;
  recommendationsContainer.appendChild(recommendationElement);
});
}