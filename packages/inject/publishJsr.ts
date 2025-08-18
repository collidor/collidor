const command = new Deno.Command("npx", {
  args: [
    "jsr",
    "publish",
  ],
  cwd: import.meta.dirname!,
  stdin: "inherit",
  stdout: "inherit",
});

const child = command.spawn();
await child.status.then((status) => {
  if (!status.success) {
    throw new Error(`Command failed with exit code ${status.code}`);
  }
});
