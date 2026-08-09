const pkgJson = JSON.parse(await Deno.readTextFile("./package.json"));
const pkgName = pkgJson.name;
const localVersion = pkgJson.version;

const viewCommand = new Deno.Command("npm", {
  args: ["view", pkgName, "version"],
  stdout: "piped",
  stderr: "null",
});

const viewOutput = await viewCommand.output();
const publishedVersion = new TextDecoder().decode(viewOutput.stdout).trim();

if (publishedVersion === localVersion) {
  console.log(`Skipping, ${pkgName}@${localVersion} is already published to npm.`);
  Deno.exit(0);
}

console.log(`Publishing ${pkgName}@${localVersion} to npm...`);
const publishCommand = new Deno.Command("npm", {
  args: ["publish", "--access", "public"],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

const publishStatus = await publishCommand.spawn().status;
if (!publishStatus.success) {
  Deno.exit(publishStatus.code);
}
