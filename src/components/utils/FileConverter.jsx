// FileConverter function
export const FileConverter = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("No file provided.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};