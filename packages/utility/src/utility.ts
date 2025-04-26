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
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        // If include is empty, all extensions are considered included; otherwise, check membership
        const isIncluded = include.length === 0 || include.includes(ext);
        // Exclude takes precedence: if extension is in exclude, always filter out
        const isExcluded = exclude.length > 0 && exclude.includes(ext);
        return isIncluded && !isExcluded;
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
}

/**
 * Retrieves a list of files, prioritizing env.files, then staged git files.
 * Applies include/exclude filtering to the resulting list.
 * @param exclude Array of file extensions to exclude (optional)
 * @param include Array of file extensions to include (optional)
 * @returns Promise resolving to filtered file list
 */
export const getFiles = async ({ exclude, include }: { exclude?, include?}) => {
    // Prefer env.files, fallback to staged git files, or undefined if none
    // getArray ensures only non-empty arrays are used for selection
    const files = getArray(env.files) || getArray(await git.listFiles("staged")) || undefined;
    // Always apply filterFiles, even if files is undefined (handled by filterFiles)
    const filteredFiles = filterFiles({ files, include, exclude });
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
 * @param envVar Comma-separated string from environment variable
 * @returns Array of normalized strings
 */
export const envArray = (envVar) => {
    // Defensive: handle undefined, null, or empty string input
    if (!envVar || envVar.length === 0) return [];
    // Normalize: split, trim, and lowercase each entry for consistent matching
    return envVar.split(',').map((item) => item.trim().toLowerCase());
}