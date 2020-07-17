import { NamedStat } from '../util/read-dir-stats.ts';
import { React } from '../../dependencies.ts';

interface DirectoryListingProps {
    basePath: string,
    files: Array<NamedStat>
}

const DirectoryListing = (props: DirectoryListingProps) => {
    const { basePath, files } = props;
    return (
        <html>
            <body>
                <h1>Directory: {'/' + basePath}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Created</th>
                            <th>Modified</th>
                        </tr>
                    </thead>
                    {
                        basePath !== '' && (
                            <tr>
                                <td>📂</td>
                                <td><a href="..">Parent Directory (..)</a></td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        )
                    }
                    {files.map((file) => {
                        // TODO: Format file.size with Intl.NumberFormat when Deno supports it
                        // const sizeFormatter = new Intl.NumberFormat('en-US', {
                        //     style       : 'unit',
                        //     unit        : 'byte',
                        //     unitDisplay : 'long'
                        // });
                        return (
                            <tr key={file.name}>
                                <td>{file.isDirectory ? '📁' : '📝'}</td>
                                <td><a href={file.name + (file.isDirectory ? '/' : '')}>{file.name}</a></td>
                                <td>{file.isDirectory ? '-' : `${file.size} bytes`}</td>
                                <td>{file.birthtime?.toLocaleDateString()}</td>
                                <td>{file.mtime?.toLocaleDateString()}</td>
                            </tr>
                        );
                    })}
                </table>
            </body>
        </html>
    );
};

export default DirectoryListing;
