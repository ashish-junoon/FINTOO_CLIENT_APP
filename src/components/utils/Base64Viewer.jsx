import React from 'react';

const Base64Viewer = ({
    fileName = '',
    fileExtension = '',
    base64Data = ''
}) => {
    // Validate required props
    if (!fileName || !fileExtension || !base64Data) {
        return (
            <div className="w-[1013px] h-[638px] mx-auto p-4 border border-gray-400 rounded-lg flex items-center justify-center bg-red-50 text-red-600">
                <div>
                    <p className="font-medium">Missing required props:</p>
                    <ul className="mt-2 text-sm">
                        {!fileName && <li>• fileName is required</li>}
                        {!fileExtension && <li>• fileExtension is required</li>}
                        {!base64Data && <li>• base64Data is required</li>}
                    </ul>
                </div>
            </div>
        );
    }

    // Function to determine if file is an image
    const isImage = (ext) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        return imageExtensions.includes(ext.toLowerCase());
    };

    // Function to determine if file is a PDF
    const isPDF = (ext) => ext.toLowerCase() === 'pdf';

    // Function to construct complete base64 string with proper prefix
    const getCompleteBase64 = () => {
        const prefix = isImage(fileExtension)
            ? `data:image/${fileExtension};base64,`
            : 'data:application/pdf;base64,';
        return prefix + base64Data;
    };

    // Validate file type
    const isValidFileType = isImage(fileExtension) || isPDF(fileExtension);

    return (
        <div className="w-64 h-40 border border-gray-400 shadow-md rounded-lg mx-auto flex items-center justify-center overflow-hidden bg-white">
            {!isValidFileType ? (
                <div className="text-red-500">
                    Unsupported file type: {fileExtension}
                </div>
            ) : isImage(fileExtension) ? (
                <img
                    src={getCompleteBase64()}
                    alt={fileName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif
                        e.target.className = "hidden";
                        e.target.parentElement.innerHTML = '<div class="text-red-500">Error loading image. Invalid base64 data.</div>';
                    }}
                />
            ) : (
                <embed
                    src={getCompleteBase64()}
                    type="application/pdf"
                    className="w-full h-full rounded-lg"
                />
            )}
        </div>
    );
};

export default Base64Viewer;
