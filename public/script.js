

document.addEventListener('click', function(event) {
  if (event.target.matches('.add-to-watched-btn')) {
    const showId = event.target.getAttribute('data-show-id');
    openRatingModal(showId);
  }
});


document.addEventListener('click', function(event) {
  if (event.target.matches('.add-to-favorites-btn')) {
    const showId = event.target.getAttribute('data-show-id');
    addToFavorites(showId);
  } else if (event.target.matches('.add-to-watchlist-btn')) {
    const showId = event.target.getAttribute('data-show-id');
    addToWatchList(showId);
  } else if (event.target.matches('.add-to-watched-btn')) {
    const showId = event.target.getAttribute('data-show-id');
    addToWatched(showId);
  } else if (event.target.matches('.close') || event.target.matches('#submitRating')) {
    closeRatingModal();
  }
});


// document.addEventListener('click', function(event) {
//   if (event.target.matches('.add-to-watched-btn')) {
//     const showId = event.target.getAttribute('data-show-id');
//     openRatingModal(showId);
//   } else if (event.target.matches('.close') || event.target.matches('#submitRating')) {
//     closeRatingModal();
//   }
// });


// STAR RATING

document.getElementById('ratingOptions').addEventListener('click', function(event) {
  if (event.target.matches('.star')) {
    const selectedRating = event.target.dataset.value;
    highlightStars(selectedRating);
  }
});

function highlightStars(rating) {
  const stars = document.querySelectorAll('#ratingOptions .star');
  stars.forEach(star => {
    star.style.color = star.dataset.value <= rating ? 'gold' : 'grey';
  });

  // Save the rating in the modal dataset for submission
  const modal = document.getElementById('ratingModal');
  modal.dataset.rating = rating;
}


//RATING MODAL


function addToWatched(showId) {
  openRatingModal(showId);  // Open the rating modal when a show is marked as watched
}

function openRatingModal(showId) {
  const modal = document.getElementById('ratingModal');
  if (!modal) {
    console.error('Rating modal not found');
    return;
  }

  const ratingOptions = document.getElementById('ratingOptions');

  ratingOptions.innerHTML = ''; // Clear previous stars
  for (let i = 1; i <= 10; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.dataset.value = i; // 1-10 for half-star increments
    star.innerHTML = i % 2 === 0 ? '&#9733;' : '&#9734;';
    ratingOptions.appendChild(star);
  }

  modal.dataset.showId = showId; // Show the modal
  modal.style.display = 'block';
}

function closeRatingModal() {
  const modal = document.getElementById('ratingModal');
  modal.style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeRatingModal);

// Submit rating

document.getElementById('submitRating').addEventListener('click', function() {
  const modal = document.getElementById('ratingModal');
  const showId = modal.dataset.showId;
  const rating = modal.dataset.rating;

  fetch('/add-rated-show', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ showId: showId, rating: rating }),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    closeRatingModal();
  })
  .catch(error => console.error('Error:', error));
});


// Add to favorites

function addToFavorites(showId) {
  fetch('/add-to-favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ showId: showId })
  })

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
      displayRecommendations(showId, recommendations);
    })
    .catch(error => console.error('Error fetching recommendations:', error));
}


// Display recommendations

function displayRecommendations(showId, recommendations) {
  let recommendationsContainer = document.getElementById(`recommendations_${showId}`);
  
  // If the container doesn't exist, create it and place it after the selected show
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






