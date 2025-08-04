import type { Node } from "ts-morph"

import { Project, SyntaxKind } from "ts-morph"

// Load the project from tsconfig.json
const project = new Project({
  tsConfigFilePath: "tsconfig.json", // Ensure this points to the correct tsconfig.json
})

// Process all TypeScript source files
project.getSourceFiles().forEach((sourceFile) => {
  console.log(`Processing file: ${sourceFile.getFilePath()}`)

  let hasChanges = false

  sourceFile.forEachDescendant((node) => {
    if (
      node.getKind() === SyntaxKind.ArrowFunction ||
      node.getKind() === SyntaxKind.FunctionDeclaration ||
      node.getKind() === SyntaxKind.MethodDeclaration
    ) {
      const functionNode = node as Node // ✅ Correctly cast node to a generic Node

      if (!functionNode.getFirstChildByKind(SyntaxKind.ColonToken)) {
        try {
          const signature = functionNode.getType().getCallSignatures()[0]
          if (signature) {
            const returnType = signature.getReturnType().getText()
            console.log(
              `Adding return type: ${returnType} to ${functionNode.getText().slice(0, 50)}...`,
            )
            functionNode.replaceWithText(
              `${functionNode.getText()}: ${returnType}`,
            )
            hasChanges = true
          }
        } catch (error) {
          console.error(
            `Error processing function in ${sourceFile.getFilePath()}:`,
            error,
          )
        }
      }
    }
  })

  if (hasChanges) {
    sourceFile.saveSync() // Save only if changes were made
  }
})

console.log("✅ Return types added successfully!")
