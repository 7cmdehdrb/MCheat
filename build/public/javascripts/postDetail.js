const commentForm = document.querySelector(".js_commentForm");
const commentInput = document.querySelector(".js_commentInput");
const likecnt = document.querySelector(".js_likecnt");

commentSubmit = () => {
    if (commentInput.value == "") {
        alert("댓글 내용을 작성해주세요");
    } else if (commentInput.value.length > 300) {
        alert("댓글작성은 최대 300자까지 가능합니다");
    } else {
        commentForm.submit();
    }
};

deleteComment = (id) => {
    let msg = prompt("삭제된 댓글은 복구할 수 없습니다. 정말 지우시려면 <댓글을 삭제합니다.> 라고 입력해주세요");

    if (msg == "댓글을 삭제합니다.") {
        location.href = `/communities/deleteComment?id=${id}`;
    } else {
        alert("문구가 일치하지 않습니다. 다시 입력해주세요");
    }
};

deletePost = (id) => {
    let msg = prompt("삭제된 게시글은 복구할 수 없습니다. 정말 지우시려면 <게시글을 삭제합니다.> 라고 입력해주세요");

    if (msg == "게시글을 삭제합니다.") {
        location.href = `/communities/deletePost?id=${id}`;
    } else {
        alert("문구가 일치하지 않습니다. 다시 입력해주세요");
    }
};

likePost = async (id, like) => {
    await fetch(`/communities/recommendPost?id=${id}&like=${like}`)
        .then((Response) => Response.json())
        .then((json) => {
            if (json.success == false) {
                alert("(비)추천에 실패하였습니다");
            } else {
                if (json.method == "pull") {
                    alert("취소하였습니다");
                } else {
                    if (like == "true") {
                        alert("추천했습니다");
                    } else {
                        alert("비추천했습니다");
                    }
                }
                location.reload();
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

changeDate = () => {
    const documentDate = document.querySelector(".js_datetime");
    const newDate = new Date(documentDate.innerText);
    const year = newDate.getFullYear() + "";

    const twoYear = year.split("");

    let month = newDate.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let date = newDate.getDate();
    if (date < 10) {
        date = "0" + date;
    }

    const newDateFormat = `${twoYear[2]}${twoYear[3]}${month}${date}`;
    documentDate.innerText = newDateFormat;
};

init = () => {
    changeDate();
};

init();
