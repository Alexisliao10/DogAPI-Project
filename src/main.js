const api = axios.create({
  baseURL: "https://api.thedogapi.com/v1",
});

api.defaults.headers.common["x-api-key"] =
  "live_t82KCAtGjQe9jDk6CbCj1FKlE2NtCk54qs0YZze3tuAweaKonMrgYQpCwU759VQ7";

queryString = "?limit=3&has_breeds=1";

const API_URL_RANDOM = `https://api.thedogapi.com/v1/images/search${queryString}`;
const API_URL_FAVOURITE = `https://api.thedogapi.com/v1/favourites`;

const apiKey =
  "live_t82KCAtGjQe9jDk6CbCj1FKlE2NtCk54qs0YZze3tuAweaKonMrgYQpCwU759VQ7";

const headers = {
  "content-type": "application/json",
  "x-api-key": apiKey,
};

const options = {
  method: "GET",
  headers: headers,
};

const container = document.querySelector("#container");
const nextDog = document.querySelector("#reload");
const spanError = document.querySelector("#error");
let favouriteDogs = [];

document.addEventListener("DOMContentLoaded", getDog);
document.addEventListener("DOMContentLoaded", getFavourites);

nextDog.addEventListener("click", async () => {
  nextDog.disabled = true;
  await getDog();
  nextDog.disabled = false;
});

async function fetchData(url) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

let randomDogs;

async function getDog() {
  container.removeEventListener("click", handleLikeButtonClick);

  randomDogs = await (async () => {
    try {
      const res = await api.get(`/images/search${queryString}`);
      return res.data;
    } catch (error) {
      throw new Error(error.message);
    }
  })();
  // randomDogs1 = await fetchData(API_URL_RANDOM);
  console.log(randomDogs);
  let images = randomDogs
    .map(
      (item, count) => `
      <figure>
      <img width="300px" src="${item.url}" alt="" />
      <figcaption>${item.breeds[0].name}</figcaption>
      <button class="like-button" data-index="${count}">Love it!</button>
      </figure>
      `,
    )
    .join("");

  container.innerHTML = images;
  container.addEventListener("click", handleLikeButtonClick);
}

function handleLikeButtonClick(event) {
  if (event.target.classList.contains("like-button")) {
    const index = parseInt(event.target.dataset.index, 10);
    addFavourites(randomDogs[index].id);
  }
}

const section = document.querySelector("#favourites");
const title = document.createElement("h2");
title.textContent = "Your favorite doggos";

async function getFavourites() {
  try {
    const { data } = await api.get("/favourites");
    // const data = await fetchData(API_URL_FAVOURITE);
    if (favouriteDogs.length === 0) {
      favouriteDogs.push(...data);
      renderFavourite();
    }
  } catch (error) {
    throw new Error(error);
  }
}

section.addEventListener("click", async (event) => {
  if (event.target.classList.contains("like-button")) {
    const index = parseInt(event.target.dataset.index, 10);
    await removeFavorite(favouriteDogs[index].id);
  }
});
function renderFavourite() {
  renders = favouriteDogs.map((item, index) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const btn = document.createElement("button");

    btn.textContent = "Unlike";
    btn.classList = "like-button";
    btn.dataset.index = index;
    img.width = 300;
    img.src = item.image.url;

    figure.append(img, btn);

    return figure.outerHTML;
  });
  section.innerHTML = [title.outerHTML, ...renders].join("");
}

async function addFavourites(id) {
  try {
    const { data, status } = await api.post("/favourites", {
      image_id: id,
    });
    // const response = await fetch(API_URL_FAVOURITE, {
    //   method: "POST",
    //   headers: headers,
    //   body: JSON.stringify({
    //     image_id: id,
    //   }),
    // });

    if (status === 200) {
      favouriteDogs.length = [];
      console.log("Saved to favourites");
      getFavourites();
    } else {
      console.log("Failed to add to favourites", data.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removeFavorite(id) {
  try {
    const res = await api.delete(`/favourites/${id}`);
    // const response = await fetch(API_URL_FAVOURITE + `/${id}`, {
    //   method: "DELETE",
    //   headers: headers,
    // });
    if (res.status === 200) {
      favouriteDogs.length = [];
      await new Promise((resolve) => setTimeout(resolve(getFavourites()), 500));
      console.log("Deleted from favorites");
    } else {
      spanError.innerText = "There's an error: " + res.status;
    }
  } catch (error) {
    throw new Error(error);
  }
}
