const publishJsr = new Deno.Command("deno", {
  args: [
    "publish",
    "--token",
    Deno.env.get("JSR_TOKEN")!,
  ],
  env: Deno.env.toObject(),
  cwd: import.meta.dirname!,
  stdin: "inherit",
  stdout: "inherit",
});

const installNpm = new Deno.Command("npm", {
  args: [
    "install",
  ],
  env: Deno.env.toObject(),
  cwd: import.meta.dirname!,
  stdin: "inherit",
  stdout: "inherit",
});

const publishNpm = new Deno.Command("npm", {
  args: [
    "publish",
    "--provenance",
    "--access",
    "public", // Recommended for scoped packages (@collidor/result)
  ],
  env: Deno.env.toObject(),
  cwd: import.meta.dirname!,
  stdin: "inherit",
  stdout: "inherit",
});

const onError = (status: Deno.CommandStatus) => {
  if (!status.success) {
    throw new Error(`Command failed with exit code ${status.code}`);
  }
};

await Promise.all([
  publishJsr.spawn().status.then(onError),
  installNpm.spawn().status.then(onError).then(() =>
    publishNpm.spawn().status.then(onError)
  ),
]);
