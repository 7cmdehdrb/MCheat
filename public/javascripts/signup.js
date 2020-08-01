let check = false;
let passwordValid = false;
let passwordConfirm = false;

const nicknameInput = document.querySelector(".js_nickname");
const serverInput = document.querySelector(".js_server");
const guildInput = document.querySelector(".js_guild");
const profileInput = document.querySelector(".js_profile");
const agreeInput = document.querySelector(".js_agree");

document.querySelector(".js_signupForm").addEventListener("submit", (ev) => {
    if (check == false) {
        ev.preventDefault();
        alert("캐릭터 찾기를 해주세요");
        return;
    }

    if (passwordValid == false) {
        ev.preventDefault();
        alert("비밀번호가 충분히 강력하지 않습니다");
        return;
    }

    if (passwordConfirm == false) {
        ev.preventDefault();
        alert("비밀번호가 서로 일치하지 않습니다");
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

function checkPasswordStrength() {
    passwordValid = false;
    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;
    if ($("#inputPassword4").val().length < 6) {
        $("#password-strength-status").removeClass();
        $("#password-strength-status").addClass("alert");
        $("#password-strength-status").addClass("alert-danger");
        $("#password-strength-status").html("비밀번호가 안전도가 너무 낮습니다");
    } else {
        if ($("#inputPassword4").val().match(number) && $("#inputPassword4").val().match(alphabets) && $("#inputPassword4").val().match(special_characters)) {
            $("#password-strength-status").removeClass();
            $("#password-strength-status").addClass("alert");
            $("#password-strength-status").addClass("alert-success");
            if ($("#inputPassword4").val() == $("#inputPasswordConfirm").val()) {
                $("#password-strength-status").html("비밀번호 안전도가 높고 서로 일치합니다. 회원가입을 진행해주세요");
            } else {
                $("#password-strength-status").html("비밀번호 안전도가 높습니다. 비밀번호 확인을 작성해주세요");
            }
            passwordValid = true;
        } else {
            $("#password-strength-status").removeClass();
            $("#password-strength-status").addClass("alert");
            $("#password-strength-status").addClass("alert-warning");
            $("#password-strength-status").html("비밀번호 안전도가 보통입니다. 알파벳, 숫자, 특수문자를 포함시켜주세요");
        }
    }
}

function checkPasswordConfirm() {
    passwordConfirm = false;
    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;
    if ($("#inputPasswordConfirm").val().length < 6) {
        $("#password-strength-status").removeClass();
        $("#password-strength-status").addClass("alert");
        $("#password-strength-status").addClass("alert-danger");
        $("#password-strength-status").html("비밀번호가 안전도가 너무 낮습니다");
    } else {
        if ($("#inputPasswordConfirm").val().match(number) && $("#inputPasswordConfirm").val().match(alphabets) && $("#inputPasswordConfirm").val().match(special_characters)) {
            $("#password-strength-status").removeClass();
            $("#password-strength-status").addClass("alert");
            if ($("#inputPassword4").val() == $("#inputPasswordConfirm").val()) {
                $("#password-strength-status").addClass("alert-success");
                $("#password-strength-status").html("비밀번호 안전도가 높고 서로 일치합니다. 회원가입을 진행해주세요");
                passwordConfirm = true;
            } else {
                $("#password-strength-status").addClass("alert-warning");
                $("#password-strength-status").html("비밀번호 안전도가 높지만 일치하지 않습니다");
            }
        } else {
            $("#password-strength-status").removeClass();
            $("#password-strength-status").addClass("alert");
            $("#password-strength-status").addClass("alert-warning");
            $("#password-strength-status").html("비밀번호 안전도가 보통입니다. 알파벳, 숫자, 특수문자를 포함시켜주세요");
        }
    }
}
