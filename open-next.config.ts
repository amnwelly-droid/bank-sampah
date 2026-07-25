import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  edgeExternals: ["node:crypto", "node:buffer"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  override: {
    wrapper: "cloudflare-node",
    converter: "edge",
    incrementalCache: "dummy",
    tagCache: "dummy",
    queue: "dummy",
  },
});
