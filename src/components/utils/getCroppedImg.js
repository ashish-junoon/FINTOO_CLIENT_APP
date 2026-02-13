import { createImage, getRadianAngle } from "./imageUtils";

const getCroppedImg = async (imageSrc, pixelCrop, fileName) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                const file = new File([blob], fileName, { type: "image/jpeg" });
                resolve(file);
            },
            "image/jpeg",
            0.8 // compression quality
        );
    });
};

export default getCroppedImg;
