import { path } from '../../dependencies.ts';

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

const isPathInside = (childPath: string, parentPath: string): boolean => {
    const relation = path.relative(parentPath, childPath);
    return Boolean(
        relation &&
        relation !== '..' &&
        !relation.startsWith('..' + path.SEP) &&
        relation !== path.resolve(childPath)
    );
};

isPathInside.fs = async (childPath: string, parentPath: string): Promise<boolean> => {
    const [realChildPath, realParentPath] = await Promise.all([
        realPathSilent(childPath),
        realPathSilent(parentPath)
    ]);
    return isPathInside(realChildPath, realParentPath);
};

export default isPathInside;
