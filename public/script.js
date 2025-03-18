document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded, userId:", window.userId);
  
  // Check if search input exists
  const searchInput = document.getElementById('searchInput');
  
  if (searchInput) {
    console.log("Search input found, adding event listeners");
    
    searchInput.addEventListener('keyup', function(event) {
      const query = event.target.value;
      
      if (query.length > 2) {
        console.log("Searching for:", query);
        
        fetch(`/search-tv-shows?q=${encodeURIComponent(query)}`)
          .then(response => response.json())
          .then(data => {
            console.log("Search results:", data.length, "shows found");
            
            const searchResults = document.getElementById('searchResults');
            if (!searchResults) {
              console.error("Search results container not found");
              return;
            }
            
            searchResults.innerHTML = '';
            
            if (data.length === 0) {
              searchResults.innerHTML = '<p class="no-results">No shows found matching your search.</p>';
              return;
            }
            
            // Create a container for the results
            const resultsGrid = document.createElement('div');
            resultsGrid.className = 'search-results-grid';
            searchResults.appendChild(resultsGrid);
            
            data.forEach(show => {
              if (!show.id) {
                console.warn("Show missing ID:", show);
                return;
              }
              
              const showDiv = document.createElement('div');
              showDiv.className = 'show-item';
              showDiv.id = `show_${show.id}`;
              
              // Check for poster path
              const posterPath = show.poster_path ? 
                `https://image.tmdb.org/t/p/w500${show.poster_path}` : 
                '/images/Placeholder.png';
                
              // Updated HTML structure to match hub cards style with hover effects
              showDiv.innerHTML = `
                <div class="show-card">
                  <a href="/pages/show/${show.id}" class="image-link">
                    <img src="${posterPath}" alt="${show.name || 'TV Show'}" class="show-poster">
                  </a>
                  
                  <div class="hub-card-content">
                    <h4>${show.name || 'Unknown Title'}</h4>
                  </div>
                  
                  <div id="messageBox-${show.id}" class="message-box"></div>
                  
                  <div class="show-icons">
                    <button class="icon-button watched" data-id="${show.id}" data-name="${show.name || ''}" data-poster="${show.poster_path || ''}">
                      <img src="/images/Watched.png "  style="height: 30px; width 40px;" alt="Mark as Watched"">
                    </button>
                    <button class="icon-button watchlist" data-id="${show.id}" data-name="${show.name || ''}" data-poster="${show.poster_path || ''}">
                      <img src="/images/Watching.png" style="height: 30px; width 40px;"  alt="Add to Watchlist">
                    </button>
                  </div>
                </div>
              `;
              
              resultsGrid.appendChild(showDiv);
            });
            
            // Add event listeners to the action buttons
            const actionButtons = document.querySelectorAll('.icon-button');
            actionButtons.forEach(button => {
              button.addEventListener('click', handleActionClick);
            });
          })
          .catch(error => {
            console.error('Error searching shows:', error);
            const searchResults = document.getElementById('searchResults');
            if (searchResults) {
              searchResults.innerHTML = '<p class="error">Error searching for shows. Please try again.</p>';
            }
          });
      }
    });
  }


});

