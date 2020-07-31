let check = false;

const nicknameInput = document.querySelector(".js_nickname");
const serverInput = document.querySelector(".js_server");
const guildInput = document.querySelector(".js_guild");
const profileInput = document.querySelector(".js_profile");
const bioInput = document.querySelector(".js_bioInput");

document.addEventListener("submit", (ev) => {
    if (check == false) {
        ev.preventDefault();
        alert("캐릭터 찾기를 해주세요");
        return;
    }

    if (bioInput.value.length > 50) {
        ev.preventDefault();
        alert("한줄소개는 최대 50자까지 작성 가능합니다");
        return;
    }
});

nicknameInput.addEventListener("click", () => {
    check = false;
    nicknameInput.removeAttribute("readonly");
});

checkNickname = () => {
    nicknameInput.setAttribute("readonly", "readonly");
    check = false;

    const nickname = nicknameInput.value;
    serverInput.value = "로딩중...";
    guildInput.value = "로딩중...";
    fetch(`/users/searchNickname?id=${nickname}`)
        .then((Response) => Response.json())
        .then((json) => {
            serverInput.value = json.server;
            guildInput.value = json.guild;
            profileInput.value = json.profile;
            if (json.server != "캐릭터를 찾을 수 없습니다") {
                check = true;
            }
        })
        .catch((err) => console.log(err));
};

agree = () => {
    agreeInput.checked = true;
};
