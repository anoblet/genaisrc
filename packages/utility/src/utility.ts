import { minimatch } from "minimatch";

/**
 * Filters a list of files based on provided include and exclude extension lists.
 * - If both include and exclude are empty, returns all files.
 * - Handles both string filenames and file objects with a filename property.
 * - Excludes files if their extension is in the exclude list, even if included.
 * @param files List of files (string or object with filename)
 * @param include Array of file extensions to include (optional)
 * @param exclude Array of file extensions to exclude (optional)
 * @returns Filtered array of files
 */
export const filterFiles = ({ files, include = [], exclude = [] }) => {
  if (!files || files.length === 0) return [];
  if (include.length === 0 && exclude.length === 0) return files;
  return files.filter((file) => {
    // Support both string filenames and file objects
    const filename = typeof file === "string" ? file : file.filename;
    // Extract file extension (handles files with no extension gracefully)
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    // If include is empty, all extensions are considered included; otherwise, check membership
    const isIncluded = include.length === 0 || include.includes(ext);
    // Exclude takes precedence: if extension is in exclude, always filter out
    const isExcluded = exclude.length > 0 && exclude.includes(ext);
    return isIncluded && !isExcluded;
  });
};

/**
 * Filters a list of files based on glob patterns for include and exclude.
 * - If includePattern is provided, only files matching it are considered
 * - If includePattern is not set, all files are considered valid initially
 * - excludePattern is then applied to filter out matching files
 * - Handles both string filenames and file objects with a filename property
 * @param files List of files (string or object with filename)
 * @param includePattern Glob pattern for files to include (optional)
 * @param excludePattern Glob pattern for files to exclude (optional)
 * @returns Filtered array of files
 */
export const filterFilesByGlob = ({
  files,
  includePattern,
  excludePattern,
}) => {
  if (!files || files.length === 0) return [];

  return files.filter((file) => {
    // Support both string filenames and file objects
    const filename = typeof file === "string" ? file : file.filename;

    // If include pattern is set, file must match it
    if (includePattern && !minimatch(filename, includePattern)) {
      return false;
    }

    // If exclude pattern is set and file matches it, exclude the file
    if (excludePattern && minimatch(filename, excludePattern)) {
      return false;
    }

    return true;
  });
};

/**
 * Returns the array if it is defined and non-empty, otherwise undefined.
 * Useful for chaining fallback logic.
 * @param array Input array
 * @returns The array itself or undefined
 */
export const getArray = (array) => {
  // Return undefined for undefined or empty arrays to simplify fallback checks
  if (array === undefined || array.length == 0) return undefined;

  return array;
};

/**
 * Retrieves a list of files, prioritizing env.files, then staged git files.
 * Applies include/exclude filtering to the resulting list.
 * @param exclude Array of file extensions to exclude (optional)
 * @param include Array of file extensions to include (optional)
 * @param includePattern Glob pattern for files to include (optional, from GENAISCRIPT_MESSAGE_INCLUDE)
 * @param excludePattern Glob pattern for files to exclude (optional, from GENAISCRIPT_MESSAGE_EXCLUDED_PATHS)
 * @returns Promise resolving to filtered file list
 */
export const getFiles = async ({
  exclude,
  include,
  includePattern,
  excludePattern,
}: {
  exclude?;
  include?;
  includePattern?;
  excludePattern?;
}) => {
  const stageAll = envBoolean("GENAISCRIPT_STAGE_ALL");

  // Collect candidate files from highest to lowest priority:
  // 1. Files specified in env.files
  // 2. Currently staged files in git
  // 3. If stageAll is true, stage all files and use that list
  const files =
    getArray(env.files) ||
    getArray(await git.listFiles("staged")) ||
    (stageAll ? stageFiles() : false);

  let filteredFiles = files;

  // First apply glob pattern filtering if provided
  if (includePattern || excludePattern) {
    filteredFiles = filterFilesByGlob({
      files: filteredFiles,
      includePattern,
      excludePattern,
    });
  } else {
    // If no glob patterns, apply traditional extension-based filtering
    filteredFiles = filterFiles({ files: filteredFiles, include, exclude });
  }

  return filteredFiles;
};

/**
 * Stages files for git commit.
 * - If files are provided, stages only those files.
 * - If no files are provided, stages all changes.
 * Returns the list of staged files after operation.
 * @param files Array of file objects with 'filename' property (optional)
 * @returns Promise resolving to list of staged files
 */
export const stageFiles = async ({ files } = { files: [] }) => {
  if (files.length > 0) {
    for (const file of files) {
      // Stage each specified file individually; avoids staging unrelated changes
      await git.exec(["add", file.filename]);
    }
  } else {
    // If no files specified, stage all changes (equivalent to 'git add -A')
    await git.exec(["add", "-A"]);
  }

  // Always return the current list of staged files after staging operation
  return await git.listFiles("staged");
};

/**
 * Converts a comma-separated environment variable string to a normalized array.
 * - Trims whitespace and lowercases each item.
 * - Returns empty array if input is falsy or empty.
 * @param key Environment variable key to read from process.env
 * @returns Array of normalized strings
 */
export const envArray = (key) => {
  const envVar = process.env[key];
  // Defensive: handle undefined, null, or empty string input
  if (!envVar || envVar.length === 0) return [];
  // Normalize: split, trim, and lowercase each entry for consistent matching
  return envVar.split(",").map((item) => item.trim().toLowerCase());
};

/**
 * Retrieves a string environment variable value.
 * - Returns undefined if the environment variable is not set or empty.
 * @param key Environment variable key to read from process.env
 * @returns String value or undefined
 */
export const envString = (key) => {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
};

/**
 * Converts an environment variable value to a boolean.
 * - Returns true for "true" (case-insensitive)
 * - Returns false for "false", undefined, null, empty string, or any other value
 * @param key Environment variable key to read from process.env
 * @returns Boolean value based on the environment variable
 */
export const envBoolean = (key) => {
  const value = process.env[key];
  if (value === undefined || value === null || value.length === 0) {
    return false; // Default to false for undefined, null, or empty strings
  }

  if (value.toLowerCase() === "true") {
    return true;
  } else if (value.toLowerCase() === "false") {
    return false;
  } else {
    return false; // Default to false for other cases
  }
};

export const envNumber = (key) => {
  const value = process.env[key];
  if (value === undefined || value === null || value.length === 0) {
    return 0; // Default to 0 for undefined, null, or empty strings
  } else {
    const number = Number(value);
    return isNaN(number) ? 0 : number; // Return 0 if conversion fails
  }
};

export const getModel = () => {
  // Retrieve the model identifier from the environment for downstream API/model selection
  return process.env.GENAISCRIPT_MODEL;
};

export const model = getModel();