// Handle action button clicks
function handleActionClick(event) {
  event.preventDefault();
  
  const button = event.currentTarget;
  const showId = button.dataset.id;
  const showName = button.dataset.name;
  const showPoster = button.dataset.poster;
  const userId = window.userId;
  
  if (!userId) {
    console.error('User ID not found');
    alert('Please log in to add shows to your lists.');
    return;
  }
  
  if (!showId) {
    console.error('Show ID not found');
    return;
  }
  
  // Create or get message box
  let messageBox = document.getElementById(`messageBox-${showId}`);
  
  // Determine action type based on button class
  let endpoint;
  let actionType;
  
  // Removed favorite option since we're consolidating
  if (button.classList.contains('watched')) {
    endpoint = `/shows/watched/add/${userId}`;
    actionType = 'watched';
  } else if (button.classList.contains('watchlist')) {
    endpoint = `/shows/watchlist/add/${userId}`;
    actionType = 'watchlist';
  } else {
    console.error('Unknown action type');
    return;
  }
  
  console.log(`Adding show ${showId} to ${actionType}`);
  
  // Send the request
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: showId,
      name: showName,
      poster_path: showPoster
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (!messageBox) {
      messageBox = document.createElement('div');
      messageBox.id = `messageBox-${showId}`;
      messageBox.className = 'message-box';
      const hubCard = button.closest('.hub-card');
      hubCard.querySelector('.hub-card-content').after(messageBox);
    }
    
    // Show success message
    messageBox.textContent = data.message || `Added to ${actionType}`;
    messageBox.classList.add('success');
    
    // Clear message after delay
    setTimeout(() => {
      if (messageBox) {
        messageBox.textContent = '';
        messageBox.classList.remove('success');
      }
    }, 2000);
    
    // If show was added to watched, offer to rate it immediately
    if (actionType === 'watched') {
      setTimeout(() => {
        const cardContent = button.closest('.hub-card');
        
        // Create a rating button if it doesn't already exist
        if (!cardContent.querySelector('.rating-button-container')) {
          const ratingButton = document.createElement('div');
          ratingButton.className = 'rating-button-container';
          ratingButton.innerHTML = `
            <button type="button" class="btn btn-primary rating-btn" onclick="showRatingModal(${showId}, '${showName}')">
              <i class="bi bi-star-fill"></i> Add Rating
            </button>
          `;
          cardContent.appendChild(ratingButton);
        }
      }, 2100);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    
    if (!messageBox) {
      messageBox = document.createElement('div');
      messageBox.id = `messageBox-${showId}`;
      messageBox.className = 'message-box';
      const hubCard = button.closest('.hub-card');
      hubCard.querySelector('.hub-card-content').after(messageBox);
    }
    
    messageBox.textContent = 'Error: ' + (error.message || 'Unknown error');
    messageBox.classList.add('error');
    
    setTimeout(() => {
      messageBox.textContent = '';
      messageBox.classList.remove('error');
    }, 2000);
  });
}

// Function to display an inline rating modal
function showRatingModal(showId, showName) {
  // Create a modal dynamically
  const modalId = `ratingModal${showId}`;
  
  // Check if modal already exists
  if (document.getElementById(modalId)) {
    // Just show it instead of creating a new one
    const existingModal = new bootstrap.Modal(document.getElementById(modalId));
    existingModal.show();
    return;
  }
  
  // Create new modal
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = modalId;
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', `ratingModalLabel${showId}`);
  modal.setAttribute('aria-hidden', 'true');
  
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="ratingModalLabel${showId}">Rate "${showName}"</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Rate "${showName}" from 1 to 5 stars.</p>
          <form action="/users/update-rating" method="POST">
            <div class="rating-stars">
              <div class="rating-value">Select rating: <span id="ratingValue${showId}">0</span>/5</div>
              <div class="star-container">
                <% for(let i = 1; i <= 5; i++) { %>
                  <span class="star" data-rating="${i}" onclick="setRating('${showId}', ${i})">
                    <i class="bi bi-star"></i>
                  </span>
                <% } %>
              </div>
              <input type="hidden" id="ratingInput${showId}" name="rating" value="">
              <input type="hidden" name="userId" value="${window.userId}">
              <input type="hidden" name="showId" value="${showId}">
            </div>
            <button type="submit" class="btn btn-success btn-bottom">Submit Rating</button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Initialize and show the modal
  const bootstrapModal = new bootstrap.Modal(document.getElementById(modalId));
  bootstrapModal.show();
}

// Function to handle star rating selection
function setRating(showId, rating) {
  // Update hidden input value
  document.getElementById('ratingInput' + showId).value = rating;
  document.getElementById('ratingValue' + showId).textContent = rating;
  
  // Update star appearance
  const stars = document.querySelector('#rateModal' + showId).querySelectorAll('.star');
  stars.forEach((star, index) => {
    const starRating = parseInt(star.dataset.rating);
    
    // Reset all stars
    star.innerHTML = '<i class="bi bi-star"></i>';
    
    // Fill stars up to selected rating
    if (starRating <= rating) {
      star.innerHTML = '<i class="bi bi-star-fill"></i>';
    }
  });
}

// Make these functions available globally
window.showRatingModal = showRatingModal;
window.setRating = setRating;





