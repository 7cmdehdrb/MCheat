const searchForm = document.querySelector(".js_searchForm2");
const searchInput = document.querySelector(".js_searchInput3");

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
