import { images } from "./images.json";
import Fuse from "fuse.js";

/**
 * The home page's search engine is built upon the FuseSearch
 * function exported here, which does text search via fuse.js.
 */

// The fields in the images json to consider when conducting search.
const options = {
  keys: ["title", "description"],
};

// The Fuse object used, which is built off the image json and searches the fields in options.
const fuse = new Fuse(images, options);

//The FuseSearch method used for actually searching through the images json.
export default function FuseSearch(input) {
  if (input === "") {
    return images;
  }
  return fuse.search(input).map((item) => item["item"]);
}
