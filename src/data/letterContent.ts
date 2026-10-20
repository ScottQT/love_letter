/**
 * Edit this file to personalize the letter.
 * The handwriting engine reads `message` and `signature` only.
 * Leave `recipientName` empty to keep the heading as written,
 * or set a name and the heading becomes "Gửi {name}".
 */
export const letterContent = {
  recipientName: "",
  heading: "Gửi cô gái anh mà anh theo đuổi",
  subtitle: "Nhân ngày 20/10, anh muốn tự tay viết cho em.",
  envelopeLine: "Lá thư gửi em nhân ngày 20/10",
  openButton: "Mở lá thư",
  scrollHint: "Cuộn xuống để đọc thư",
  message: `Gửi Kiều Trang - cô gái anh mà anh theo đuổi,

Hôm nay là ngày 20 tháng 10. Anh không muốn gửi một lời chúc cho có. Anh muốn tự tay viết cho em lá thư này.

Chúc em một ngày thật dịu. Dịu đủ để em được thở, được cười, và được nhận lại những điều tốt đẹp mà em vẫn hay dành cho người khác.

Anh thích cách em hiện diện. Nhẹ nhàng, nhưng một nụ cười, một ánh mắt cũng đủ khiến một ngày bình thường của anh bỗng đáng nhớ.

Nhân ngày của em, anh chúc em bình an. Chúc em mạnh mẽ theo cách riêng của mình, nhưng không phải mạnh mẽ một mình. Em cũng được phép mệt, được phép được che chở.

Anh chúc những điều em âm thầm mong ước sẽ tìm thấy đường đến với em. Chúc em gặp nhiều ngày ấm, và ít phải mang những điều quá nặng.

Anh không có bó hoa trong tay. Anh chỉ có những dòng chữ này, viết rất thật: cảm ơn em đã khiến hôm nay của anh có người để trân trọng.

Nếu em nhận lời chúc này, anh muốn hỏi em một điều nhỏ thôi...

Em có muốn để anh tiếp tục ở đây, quan tâm em, và viết tiếp những lá thư sau không?`,
  signature: `Thương em,
Một người đang rất chân thành.`,
  dateLine: "Đà nẵng · một chiều tháng mười",
  endingPrompt: "Nếu em nhận lời chúc này, hãy cho anh một câu trả lời nhé. ❤️",
  yesLabel: "Em đồng ý ❤️",
  laterLabel: "Cho em thêm thời gian 🌷",
  yesMessage: "Vậy từ hôm nay, anh sẽ tiếp tục viết những điều tốt đẹp dành cho em.",
  messageLabel: "Nhắn cho anh",
  messageLink: "https://m.me/ha.quytaa",
  laterMessage:
    "Không sao cả. Anh tôn trọng cảm xúc của em. Cảm ơn em đã đọc hết lá thư này.",
  replayLabel: "Xem lại từ đầu",
  shareLabel: "Chép liên kết",
  sharedToast: "Đã chép liên kết lá thư",
  audioOnLabel: "Tắt nhạc nền",
  audioOffLabel: "Bật nhạc nền",
};

export function displayHeading() {
  const name = letterContent.recipientName.trim();
  return name ? `Gửi ${name}` : letterContent.heading;
}

export function letterPlainText() {
  return `${letterContent.message}\n\n${letterContent.signature}`;
}
