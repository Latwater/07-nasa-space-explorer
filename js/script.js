// ====== NASA Space Explorer ======

// 1. Array of fun space facts
const spaceFacts = [
  "Did you know? The Sun accounts for 99.86% of the mass in our solar system.",
  "Did you know? One million Earths could fit inside the Sun.",
  "Did you know? A day on Venus is longer than its year.",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has the shortest day of all the planets.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? Space is completely silent.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? The International Space Station is the largest man-made object in space."
];

// 2. Show a random fact at the top of the page
const gallery = document.getElementById('gallery');
const container = document.querySelector('.container');

// Create a div for the fact
const factDiv = document.createElement('div');
factDiv.id = 'space-fact';
factDiv.style.margin = '20px 0';
factDiv.style.fontSize = '18px';
factDiv.style.textAlign = 'center';
factDiv.style.color = '#005288'; // NASA blue

// Pick a random fact
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
factDiv.textContent = randomFact;

// Insert the fact above the gallery
container.insertBefore(factDiv, gallery);

// 3. Get references to DOM elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const getImagesBtn = document.querySelector('.filters button');

// 4. NASA API key and endpoint
const API_KEY = 'DEMO_KEY'; // Replace with your own API key for higher limits
const API_URL = 'https://api.nasa.gov/planetary/apod';

// 5. Add event listener to the button
getImagesBtn.addEventListener('click', () => {
  // Get the selected dates
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  // Show loading message
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;

  // Fetch data from NASA APOD API
  fetch(`${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`)
    .then(response => response.json())
    .then(data => {
      // If only one result, wrap in array for consistency
      const items = Array.isArray(data) ? data : [data];
      showGallery(items);
    })
    .catch(error => {
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🚫</div>
          <p>Sorry, something went wrong. Please try again later.</p>
        </div>
      `;
      console.error(error);
    });
});

// 6. Function to display the gallery
function showGallery(items) {
  // If no items, show a message
  if (!items.length) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🛰️</div>
        <p>No images found for this date range.</p>
      </div>
    `;
    return;
  }

  // Create gallery HTML
  gallery.innerHTML = ''; // Clear previous content

  items.forEach((item, idx) => {
    // Create a div for each gallery item
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.tabIndex = 0; // Make it focusable

    // If the item is an image
    if (item.media_type === 'image') {
      // Image element
      div.innerHTML = `
        <img src="${item.url}" alt="${item.title}" style="transition: transform 0.3s;" />
        <h3 style="margin:10px 0 0 0; font-size:18px;">${item.title}</h3>
        <p style="color:#888;">${item.date}</p>
      `;
    } else if (item.media_type === 'video') {
      // Video thumbnail and link
      let thumb = 'img/video-placeholder.jpg'; // fallback thumbnail
      // Try to get YouTube thumbnail if possible
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        const ytId = getYouTubeId(item.url);
        if (ytId) {
          thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }
      div.innerHTML = `
        <a href="${item.url}" target="_blank" style="text-decoration:none;">
          <img src="${thumb}" alt="Video: ${item.title}" style="transition: transform 0.3s;"/>
          <div style="position:absolute;top:10px;right:10px;font-size:24px;">▶️</div>
        </a>
        <h3 style="margin:10px 0 0 0; font-size:18px;">${item.title}</h3>
        <p style="color:#888;">${item.date}</p>
      `;
    }

    // Add click event to open modal
    div.addEventListener('click', () => openModal(item));
    // Keyboard accessibility
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openModal(item);
    });

    gallery.appendChild(div);
  });
}

// 7. Modal logic
// Create modal elements once
let modal = document.createElement('div');
modal.id = 'modal';
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.top = 0;
modal.style.left = 0;
modal.style.width = '100vw';
modal.style.height = '100vh';
modal.style.background = 'rgba(0,0,0,0.8)';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';
modal.style.zIndex = 1000;
modal.innerHTML = `
  <div id="modal-content" style="
    background:white;
    border-radius:10px;
    max-width:600px;
    width:90vw;
    max-height:90vh;
    overflow:auto;
    padding:20px;
    position:relative;
    text-align:center;
  ">
    <button id="modal-close" style="
      position:absolute;
      top:10px;
      right:10px;
      background:#005288;
      color:white;
      border:none;
      border-radius:50%;
      width:32px;
      height:32px;
      font-size:20px;
      cursor:pointer;
    ">&times;</button>
    <div id="modal-body"></div>
  </div>
`;
document.body.appendChild(modal);

// Function to open modal with item details
function openModal(item) {
  const modalBody = document.getElementById('modal-body');
  // Show image or video
  if (item.media_type === 'image') {
    modalBody.innerHTML = `
      <img src="${item.hdurl || item.url}" alt="${item.title}" style="max-width:100%;border-radius:6px;"/>
      <h2 style="margin:15px 0 5px 0;">${item.title}</h2>
      <p style="color:#888;">${item.date}</p>
      <p style="margin-top:10px;text-align:left;">${item.explanation}</p>
    `;
  } else if (item.media_type === 'video') {
    // Embed YouTube if possible, else show link
    let embed = '';
    const ytId = getYouTubeId(item.url);
    if (ytId) {
      embed = `
        <iframe width="100%" height="315" src="https://www.youtube.com/embed/${ytId}" 
          frameborder="0" allowfullscreen style="border-radius:6px;"></iframe>
      `;
    } else {
      embed = `<a href="${item.url}" target="_blank">Watch Video</a>`;
    }
    modalBody.innerHTML = `
      ${embed}
      <h2 style="margin:15px 0 5px 0;">${item.title}</h2>
      <p style="color:#888;">${item.date}</p>
      <p style="margin-top:10px;text-align:left;">${item.explanation}</p>
    `;
  }
  modal.style.display = 'flex';
}

// Close modal on button click or background click
modal.addEventListener('click', (e) => {
  if (e.target.id === 'modal' || e.target.id === 'modal-close') {
    modal.style.display = 'none';
  }
});
// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') modal.style.display = 'none';
});

// 8. Helper to get YouTube video ID from URL
function getYouTubeId(url) {
  // Handles both youtu.be and youtube.com URLs
  let match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&?]+)/);
  return match ? match[1] : null;
}

// ====== End NASA Space Explorer ======
