const titleInput = document.querySelector(".js_titleInput");
const fileInput = document.querySelector(".js_inputFile");

function getExtension(filename) {
    var parts = filename.split(".");
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
        case "jpg":
        case "gif":
        case "bmp":
        case "png": //etc
            return true;
    }
    return false;
}

window.addEventListener("submit", (ev) => {
    try {
        if (fileInput.value != "") {
            if (!isImage(fileInput.value)) {
                ev.preventDefault();
                alert("사진첨부는 .jpg, .png, .gif 파일만 가능합니다");
                return;
            }
        }
    } catch (error) {
        console.log(error);
    }
});
