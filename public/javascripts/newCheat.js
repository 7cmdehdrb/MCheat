const nick1 = document.querySelector(".js_nickname1");
const nick2 = document.querySelector(".js_nickname2");
const title = document.querySelector(".js_title");
const server = document.querySelector(".js_server");
const guild = document.querySelector(".js_guild");
const money = document.querySelector(".js_money");
const money_type = document.querySelector(".js_money_type");
const money_to_ko = document.querySelector(".js_money_ko");
const account = document.querySelector(".js_account");
const accout_type = document.querySelector(".js_account_type");
const phone_form = document.querySelector(".js_phone_form");
const phone = document.querySelector(".js_input_phone");
const account_form = document.querySelector(".js_bank_form");
const phone_info = document.querySelector(".js_info_phone");
const account_info = document.querySelector(".js_info_account");
let char_check = false;

function numberToKorean() {
    const number = money.value;
    var inputNumber = number < 0 ? false : number;
    var unitWords = ["", "만", "억", "조", "경"];
    var splitUnit = 10000;
    var splitCount = unitWords.length;
    var resultArray = [];
    var resultString = "";

    for (var i = 0; i < splitCount; i++) {
        var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
        unitResult = Math.floor(unitResult);
        if (unitResult > 0) {
            resultArray[i] = unitResult;
        }
    }

    for (var i = 0; i < resultArray.length; i++) {
        if (!resultArray[i]) continue;
        resultString = String(resultArray[i]) + unitWords[i] + resultString;
    }

    money_to_ko.innerText = `${resultString} ${money_type.value}`;
}

document.querySelector(".js_cheatForm").addEventListener("submit", (ev) => {
    const check = confirm("해당 유저를 등록하시겠습니까? 허위 신고는 경고 없이 계정이 정지될 수 있으며, 신고 내용은 삭제 및 변경할 수 없습니다");

    if (!check) {
        ev.preventDefault();
        return;
    }

    if (phone.value != "") {
        if (Boolean(Number(phone.value.replace(/-/gi, "")))) {
            if (phone.value.replace(/-/gi, "").length != 11) {
                ev.preventDefault();
                alert("휴대폰 번호는 - 제외 11개의 숫자로 이루어져야 합니다");
                return;
            }
        } else {
            ev.preventDefault();
            alert("휴대폰 번호는 숫자와 -만 입력할 수 있습니다");
            return;
        }
    }

    if (accout_type.value != "NOBANK" && account.value < 11) {
        if (!Boolean(Number(account.value.replace(/-/gi, "")))) {
            ev.preventDefault();
            alert("올바른 계좌번호를 입력하거나, 은행 선택을 취소해주세요");
            return;
        }
    }

    if (accout_type.value == "NOBANK" && account.value != "") {
        ev.preventDefault();
        alert("금융사를 선택해주세요");
        return;
    }

    if (!char_check) {
        ev.preventDefault();
        alert("캐릭터 찾기로 조회 후에 사용해주세요");
        return;
    }
});

openPhone = () => {
    if (phone_form.style.display == "none") {
        phone_form.style.display = null;
        phone_info.innerText = "- 추가정보 취소 : 휴대폰 번호";
    } else {
        phone_form.style.display = "none";
        phone_info.innerText = "+ 추가정보 입력 : 휴대폰 번호";
    }
};

openAccout = () => {
    if (account_form.style.display == "none") {
        account_form.style.display = null;
        account_info.innerText = "- 추가정보 취소 : 계좌 번호";
    } else {
        account_form.style.display = "none";
        account_info.innerText = "+ 추가정보 입력 : 계좌 번호";
    }
};

nick1.addEventListener("click", () => {
    char_check = false;
    nick1.removeAttribute("readonly");
});

nick2.addEventListener("click", () => {
    char_check = false;
    nick2.removeAttribute("readonly");
});

checkNickname = async () => {
    nick1.setAttribute("readonly", "readonly");
    nick2.setAttribute("readonly", "readonly");
    char_check = false;

    server.value = "로딩중...";
    guild.value = "로딩중...";

    if (nick1.value == "") {
        alert("닉네임을 작성해주세요");
        return;
    }

    if (title.value.length > 30) {
        alert("제목은 최대 30자까지 작성 가능합니다");
        return;
    }

    if (nick1.value != "" && nick2.value == "") {
        const data = await fetch(`/users/searchNickname?id=${nick1.value}`)
            .then((Response) => Response.json())
            .catch((err) => console.log(err));

        server.value = data.server;
        guild.value = data.guild;
    }

    if (nick1.value != "" && nick2.value != "") {
        const sub = await fetch(`/users/searchNickname?id=${nick1.value}`)
            .then((Response) => Response.json())
            .catch((err) => console.log(err));

        const main = await fetch(`/users/searchNickname?id=${nick2.value}`)
            .then((Response) => Response.json())
            .catch((err) => console.log(err));

        if (sub.guild != "길드없음" && main.guild == "길드없음") {
            guild.value = sub.guild;
        } else {
            guild.value = main.guild;
        }

        server.value = sub.server;
    }

    if (server.value != "캐릭터를 찾을 수 없습니다") {
        char_check = true;
    }

    document.getElementById("inputTextarea").focus();
};
