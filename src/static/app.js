document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // 参加者リスト生成
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <ul class="participants-list">
              ${details.participants.map(p => `
                <li class="participant-item">
                  <span>${p}</span>
                  <span class="delete-icon" title="Remove" data-activity="${name}" data-email="${p}">&#10060;</span>
                </li>
              `).join("")}
            </ul>
          `;
        } else {
          participantsHTML = `<p class="no-participants">No participants yet</p>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsHTML}
          </div>
        `;


        activitiesList.appendChild(activityCard);

        // 削除アイコンのイベントリスナー追加
        setTimeout(() => {
          activityCard.querySelectorAll('.delete-icon').forEach(icon => {
            icon.addEventListener('click', async (e) => {
              const activityName = icon.getAttribute('data-activity');
              const email = icon.getAttribute('data-email');
              if (confirm(`${email} を ${activityName} から登録解除しますか？`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(activityName)}/remove?email=${encodeURIComponent(email)}`, {
                    method: 'DELETE'
                  });
                  const result = await response.json();
                  if (response.ok) {
                    messageDiv.textContent = result.message || 'Removed successfully.';
                    messageDiv.className = 'success';
                    fetchActivities();
                  } else {
                    messageDiv.textContent = result.detail || 'Failed to remove.';
                    messageDiv.className = 'error';
                  }
                  messageDiv.classList.remove('hidden');
                  setTimeout(() => {
                    messageDiv.classList.add('hidden');
                  }, 4000);
                } catch (err) {
                  messageDiv.textContent = 'Error removing participant.';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                }
              }
            });
          });
        }, 0);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
