import fs from "fs";

const html = fs.readFileSync(".next/server/app/index.html", "utf8");
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if (!match) {
  console.error("FAIL: application/ld+json script tag not found!");
  process.exit(1);
}

const json = JSON.parse(match[1]);
console.log("SUCCESS: JSON-LD parsed validly!");
console.log("Schema Context:", json["@context"]);

const org = json["@graph"].find((item) => item["@type"] === "Organization");
if (!org) {
  console.error("FAIL: Organization entity not found in @graph");
  process.exit(1);
}

console.log("Organization Name:", org.name);
console.log("Organization URL:", org.url);
console.log("Organization Logo:", JSON.stringify(org.logo, null, 2));

if (org.logo["@type"] !== "ImageObject") {
  console.error("FAIL: logo is not an ImageObject");
  process.exit(1);
}
if (!org.logo.url.startsWith("https://newbhar.com/")) {
  console.error("FAIL: logo.url is not an absolute HTTPS URL");
  process.exit(1);
}
if (org.logo.url !== org.logo.contentUrl) {
  console.error("FAIL: logo.url and logo.contentUrl mismatch");
  process.exit(1);
}
if (org.logo.width !== 512 || org.logo.height !== 512) {
  console.error("FAIL: logo dimensions missing or incorrect");
  process.exit(1);
}

console.log("\nALL SCHEMA VALIDATIONS PASSED CLEANLY!");
