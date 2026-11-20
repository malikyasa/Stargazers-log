const repositoryList = document.querySelector("#repository-list");
const statusMessage = document.querySelector("#status");

function createRepositoryItem(event) {
  const item = document.createElement("li");
  item.className = "repository";

  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = event.repo.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = event.repo.name;
  heading.append(link);

  const description = document.createElement("p");
  description.textContent = event.repo.description;

  const metadata = document.createElement("p");
  metadata.className = "repository-meta";
  const date = new Date(event.starred_at);
  const formattedDate = Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  metadata.textContent = `${event.repo.language} · Starred ${formattedDate}`;

  item.append(heading, description, metadata);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const events = await response.json();
    const starredRepositories = events.filter(
      (event) => event.type === "starred" && event.repo
    );
    repositoryList.replaceChildren(...starredRepositories.map(createRepositoryItem));
    statusMessage.textContent = starredRepositories.length
      ? ""
      : "No starred repositories yet.";
  } catch (error) {
    console.error("Could not load starred repositories:", error);
    statusMessage.textContent = "Could not load starred repositories. Please try again later.";
  }
}

loadRepositories();
