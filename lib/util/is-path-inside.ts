import { path } from '../../dependencies.ts';

/**
 * Resolves and normalizes a path, including following symlinks.
 * Returns the path as-is if it does not exist on disk.
 */
const realPathSilent = async (filePath: string): Promise<string> => {
    try {
        return await Deno.realPath(filePath);
    }
    catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return filePath;
        }
        throw error;
    }
};

/**
 * Returns `true` if `childPath` is a descendant of `parentPath`. Otherwise returns `false`,
 * including if both paths are equal. The paths are resolved and normalized before comparing
 * them but symlinks are not followed and neither path needs to exist on disk.
 * 
 * Use `isPathInside.fs()` instead to also follow symlinks, which requires filesystem access.
 */
const isPathInside = (childPath: string, parentPath: string): boolean => {
    const relation = path.relative(parentPath, childPath);
    return Boolean(
        relation &&
        relation !== '..' &&
        !relation.startsWith('..' + path.SEP) &&
        relation !== path.resolve(childPath)
    );
};

/**
 * Similar to `isPathInside()` but follows symlinks before comparing the paths. If a path does
 * not exist on disk, it is compared as-is, after being resolved and normalized.
 * 
 * Requires `allow-read` permission for both paths. Also requires `allow-read` for the CWD if
 * either path is relative.
 */
isPathInside.fs = async (childPath: string, parentPath: string): Promise<boolean> => {
    const [realChildPath, realParentPath] = await Promise.all([
        realPathSilent(childPath),
        realPathSilent(parentPath)
    ]);
    return isPathInside(realChildPath, realParentPath);
};

export default isPathInside;
