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

document.addEventListener("DOMContentLoaded", getRandomDog);
document.addEventListener("DOMContentLoaded", getFavourites);

nextDog.addEventListener("click", getRandomDog);

async function fetchData(url) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

async function getRandomDog() {
  try {
    const data = await fetchData(API_URL_RANDOM);
    let images = data
      .map(
        (item, count) => `
      <figure>
      <img width="300px" src="${item.url}" alt="" />
      <figcaption>${item.breeds[0].name}</figcaption>
      <button id="like${count++}">Love it!</button>
      </figure>
      `
      )
      .join("");

    container.innerHTML = images;

    const btn0 = document.querySelector("#like0");
    const btn1 = document.querySelector("#like1");
    const btn2 = document.querySelector("#like2");
    btn0.onclick = () => addToFavourites(data[0].id);
    btn1.onclick = () => addToFavourites(data[1].id);
    btn2.onclick = () => addToFavourites(data[2].id);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getFavourites() {
  const data = await fetchData(API_URL_FAVOURITE);
  const renders = [];
  const section = document.querySelector("#favourites");

  data.forEach((item) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const btn = document.createElement("button");
    btn.textContent = "Unlike";
    img.width = 300;
    img.src = item.image.url;

    figure.append(img, btn);
    renders.push(figure.outerHTML);
  });

  section.innerHTML = renders.join("");
}

async function addToFavourites(id) {
  const response = await fetch(API_URL_FAVOURITE, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      image_id: id,
    }),
  });
  console.log("saved");
  getFavourites();
}
