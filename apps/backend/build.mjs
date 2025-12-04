import { build } from "esbuild"
import { nodeExternals } from "esbuild-plugin-node-externals"

async function main() {
  await build({
    entryPoints: ["./src/server.ts"],
    bundle: true,
    outfile: "./dist/server.js",
    platform: "node",
    plugins: [
      nodeExternals({
        packagePaths: "package.json",
        include: ["@ab/shared", "@ab/transactional"],
      }),
    ],
  })
}

main()
