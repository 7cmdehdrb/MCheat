const paginator = document.querySelector(".js_paginator");
const paginator_value = document.querySelector(".js_paginator_value");

const more_char = document.querySelector(".js_more_char");
let charIdx = 0;

moreChar = () => {
    charIdx += 10;
    for (let i = 0; i < charIdx; i++) {
        try {
            document.querySelector(`#char${i}`).style.display = null;
        } catch (error) {
            more_char.style.display = "none";
            break;
        }
    }
};

const more_phone = document.querySelector(".js_more_phone");
let phoneIdx = 0;

morePhone = () => {
    phoneIdx += 10;
    for (let i = 0; i < phoneIdx; i++) {
        try {
            document.querySelector(`#phone${i}`).style.display = null;
        } catch (error) {
            more_phone.style.display = "none";
            break;
        }
    }
};

const more_account = document.querySelector(".js_more_account");
let accountIdx = 0;

moreAccount = () => {
    accountIdx += 10;
    for (let i = 0; i < accountIdx; i++) {
        try {
            document.querySelector(`#account${i}`).style.display = null;
        } catch (error) {
            more_account.style.display = "none";
            break;
        }
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
