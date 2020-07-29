openRoom = (roomId) => {
    window.open(`/messages/groupMessageRoom?room=${roomId}`, "_blank", "width=500, right=0, menubar=0, statue=0, titlebar=0, toolbar=0");
};

deleteRoom = (roomId) => {
    let message = prompt("이 그룹을 정말 삭제하시려면 <그룹을 삭제합니다.> 라고 입력해주세요");

    if (message == "그룹을 삭제합니다.") {
        location.href = `/messages/deleteGroup?room=${roomId}`;
    } else {
        alert("삭제 방지 문구가 일치하지 않습니다");
    }
};
