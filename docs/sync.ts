let versionsJson: Record<string, string> = {};

for await (const dirEntry of Deno.readDir("../packages")) {
  const denoJsonText = await Deno.readTextFile(
    "../packages/" + dirEntry.name + "/deno.json",
  );
  const denoJson = JSON.parse(denoJsonText);
  versionsJson[dirEntry.name] = denoJson.version;
}

await Deno.writeTextFile(
  "./src/versions.json",
  JSON.stringify(versionsJson, null, 4),
);
