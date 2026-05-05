// Mobile menu toggle
const menuBar = document.getElementById("menuBar");
const navLinks = document.getElementById("navLinks");

if (menuBar) {
  menuBar.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });
}

// Close menu when clicking outside on mobile
document.addEventListener("click", function (event) {
  if (window.innerWidth <= 800) {
    if (
      navLinks &&
      !navLinks.contains(event.target) &&
      !menuBar.contains(event.target)
    ) {
      navLinks.classList.remove("active");
    }
  }
});

// Handle Contact Form Submission with Supabase
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const level = document.getElementById("level")?.value;
    const message = document.getElementById("message")?.value;

    // Get or create status div
    let statusDiv = document.getElementById("formStatus");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.id = "formStatus";
      contactForm.appendChild(statusDiv);
    }

    statusDiv.innerHTML = '<p style="color: blue;">Sending message...</p>';

    try {
      const result = await submitContactForm({ name, email, level, message });
      statusDiv.innerHTML =
        '<p style="color: green;">✓ Message sent successfully! We\'ll get back to you soon.</p>';
      contactForm.reset();

      // Clear success message after 5 seconds
      setTimeout(() => {
        statusDiv.innerHTML = "";
      }, 5000);
    } catch (error) {
      statusDiv.innerHTML = `<p style="color: red;">✗ Error: ${error.message}. Please try again.</p>`;
    }
  });
}

// Handle Newsletter Subscription
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value;

    let statusDiv = document.getElementById("newsletterStatus");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.id = "newsletterStatus";
      newsletterForm.appendChild(statusDiv);
    }

    statusDiv.innerHTML = '<p style="color: blue;">Subscribing...</p>';

    try {
      await subscribeNewsletter(email);
      statusDiv.innerHTML =
        '<p style="color: green;">✓ Successfully subscribed to newsletter!</p>';
      newsletterForm.reset();
      setTimeout(() => {
        statusDiv.innerHTML = "";
      }, 5000);
    } catch (error) {
      statusDiv.innerHTML =
        '<p style="color: red;">✗ This email is already subscribed or invalid.</p>';
    }
  });
}

// Load dynamic school updates from Supabase
async function loadSchoolUpdates() {
  try {
    const updates = await getSchoolUpdates();
    const articlesContainer = document.querySelector(".articles-container");

    if (updates && updates.length > 0 && articlesContainer) {
      // Add Supabase updates at the top
      updates.forEach((update) => {
        const updateElement = document.createElement("article");
        updateElement.className = "article-card";
        updateElement.setAttribute("data-aos", "fade-up");
        updateElement.innerHTML = `
                        <div class="article-content">
                            <h4>📢 ${update.title}</h4>
                            <div class="meta">${new Date(update.created_at).toLocaleDateString()} • School News</div>
                            <p>${update.content}</p>
                        </div>
                    `;
        articlesContainer.insertBefore(
          updateElement,
          articlesContainer.firstChild,
        );
      });
    }
  } catch (error) {
    console.error("Error loading updates:", error);
  }
}

loadSchoolUpdates();
