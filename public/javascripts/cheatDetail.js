init = () => {
    const documentDate = document.querySelector(".js_datetime");
    const newDate = new Date(documentDate.innerText);
    const year = newDate.getFullYear();
    let month = newDate.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let date = newDate.getDate();
    if (date < 10) {
        date = "0" + date;
    }
    const newDateFormat = `${year}-${month}-${date}`;
    documentDate.innerText = newDateFormat;
};

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({ placement: "top" });
});

init();
