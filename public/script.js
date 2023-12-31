


function addToFavorites(showId) {
  fetch('/add-to-favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ showId: showId })
  })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then(data => {
//     // Handle response
//     console.log(data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
// }
.then(response => response.json())
.then(data => {
  if(data.message === 'Show added to favorites') {
    fetchRecommendations(showId); // Fetch recommendations
  }
})
.catch(error => {
  console.error('Error:', error);
});
}

// Fetch recommendations

function fetchRecommendations(showId) {
  fetch(`/get-recommendations/${showId}`)
    .then(response => response.json())
    .then(recommendations => {
      displayRecommendations(recommendations); // Function to update the DOM with recommendations
    })
    .catch(error => console.error('Error fetching recommendations:', error));
}



// Display recommendations

function displayRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById('recommendations-container');
  recommendationsContainer.innerHTML = ''; // Clear previous recommendations
  recommendationsContainer.style.display = 'flex';

  recommendations.forEach(show => {
    // Create HTML elements for each recommendation and append to the container
    const showElement = document.createElement('div');
    showElement.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}" class="recommendation-poster">
    <h3>${show.name}</h3>
    <button onclick="addToFavorites('${show.id}')">Add to Favorites</button>
    <button onclick="addToWatchList('${show.id}')">Add to Watch List</button>
    <button onclick="addToWatched('${show.id}')">Add to Watched</button>
  `;
    
    // `<h3>${show.name}</h3>`;
    recommendationsContainer.appendChild(showElement);
  });
}
