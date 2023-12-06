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

document.addEventListener("DOMContentLoaded", getDog);
nextDog.addEventListener("click", getDog);

async function fetchData(url) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

async function getDog() {
  try {
    const data = await fetchData(API_URL_RANDOM);
    let images = data
      .map(
        (item, count) => `
      <figure>
      <img width="300px" src="${item.url}" alt="" />
      <figcaption>${item.breeds[0].name}</figcaption>
      <button class="like-button" data-index="${count++}">Love it!</button>
      </figure>
      `,
      )
      .join("");

    container.innerHTML = images;

    container.addEventListener("click", (event) => {
      if (event.target.classList.contains("like-button")) {
        const index = parseInt(event.target.dataset.index, 10);
        addFavourites(data[index].id);
      }
    });

    getFavourites();
  } catch (error) {
    throw new Error(error.message);
  }
}
async function getFavourites() {
  try {
    const data = await fetchData(API_URL_FAVOURITE);
    console.log("🚀 ~ file: main.js:68 ~ getFavourites ~ data:", data);

    const section = document.querySelector("#favourites");
    const title = document.createElement("h2");
    title.textContent = "Your favorite doggos";

    renders = data.map((item, index) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const btn = document.createElement("button");

      btn.textContent = "Unlike";
      btn.classList = "like-button";
      img.width = 300;
      img.src = item.image.url;

      figure.append(img, btn);

      btn.dataset.index = index;
      return figure.outerHTML;
    });

    section.innerHTML = [title.outerHTML, ...renders].join("");

    section.addEventListener("click", (event) => {
      if (event.target.classList.contains("like-button")) {
        const index = parseInt(event.target.dataset.index, 10);
        removeFavorite(data[index].id);
      }
    });
  } catch (error) {
    throw new Error(error);
  }
}

async function addFavourites(id) {
  const response = await fetch(API_URL_FAVOURITE, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      image_id: id,
    }),
  });

  if (response.status === 200) {
    console.log("Saved to favourites");
    getFavourites();
  } else {
    console.log("Failed to add to favourites");
  }
}

async function removeFavorite(id) {
  const response = await fetch(API_URL_FAVOURITE + `/${id}`, {
    method: "DELETE",
    headers: headers,
  });
  if (response.status === 200) {
    console.log("Deleted from favorites");
    getFavourites();
  } else {
    spanError.innerText = "There's an error: " + response.status;
  }
}
