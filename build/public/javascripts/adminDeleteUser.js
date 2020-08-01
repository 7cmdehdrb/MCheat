deleteUser = (userEmail) => {
    let confirm = prompt(`유저를 완전히 삭제하며, 복구할 수 없습니다\n정말 삭제하려면 \n<${userEmail}을(를) 완전히 삭제합니다.> 라고 입력해주세요`);
    if (confirm == `${userEmail}을(를) 완전히 삭제합니다.`) {
        location.href = `/admin/deleteUser?id=${userEmail}`;
    } else {
        alert("잘못 입력하셨습니다. 다시 시도해주세요");
    }
};
