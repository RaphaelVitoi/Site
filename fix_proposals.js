/* eslint-env node, es6 */
const fs = require("node:fs");

const targetPath =
  "c:/Users/Raphael/.gemini/Site/.gemini/.vscode/cli/serve-web/8b640eef5a6c6089c029249d48efa5c99adf7d51/extensions/copilot/package.json";

try {
  const pkg = JSON.parse(fs.readFileSync(targetPath, "utf8"));

  // Restricted proposals mapped from the severity 8 warnings
  const restrictedProposals = new Set([
    "agentSessionsWorkspace",
    "chatDebug",
    "chatHooks",
    "contribCommentThreadAdditionalMenu",
    "documentFiltersExclusive",
    "embeddings",
    "mappedEditsProvider",
    "chatParticipantPrivate",
    "chatProvider",
    "contribDebugCreateConfiguration",
    "chatReferenceDiagnostic",
    "textSearchProvider2",
    "chatReferenceBinaryData",
    "languageModelSystem",
    "languageModelCapabilities",
    "languageModelPricing",
    "inlineCompletionsAdditions",
    "chatStatusItem",
    "chatInputNotification",
    "taskProblemMatcherStatus",
    "contribLanguageModelToolSets",
    "textDocumentChangeReason",
    "resolvers",
    "taskExecutionTerminal",
    "dataChannels",
    "languageModelThinkingPart",
    "chatSessionsProvider",
    "devDeviceId",
    "contribEditorContentMenu",
    "chatPromptFiles",
    "mcpServerDefinitions",
    "tabInputMultiDiff",
    "workspaceTrust",
    "environmentPower",
    "terminalTitle",
    "toolInvocationApproveCombination",
    "chatSessionCustomizationProvider",
  ]);

  if (pkg.enabledApiProposals) {
    const originalLength = pkg.enabledApiProposals.length;
    pkg.enabledApiProposals = pkg.enabledApiProposals.filter(
      (p) => !restrictedProposals.has(p)
    );

    fs.writeFileSync(targetPath, JSON.stringify(pkg, null, 2), "utf8");
    console.log(
      `Successfully removed ${originalLength - pkg.enabledApiProposals.length} restricted API proposals and formatted the file.`
    );
  }
} catch (error) {
  console.error("Error updating package.json:", error.message);
}
