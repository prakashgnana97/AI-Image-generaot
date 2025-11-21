export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const extractVideoFrames = async (videoFile: File, frameCount: number = 3): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];
    const objectUrl = URL.createObjectURL(videoFile);

    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = async () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      const interval = duration / (frameCount + 1);

      try {
        for (let i = 1; i <= frameCount; i++) {
          video.currentTime = interval * i;
          await new Promise<void>(r => {
            const seekHandler = () => {
              video.removeEventListener('seeked', seekHandler);
              r();
            };
            video.addEventListener('seeked', seekHandler);
          });
          
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Get base64 without prefix
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress slightly for API size limits
            frames.push(dataUrl.split(',')[1]);
          }
        }
        URL.revokeObjectURL(objectUrl);
        resolve(frames);
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(e);
    };
  });
};
