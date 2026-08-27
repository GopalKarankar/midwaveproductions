export function uploadWithProgress({ file, artistId, label, onProgress }) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    if (artistId) formData.append("artistId", artistId);
    if (label) formData.append("label", label);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.asset) {
        resolve(data.asset);
      } else {
        reject({
          status: xhr.status,
          message: data?.error,
          retryAfter: xhr.getResponseHeader("Retry-After"),
        });
      }
    };
    xhr.onerror = () => reject({ status: 0, message: "Network error" });
    xhr.send(formData);
  });
}
