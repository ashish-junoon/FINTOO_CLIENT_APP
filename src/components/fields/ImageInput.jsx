import { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/getCroppedImg";
import ModalTwo from "../utils/modalTow";

function ImageInput({ name, id, label, onChange, onBlur, value, disabled, style, aspect }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [rawImage, setRawImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const inputRef = useRef();

    // Set preview when value changes (after cropping or external set)
    useEffect(() => {
        if (value instanceof File) {
            const reader = new FileReader();
            reader.onload = () => setImageSrc(reader.result);
            reader.readAsDataURL(value);
        } else if (typeof value === "string") {
            setImageSrc(value);
        } else {
            setImageSrc(null);
        }
    }, [value]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.match(/image\/(jpeg|jpg|png)/)) {
            const reader = new FileReader();
            reader.onload = () => {
                setRawImage({ file, dataUrl: reader.result });
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid JPEG or PNG image.");
        }
    };

    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels || !rawImage) return;

        const croppedFile = await getCroppedImg(rawImage.dataUrl, croppedAreaPixels, rawImage.file.name);

        if (croppedFile.size > 1024 * 1024) {
            alert("Cropped image is too large. Try cropping a smaller area.");
            return;
        }

        // Set preview and send file to parent
        const previewReader = new FileReader();
        previewReader.onload = () => setImageSrc(previewReader.result);
        previewReader.readAsDataURL(croppedFile);

        onChange(croppedFile);

        // Reset
        setShowCropper(false);
        setRawImage(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setRawImage(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <>
            <div
                className={`image-uploader cursor-pointer rounded border border-gray-300 overflow-hidden max-w-[350px] aspect-[1.586] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={!disabled ? () => inputRef.current?.click() : undefined}
            >
                <input
                    type="file"
                    ref={inputRef}
                    name={name}
                    id={id}
                    accept="image/jpeg,image/jpg,image/png"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Uploaded"
                        className={`object-cover w-full h-full ${style}`}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-center p-4 text-sm text-gray-500">
                        {label}
                    </div>
                )}
            </div>

            {showCropper && rawImage && (
                <ModalTwo onClose={handleCancelCrop} size="sm">
                    <div className="w-full aspect-[1.586] relative">
                        <Cropper
                            image={rawImage.dataUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect ?? 1.586}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={handleCropComplete}
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={handleCancelCrop}
                            className="px-3 py-1.5 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                        >
                            Cancel
                        </button>
                        <button
                        type="button"
                            onClick={handleCropConfirm}
                            className="px-3 py-1.5 text-sm bg-primary text-white hover:bg-blue-700 rounded"
                        >
                            Confirm
                        </button>
                    </div>
                </ModalTwo>
            )}
        </>
    );
}

export default ImageInput;
