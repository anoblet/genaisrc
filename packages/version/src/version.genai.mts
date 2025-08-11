import { model, envBoolean } from "../../utility/src/utility.ts";

// Register script metadata for integration with the automation framework
script({
  model,
  title: "Version",
  description: "Automatically determine and apply appropriate version bump for deployment",
});

/**
 * Analyzes git commits since the last version tag to determine the appropriate version bump.
 * Uses conventional commit standards and semantic versioning:
 * - MAJOR: breaking changes (BREAKING CHANGE, !)
 * - MINOR: new features (feat)
 * - PATCH: bug fixes (fix), chores (chore), docs (docs), style (style), refactor (refactor)
 *
 * @returns {Promise<string>} The version bump type: "major", "minor", or "patch"
 */
export const analyzeVersionBump = async (): Promise<string> => {
  console.log("Analyzing commits since last version tag...");

  // Get the latest version tag
  const latestTag = await git
    .exec(["describe", "--tags", "--abbrev=0"])
    .catch(() => "");
  console.log(`Latest tag: ${latestTag || "none"}`);

  // Get commits since the latest tag
  const commitRange = latestTag ? `${latestTag}..HEAD` : "--all";
  const commits = await git.exec([
    "log",
    "--oneline",
    "--pretty=format:%s",
    commitRange,
  ]);

  if (!commits.trim()) {
    console.log("No new commits since last tag, skipping version bump");
    return "none";
  }

  console.log("Commits to analyze:");
  commits.split("\n").forEach((commit) => console.log(`  - ${commit}`));

  // Analyze commit messages for version impact
  const commitLines = commits.split("\n").filter((line) => line.trim());
  let hasMajor = false;
  let hasMinor = false;
  let hasPatch = false;

  for (const commit of commitLines) {
    const message = commit.toLowerCase().trim();

    // Check for breaking changes (major version bump)
    if (
      message.includes("breaking change") ||
      message.includes("!:") ||
      message.includes("! ")
    ) {
      hasMajor = true;
      console.log(`  ✓ Major change detected: ${commit}`);
    }
    // Check for new features (minor version bump)
    else if (message.startsWith("feat(") || message.startsWith("feat:")) {
      hasMinor = true;
      console.log(`  ✓ Minor change detected: ${commit}`);
    }
    // Check for patches (patch version bump)
    else if (
      message.startsWith("fix(") ||
      message.startsWith("fix:") ||
      message.startsWith("chore(") ||
      message.startsWith("chore:") ||
      message.startsWith("docs(") ||
      message.startsWith("docs:") ||
      message.startsWith("style(") ||
      message.startsWith("style:") ||
      message.startsWith("refactor(") ||
      message.startsWith("refactor:") ||
      message.startsWith("perf(") ||
      message.startsWith("perf:") ||
      message.startsWith("test(") ||
      message.startsWith("test:")
    ) {
      hasPatch = true;
      console.log(`  ✓ Patch change detected: ${commit}`);
    }
  }

  // Determine version bump priority (major > minor > patch)
  if (hasMajor) {
    return "major";
  } else if (hasMinor) {
    return "minor";
  } else if (hasPatch) {
    return "patch";
  } else {
    // Default to patch for any commits that don't follow conventional format
    console.log(
      "No conventional commits detected, defaulting to patch version bump"
    );
    return "patch";
  }
};

/**
 * Applies the version bump using npm version command
 *
 * @param {string} bumpType - The type of version bump: "major", "minor", "patch", or "none"
 * @returns {Promise<void>}
 */
export const applyVersionBump = async (bumpType: string): Promise<void> => {
  if (bumpType === "none") {
    console.log("No version bump needed");
    return;
  }

  console.log(`Applying ${bumpType} version bump...`);

  try {
    // Apply version bump using npm version (works with package.json)
    await host.exec(`npm version ${bumpType} --no-git-tag-version`);
    console.log(`Version bump successful`);

    // Read the package.json file to get the new version
    const packageJsonFile = await workspace.readText("package.json");
    const packageJson = JSON.parse(packageJsonFile.content);
    const newVersion = packageJson.version;
    console.log(`New version: ${newVersion}`);

    // Stage the package.json changes
    await git.exec(["add", "package.json"]);

    // Create a version commit
    await git.exec(["commit", "-m", `chore: bump version to ${newVersion}`]);

    // Create a git tag
    const tagName = `v${newVersion}`;
    await git.exec(["tag", tagName]);

    console.log(`Created version tag: ${tagName}`);

    // Push changes and tags if configured
    if (envBoolean("GENAISCRIPT_VERSION_PUSH")) {
      console.log("Pushing version changes and tags...");
      await git.exec(["push"]);
      await git.exec(["push", "--tags"]);
    } else {
      console.log(
        "Push disabled. Run 'git push && git push --tags' manually to publish version."
      );
    }
  } catch (error) {
    console.error("Version bump failed:", error);
    throw error;
  }
};

/**
 * Main version management function that analyzes commits and applies appropriate version bump
 *
 * @returns {Promise<void>}
 */
export const version = async (): Promise<void> => {
  console.log("Starting version management...");

  const bumpType = await analyzeVersionBump();
  console.log(`Determined version bump type: ${bumpType}`);

  await applyVersionBump(bumpType);

  console.log("Version management complete!");
};

export default version;

// Run the main function when executed directly
await version();
