const denoJsonText = await Deno.readTextFile("deno.json");
const packageJsonText = await Deno.readTextFile("package.json");

const denoJson = JSON.parse(denoJsonText);
const packageJson = JSON.parse(packageJsonText);

denoJson.version = packageJson.version;

await Deno.writeTextFile("deno.json", JSON.stringify(denoJson, null, 4));
