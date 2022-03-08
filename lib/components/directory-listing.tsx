import { NamedStat } from '../util/read-dir-stats.ts';
import { React } from '../../dependencies.ts';

interface DirectoryListingProps {
    basePath: string,
    files: Array<NamedStat>
}

const tableStyles = {
    display             : 'grid',
    gap                 : '0 1em',
    gridTemplateColumns : 'repeat(5, fit-content(15em))'
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day      : '2-digit',
    month    : '2-digit',
    timeZone : 'UTC',
    year     : 'numeric'
});
const sizeFormatter = new Intl.NumberFormat(undefined, {
    style       : 'unit',
    unit        : 'byte',
    unitDisplay : 'long'
});

const breadcrumb = (path: string) => {
    const parts = ['/', ...path.split('/').filter(Boolean)];
    const links = parts.flatMap((part, index) => {
        const href = (index === parts.length - 1) ? './' : '../'.repeat(parts.length - 1 - index);
        const link = <a key={href} href={href}>{part}</a>;
        return (index < 2) ? link : ['/', link];
    });
    return links;
};

const DirectoryListing = (props: DirectoryListingProps) => {
    const { basePath, files } = props;
    return (
        <html>
            <body>
                <h1>Directory: {breadcrumb(basePath)}</h1>
                <table style={tableStyles}>
                    <thead style={{ display : 'contents', textAlign : 'left' }}>
                        <tr style={{ display : 'contents' }}>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Created</th>
                            <th>Modified</th>
                        </tr>
                    </thead>
                    <tbody style={{ display : 'contents', whiteSpace: 'nowrap' }}>
                        {
                            basePath !== '' && (
                                <tr style={{ display : 'contents' }}>
                                    <td>📂</td>
                                    <td><a href="..">Parent Directory (..)</a></td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            )
                        }
                        {files.map((file) => {
                            return (
                                <tr key={file.name} style={{ display : 'contents' }}>
                                    <td>{file.isDirectory ? '📁' : '📝'}</td>
                                    <td style={{ overflow : 'hidden', textOverflow: 'ellipsis' }}><a href={file.name + (file.isDirectory ? '/' : '')}>{file.name}</a></td>
                                    <td style={{ overflow : 'hidden', textOverflow: 'ellipsis' }}>{file.isDirectory ? '-' : sizeFormatter.format(file.size)}</td>
                                    <td>{file.birthtime ? dateFormatter.format(file.birthtime) : '-'}</td>
                                    <td>{file.mtime ? dateFormatter.format(file.mtime) : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </body>
        </html>
    );
};

export default DirectoryListing;
