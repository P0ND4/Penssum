import io from 'socket.io-client';
import { fileSelection, removeFiles } from '../../api';

export const definePhoto = (files) => {
    const imagesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp/;
    let url = '';
    for (let i = 0; i < files.length; i++) {
        if (imagesAllowed.test(files[i].extname)) {
            url = files[i].url;
            break;
        } else { url = '/img/document_image.svg' };
    };

    return url;
};

export const socketio = API => io(API);

export const changeDate = date => {
    const currentDate = new Date(date);
    let day = currentDate.getDate();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;

    return `${day}-${month}-${year}`;
};

export const fileEvent = {
    insertFiles: async (files, editing, obtainedFiles, setObtainedFiles) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) { formData.append('files', files[i]) };
        const result = await fileSelection(formData);

        if (!editing) setObtainedFiles(result.successfulFiles)
        else {
            if (result.successfulFiles.length > 0) {
                const currentFiles = obtainedFiles;
                setObtainedFiles(null);
                result.successfulFiles.forEach((file, index) => {
                    currentFiles.push(file);
                    if (index + 1 === result.successfulFiles.length) setObtainedFiles(currentFiles);
                });
            };
        }

        if (result.errors.length > 0) { return { error: true, type: 'some files were not uploaded becuase they break file rules' }};
        
        return result;
    },
    uploadFiles: async (files, allowedCount, obtainedFiles, setObtainedFiles) => {
        if (files.length <= allowedCount) {
            const missingAccount = (obtainedFiles === null) ? undefined : -obtainedFiles.length + allowedCount;

            if (missingAccount === undefined) return await fileEvent.insertFiles(files, false, obtainedFiles, setObtainedFiles);

            if (missingAccount > 0) {
                const newCollection = [];
                for (let i = 0; i < missingAccount; i++) { newCollection.push(files[i]) };
                return await fileEvent.insertFiles(newCollection, true, obtainedFiles, setObtainedFiles);
            };
        };

        return { error: true, type: 'Exceeds the number of files allowed' };
    },
    remove: async (currentFile,obtainedFiles, setObtainedFiles) => {
        const currentFiles = [];

        obtainedFiles.forEach((file, index) => {
            if (file.fileName !== currentFile.fileName) currentFiles.push(file);
            if (index + 1 === obtainedFiles.length) return setObtainedFiles((currentFiles.length === 0) ? null : currentFiles);
        });

        await removeFiles(currentFile);
    }
};

export const getRemainTime = (deadline) => {
    const now = new Date();
    const remainTime = (new Date(deadline) - now + 1000) / 1000;
    const remainSeconds = ('0' + Math.floor(remainTime % 60)).slice(-2);
    const remainMinutes = ('0' + Math.floor(remainTime / 60 % 60)).slice(-2);
    const remainHours = ('0' + Math.floor(remainTime / 3600 % 24)).slice(-2);
    const remainDays = Math.floor(remainTime / (3600 * 24));

    return {
        remainTime,
        remainSeconds,
        remainMinutes,
        remainHours,
        remainDays
    };
};