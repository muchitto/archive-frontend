import { File, getMetadataOriginalFiles, Metadata } from '../../../inc/Archive/Metadata';

interface BookFileListProps {
  metadata: Metadata
  onSelect: (file: File) => void
}

export default function BookFileList ({ metadata, onSelect } : BookFileListProps) {
  const files = getMetadataOriginalFiles(metadata);

  return (
    <div>
      {files.map(file => (
        <div key={file.name}>
          <button onClick={() => {
            onSelect(file);
          }} className="text-left">
            {file.name}
          </button>
        </div>
      ))}
    </div>
  );
}
