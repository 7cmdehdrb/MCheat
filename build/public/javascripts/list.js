const searchForm = document.querySelector(".js_searchForm2");
const searchInput = document.querySelector(".js_searchInput3");
const js_timeset = document.querySelectorAll(".js_timeset");
const paginator = document.querySelector(".js_paginator");
const paginator_value = document.querySelector(".js_paginator_value");

change_dateformat = (new_date) => {
    const newDate = new Date(new_date);
    let month = newDate.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let date = newDate.getDate();
    if (date < 10) {
        date = "0" + date;
    }
    const newDateFormat = `${month}${date}`;
    return newDateFormat;
};

init = () => {
    js_timeset.forEach((element) => {
        element.innerText = change_dateformat(element.innerText);
    });
};

searchCommunities = () => {
    if (searchInput.value == "") {
        alert("내용을 입력해주세요");
    } else {
        searchForm.submit();
    }
};

setUrl = (index) => {
    let current_url = new URL(window.location.href);
    let search_query = current_url.searchParams;

    search_query.set("page", index);

    current_url.search = search_query.toString();

    let new_url = current_url.toString();

    location.href = new_url;
};

paginator.addEventListener("submit", (ev) => {
    ev.preventDefault();
    setUrl(paginator_value.value);
});

init();
