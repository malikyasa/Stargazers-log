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
  description.textContent = event.repo.description || "No description available.";

  const metadata = document.createElement("p");
  metadata.className = "repository-meta";
  const date = new Date(event.starred_at || "");
  const formattedDate = Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  metadata.textContent = `${event.repo.language || "Unknown language"} · Starred ${formattedDate}`;

  item.append(heading, description, metadata);
  return item;
}

function getStarredRepositories(data) {
  if (!Array.isArray(data)) {
    throw new Error("Expected repository data to be an array");
  }

  return data.filter((event) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      throw new Error("Expected each repository event to be an object");
    }

    if (event.type !== "starred") {
      return false;
    }

    const repository = event.repo;
    if (
      !repository ||
      typeof repository !== "object" ||
      Array.isArray(repository) ||
      typeof repository.name !== "string" ||
      !repository.name.trim() ||
      typeof repository.url !== "string"
    ) {
      throw new Error("Starred repository is missing required fields");
    }

    let url;
    try {
      url = new URL(repository.url);
    } catch {
      throw new Error("Starred repository has an invalid URL");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Starred repository has an invalid URL");
    }

    if (
      (repository.description !== undefined &&
        repository.description !== null &&
        typeof repository.description !== "string") ||
      (repository.language !== undefined &&
        repository.language !== null &&
        typeof repository.language !== "string")
    ) {
      throw new Error("Starred repository has invalid display fields");
    }
    if (
      event.starred_at !== undefined &&
      event.starred_at !== null &&
      typeof event.starred_at !== "string"
    ) {
      throw new Error("Starred repository has an invalid starred_at");
    }

    return true;
  });
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const events = await response.json();
    const starredRepositories = getStarredRepositories(events);
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
