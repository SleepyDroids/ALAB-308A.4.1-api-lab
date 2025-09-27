// R-ALAB 308A.4.1: Working with External Data
// axios version

/*
What I need to adjust for axios: 
- All my fetch requests
- Inteceptors for progress and when not in progress (so an indicator that the API is loading)

Example from Quinn: 
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }
);
*/

// console.log("testing that I linked the axios file");

import {
  appendCarousel,
  clear,
  createCarouselItem,
  start,
} from "./Carousel.js";

// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
const bodyEl = document.querySelector("body");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_t9JFx3Wn50bwDCcHdU7n1N3Dig99VjOA2SKzbfwYuuWOpVofzzM5JJ06iIXiEnbv";
const baseUrl = "https://api.thecatapi.com/v1/";

const config = {
  // will add configurations here as needed for my axios requests
  method: "get",
  baseURL: "https://api.thecatapi.com/v1/",
  headers: {
    "x-api-key": API_KEY,
  },
  onDownloadProgress: function (progressEvent) {
    console.log(progressEvent);
  },
};

// Setting up global axios defaults according to the docs
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.common["x-api-key"] = API_KEY;

//https://api.thecatapi.com/v1/images/search?limit=10&breed_ids=beng&api_key=REPLACE_ME

async function initialLoad() {
  try {
    const getCats = await axios.get(`/breeds`);
    // console.log(getCats);
    const catData = await getCats.data;
    // console.log(catData);

    catData.forEach((breed) => {
      // console.log(breed.name);
      // console.log(breedSelect);
      // creating new options
      const createOption = document.createElement("option");
      createOption.value = breed.id;
      createOption.textContent = breed.name;
      // each value attribute needs to equal the id
      // each display text is equal to name of the breed

      breedSelect.appendChild(createOption);
    });
  } catch (error) {
    console.error(error);
  }
}

// ****************** INTERCEPTORS ******************
axios.interceptors.request.use((request) => {
  console.log("Sending out a request!");
  bodyEl.style.cursor = "progress";
  return request;
});

axios.interceptors.response.use(
  (response) => {
    console.log("Data received successfully!");
    bodyEl.style.cursor = "default";
    progressBar.style.width = "0%";

    // console.log(response); // just testing to see how it works
    return response;
  },
  (error) => {
    console.log("Response is unsuccessful.");

    throw error;
  }
);
// ****************** END OF INTERCEPTORS ******************

function updateProgess() {}

initialLoad();

// setting up event listener
breedSelect.addEventListener("change", getCatInfo);

// setting up async function to be used inside of the event listener
async function getCatInfo(e) {
  // can use 'e' here because it is passed through my event listener
  // console.log(e.target.value);
  // console.log(targetValue); // Thanks for the help Jade!
  // I'm using the e.target.value to grab the breed.id from earlier directly from the HTML element
  // and inputting it into the fetch url since that is an option of grabbing data according to the
  // CAT API documentation
  // Also when I added my key, it gave me access to the breed information with the images as well
  // previous API request in the earlier function only gave me breed information
  try {
    // setting up parameters like I had in the fetch version where I had the e.target.value
    // in the template literal and then the &limit=10
    // from the axios docs:
    // `params` are the URL parameters to be sent with the request
    // Must be a plain object or a URLSearchParams object
    const params = { params: { breed_ids: e.target.value, limit: 10 } };
    // passing
    const getCats = await axios.get(`/images/search`, params);
    // console.log(getCats)
    const catData = await getCats.data;

    clear(); // clear before looping through data
    // looping to grab cat data from the API

    catData.forEach((info) => {
      // for each object in the array, create a new element for the carousel
      // needs three arguments: imgsrc, imgalt, imgID -- stash the corresponding info into a variable
      // I need to find where in the api I can retrieve that information
      // console.log(info.breeds[0].name);
      const catImagesAlt = e.target.textContent;
      const catImages = info.url;
      const catImageId = info.id;

      let newCarousel = createCarouselItem(catImages, catImagesAlt, catImageId);
      appendCarousel(newCarousel); // function imported from Carousel.js

      // beginning of logic for number range values from Cat API
      if (info.breeds[0].shedding_level == 3) {
        info.breeds[0].shedding_level = "Moderate amount of shedding";
      } else if (info.breeds[0].shedding_level <= 2) {
        info.breeds[0].shedding_level = "Low amount of shedding";
      } else {
        info.breeds[0].shedding_level = "High amount of shedding";
      }

      if (info.breeds[0].hypoallergenic == 0) {
        info.breeds[0].hypoallergenic = "Not hypoallergenic";
      } else {
        info.breeds[0].hypoallergenic = "Hypoallergenic";
      }

      if (info.breeds[0].alt_names == "") {
        info.breeds[0].alt_names = "No alternative names known";
      } else {
        info.breeds[0].alt_names = info.breeds[0].alt_names;
      }

      // beginning of information to be added to the infoDump section
      infoDump.innerHTML = `
    <h3>Additional Information</h3>
    <ul>
      <li><b>Name:</b> ${info.breeds[0].name}
      <li><b>Alternative Names:</b> ${info.breeds[0].alt_names}
      <li><b>Origin:</b> ${info.breeds[0].origin}
      <li><b>Hypoallergenic?</b> ${info.breeds[0].hypoallergenic}
      <li><b>Shedding Level:</b> ${info.breeds[0].shedding_level}
      <li><b>Weight:</b> ${info.breeds[0].weight.imperial} lbs / ${info.breeds[0].weight.metric} kilograms
      <li><b>Life Span:</b> ${info.breeds[0].life_span} years
      <li><b>Temperament:</b> ${info.breeds[0].temperament}
      <li><b>General Description:</b> ${info.breeds[0].description}
    </ul>  
    <p>For more information, please visit the <a href="${info.breeds[0].wikipedia_url}">${info.breeds[0].name}</a> Wikipedia page.
    `; // end of innerHTML template lieteral
    });
  } catch (error) {
    console.error(error);
  }

  start(); // append Carousel and add Info Dump then start
} // end of catInfo() async function

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  // your code here
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
