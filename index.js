const input = document.querySelector(".search__input");
const list = document.querySelector(".repos-list");
const saved = document.querySelector(".repos-saved");

async function getRepos(input) {
  const repos = `https://api.github.com/search/repositories?q=${input}`;

  let response = await fetch(repos);
  let data = await response.json();

  return data.items;
}

function sortData(results, query) {
  return results.sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    const queryLower = query.toLowerCase();

    const aStartsWith = aLower.startsWith(queryLower);
    const bStartsWith = bLower.startsWith(queryLower);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    if (aLower < bLower) return -1;
    if (aLower > bLower) return 1;

    return 0;
  });
}

function addListItems(results) {
  list.innerHTML = "";
  if (results.length === 0) return;

  for (let i = 0; i < 5; i++) {
    let item = document.createElement("li");
    item.textContent = `${results[i].name}`;
    list.append(item);

    item.addEventListener("click", () => addToSaved(results[i]));
  }
}

async function handleInput() {
  let inputSearch = input.value;

  if (inputSearch.length > 0) {
    const result = await getRepos(inputSearch);
    const sortedData = sortData(result, inputSearch);
    addListItems(sortedData);
  } else {
    addListItems([]);
  }
}

function debounce(fn, debounceTime) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), debounceTime);
  };
}

function addToSaved(item) {
  const savedItem = `<li class="saved-item"> 
  <div class="saved-item__left">
  <span>Name: ${item.name}</span>
  <span>Owner: ${item.owner.login}</span>
  <span>Stars: ${item.stargazers_count}</span>
  </div>
  <button class="item-delete">
  <span class="item-delete__svg"></span>
</button>
  </li>`;
  saved.insertAdjacentHTML("beforeend", savedItem);
  addListItems([]);
}

function deleteFromSaved(event) {
  const buttons = document.getElementsByTagName("button");
  for (let button of buttons) {
    if (button.contains(event.target)) {
      saved.removeChild(button.parentNode);
    }
  }
}

const getReposWithDelay = debounce(handleInput, 300);

input.addEventListener("input", getReposWithDelay);
saved.addEventListener("click", deleteFromSaved);
