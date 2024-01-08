


document.addEventListener('DOMContentLoaded', function() {
  const userId = "<%= userId %>"; 
  document.querySelectorAll('.add-to-favorites-form').forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault(); 
      const formData = new FormData(form);
      const showId = formData.get('id');
      const showTitle = formData.get('name');
      const showPoster = formData.get('poster_path');

      addToFavorites(userId, showId, showTitle, showPoster); 
    });
  });
});

function addToFavorites(userId, showId, showTitle, showPoster) {
  fetch(`/shows/add/${userId}`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: showId,
      name: showTitle,
      poster_path: showPoster
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Show added to favorites') {
      fetchRecommendations(showId); // Fetch recommendations
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => console.error('Error:', error));
}


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

// Clear previous recommendations
recommendationsContainer.innerHTML = '';

recommendations.forEach(show => {
  const recommendationElement = document.createElement('div');
  recommendationElement.className = 'recommendation';
  recommendationElement.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}" class="recommendation-poster">
    <div class="recommendation-buttons">
    <img src="/images/Favorites.png" alt="Add to Favorites" onclick="addToFavorites('${show.id}')" class="icon">
    <img src="/images/Watching.png" alt="Add to Watch List" onclick="addToWatchList('${show.id}')" class="icon">
    <img src="/images/Watched.png" alt="Add to Watched" onclick="addToWatched('${show.id}')" class="icon">
  </div>
  `;
  recommendationsContainer.appendChild(recommendationElement);
});
}






