const searchForm = document.querySelector(".js_searchForm");
const searchInput = searchForm.querySelector(".js_searchInput2");
const paginator = document.querySelector(".js_paginator");
const paginator_value = document.querySelector(".js_paginator_value");

deleteUser = (userEmail) => {
    let confirm = prompt(
        `유저를 완전히 삭제하며, 복구할 수 없으며, 예상치 못한 오류를 야기할 수 있습니다\n시스템상 이상이 발생한 경우가 아니라면 절대 삭제하지 마십시오\n정말 삭제하려면 \n<${userEmail}>을(를) 완전히 삭제합니다.> 라고 입력해주세요`
    );
    if (confirm == `${userEmail}을(를) 완전히 삭제합니다.`) {
        location.href = `/admin/deleteUser?id=${userEmail}`;
    }
};

searchSubmit = () => {
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
