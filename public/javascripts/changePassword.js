let passwordValid = false;
let passwordConfirm = false;

function checkPasswordStrength() {
    passwordValid = false;
    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;
    if ($("#inputPassword").val().length < 6) {
        $("#password-strength-status").removeClass();
        $("#password-strength-status").addClass("alert");
        $("#password-strength-status").addClass("alert-danger");
        $("#password-strength-status").html("비밀번호가 안전도가 너무 낮습니다");
    } else {
        if ($("#inputPassword").val().match(number) && $("#inputPassword").val().match(alphabets) && $("#inputPassword").val().match(special_characters)) {
            $("#password-strength-status").removeClass();
            $("#password-strength-status").addClass("alert");
            $("#password-strength-status").addClass("alert-success");
            $("#password-strength-status").html("비밀번호 안전도가 높습니다!");
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
    if ($("#inputPassword").val() === $("#inputConfirmPassword").val()) {
        $("#password-strength-status").removeClass();
        $("#password-strength-status").addClass("alert");
        $("#password-strength-status").addClass("alert-success");
        $("#password-strength-status").html("비밀번호가 서로 일치합니다");
        passwordConfirm = true;
    } else {
        $("#password-strength-status").removeClass();
        $("#password-strength-status").addClass("alert");
        $("#password-strength-status").addClass("alert-danger");
        $("#password-strength-status").html("비밀번호가 서로 일치하지 않습니다");
    }
}

window.addEventListener("submit", (ev) => {
    if (passwordValid == false || passwordConfirm == false) {
        ev.preventDefault();
        alert("비밀번호가 충분히 강하지 않거나, 서로 일치하지 않습니다");
        return;
    }

    if ($("#inputPassword").val() == $("#current_password").val()) {
        ev.preventDefault();
        alert("변경할 비밀번호가 현 비밀번호와 같습니다");
        return;
    }
});
