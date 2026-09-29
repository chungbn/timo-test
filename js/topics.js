(function (T) {
  'use strict';

  T.TOPICS = [
    {
      id: 'logic', name: 'Tư duy logic', icon: '🧩', color: '#8b5cf6',
      desc: 'Quy luật dãy số, dãy hình, xếp hàng, so sánh, tuổi, cưa gỗ',
      points: [
        'Dãy số có quy luật: tìm xem số sau hơn (hoặc kém) số trước bao nhiêu. Có dãy cộng xen kẽ hai số, có dãy khoảng cách tăng dần 1, 2, 3, ...',
        'Dãy hình lặp lại: khoanh nhóm hình lặp lại, rồi đếm theo từng nhóm.',
        'Xếp hàng: Số bạn trong hàng = thứ tự tính từ trái + thứ tự tính từ phải − 1.',
        'Cưa gỗ: cưa thành n đoạn cần n − 1 lần cưa. Trồng cây cả hai đầu: số cây = số khoảng + 1.',
        'Tuổi: hai người luôn hơn kém nhau một số tuổi không đổi. Mỗi năm, ai cũng thêm 1 tuổi.',
        'So sánh: sắp xếp mọi người theo thứ tự trên một hàng rồi mới trả lời.',
      ],
      tips: [
        'Đọc đề hai lần, gạch chân các từ quan trọng: "nhiều hơn", "ít hơn", "thứ mấy", "từ trái sang".',
        'Vẽ hình ra giấy nháp: mỗi bạn là một chấm tròn, mỗi khúc gỗ là một đoạn thẳng.',
      ],
      examples: [
        { q: 'Tìm số tiếp theo: 2, 5, 8, 11, ?', a: 'Mỗi số hơn số trước 3 đơn vị. Số tiếp theo là 11 + 3 = <b>14</b>.' },
        { q: 'Lan đứng thứ 3 tính từ trái và thứ 5 tính từ phải. Hàng có bao nhiêu bạn?', a: 'Bên trái Lan có 2 bạn, bên phải Lan có 4 bạn. Cả hàng: 2 + 1 + 4 = <b>7</b> bạn (hoặc 3 + 5 − 1 = 7).' },
        { q: 'Cưa một khúc gỗ thành 5 đoạn thì cần mấy lần cưa?', a: 'Chỗ cưa nằm giữa hai đoạn liền nhau. 5 đoạn có 4 chỗ nối nên cần <b>4</b> lần cưa.' },
        { q: '🔴🔵🟡🔴🔵🟡... Hình thứ 10 là hình gì?', a: 'Nhóm 3 hình lặp lại. Hình thứ 3, 6, 9 là 🟡. Hình thứ 10 là hình đầu nhóm mới: <b>🔴</b>.' },
      ],
    },
    {
      id: 'arith', name: 'Số học', icon: '➕', color: '#f97316',
      desc: 'Cộng trừ, tính nhanh, tìm số chưa biết, toán có lời văn',
      points: [
        'Cộng, trừ trong phạm vi 100. Kiểm tra lại phép trừ bằng phép cộng.',
        'Tính nhanh: ghép các số thành 10 hoặc số tròn chục: 3 + 7, 6 + 4, 25 + 15...',
        'Tìm số chưa biết: □ + a = b thì □ = b − a; □ − a = b thì □ = b + a; a − □ = b thì □ = a − b.',
        'Bài toán "nhiều hơn" dùng phép cộng, "ít hơn" dùng phép trừ.',
        'Thay hình bằng số: tìm hình dễ nhất trước (hình xuất hiện nhiều lần giống nhau).',
      ],
      tips: [
        'Cộng thêm rồi bớt đi cùng một số thì như không đổi: 15 + 4 − 4 = 15.',
        'Cộng số gần tròn chục: 19 + 26 = 20 + 26 − 1 = 45.',
      ],
      examples: [
        { q: '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 = ?', a: '(1 + 9) + (2 + 8) + (3 + 7) + (4 + 6) + 5 = 10 + 10 + 10 + 10 + 5 = <b>45</b>.' },
        { q: '□ − 7 = 8. Tìm □.', a: 'Số bị trừ = hiệu + số trừ: □ = 8 + 7 = <b>15</b>.' },
        { q: 'An có 8 viên bi, Bình nhiều hơn An 3 viên. Cả hai bạn có bao nhiêu viên bi?', a: 'Bình có 8 + 3 = 11 viên. Cả hai có 8 + 11 = <b>19</b> viên.' },
      ],
    },
    {
      id: 'number', name: 'Lý thuyết số', icon: '🔢', color: '#0ea5e9',
      desc: 'Chục – đơn vị, chẵn lẻ, đếm số, chữ số, số liền trước – liền sau',
      points: [
        'Số có hai chữ số gồm chục và đơn vị: 47 gồm 4 chục và 7 đơn vị. 10 đơn vị = 1 chục.',
        'Số chẵn có chữ số tận cùng là 0, 2, 4, 6, 8. Số lẻ tận cùng là 1, 3, 5, 7, 9.',
        'Từ a đến b có (b − a + 1) số. Lớn hơn a và bé hơn b có (b − a − 1) số.',
        'Có 10 số có một chữ số (0 đến 9) và 90 số có hai chữ số (10 đến 99).',
        'Số liền sau thì thêm 1, số liền trước thì bớt 1.',
      ],
      tips: [
        'Khi đếm chữ số, tách thành nhóm số có 1 chữ số và nhóm số có 2 chữ số.',
        'Liệt kê theo thứ tự (hàng chục từ bé đến lớn) để không bỏ sót.',
      ],
      examples: [
        { q: 'Từ 1 đến 20 có bao nhiêu số chẵn?', a: '2, 4, 6, 8, 10, 12, 14, 16, 18, 20: có <b>10</b> số chẵn.' },
        { q: 'Viết các số từ 1 đến 15 cần bao nhiêu chữ số?', a: 'Từ 1 đến 9: 9 chữ số. Từ 10 đến 15: 6 số, mỗi số 2 chữ số: 12 chữ số. Tổng: 9 + 12 = <b>21</b>.' },
        { q: 'Có bao nhiêu số có hai chữ số mà tổng hai chữ số bằng 3?', a: 'Đó là 12, 21, 30. Có <b>3</b> số.' },
      ],
    },
    {
      id: 'geo', name: 'Hình học', icon: '📐', color: '#10b981',
      desc: 'Đếm đoạn thẳng, tam giác, hình vuông, hình chữ nhật, xem đồng hồ',
      points: [
        'Hình tam giác có 3 cạnh, 3 góc. Hình vuông và hình chữ nhật có 4 cạnh, 4 góc. Hình tròn không có cạnh.',
        'n điểm trên một đường thẳng tạo ra (n − 1) + (n − 2) + ... + 1 đoạn thẳng.',
        'Đếm hình: đếm hình đơn (nhỏ nhất) trước, rồi hình ghép 2, ghép 3, ...',
        'Lưới hình vuông: đếm hình vuông nhỏ, rồi hình vuông 2×2, 3×3, ...',
        'Đồng hồ: kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 6 là 30 phút.',
      ],
      tips: [
        'Đánh dấu hoặc đặt tên từng hình nhỏ (1, 2, 3...) rồi ghép lại để đếm không sót.',
        'Hình vuông cũng là một hình chữ nhật đặc biệt.',
      ],
      examples: [
        { q: '4 điểm A, B, C, D nằm trên một đường thẳng. Có bao nhiêu đoạn thẳng?', a: 'AB, AC, AD, BC, BD, CD. Có 3 + 2 + 1 = <b>6</b> đoạn thẳng.' },
        { q: 'Một hình vuông chia thành lưới 2×2 ô vuông nhỏ. Có bao nhiêu hình vuông?', a: '4 hình vuông nhỏ + 1 hình vuông lớn = <b>5</b> hình vuông.' },
        { q: 'Từ đỉnh một tam giác kẻ thêm 1 đoạn xuống cạnh đáy. Có bao nhiêu tam giác?', a: '2 tam giác nhỏ + 1 tam giác lớn = <b>3</b> tam giác.' },
      ],
    },
    {
      id: 'comb', name: 'Tổ hợp', icon: '🎲', color: '#ec4899',
      desc: 'Liệt kê, bắt tay, chọn quần áo, lập số, nguyên lý trường hợp xấu nhất',
      points: [
        'Liệt kê theo thứ tự để không bỏ sót và không trùng lặp.',
        'Quy tắc nhân: 2 áo và 3 quần thì có 3 + 3 = 6 bộ quần áo.',
        'Bắt tay: mỗi cặp bắt tay một lần. 4 bạn: 3 + 2 + 1 = 6 cái bắt tay.',
        'Lập số: chữ số 0 không được đứng đầu.',
        'Trường hợp xấu nhất: muốn "chắc chắn" thì phải nghĩ tới lúc không may mắn nhất.',
      ],
      tips: [
        'Vẽ sơ đồ cây: mỗi nhánh là một cách chọn.',
        'Với bài "chắc chắn", hãy hỏi: "Nếu mình rất xui thì sẽ lấy phải những gì?"',
      ],
      examples: [
        { q: 'Có 2 cái áo và 3 cái quần. Có bao nhiêu cách chọn một bộ quần áo?', a: 'Mỗi áo đi với 3 quần: 3 + 3 = <b>6</b> cách.' },
        { q: '4 bạn gặp nhau, mỗi 2 bạn bắt tay 1 lần. Có bao nhiêu cái bắt tay?', a: 'Bạn thứ nhất bắt tay 3 bạn, bạn thứ hai bắt tay thêm 2, bạn thứ ba thêm 1: 3 + 2 + 1 = <b>6</b>.' },
        { q: 'Hộp có 3 bi đỏ, 4 bi xanh. Nhắm mắt lấy ít nhất bao nhiêu viên để chắc chắn có 1 bi đỏ?', a: 'Xui nhất là lấy hết 4 bi xanh trước. Lấy thêm 1 viên nữa chắc chắn là đỏ: 4 + 1 = <b>5</b> viên.' },
      ],
    },
  ];

  T.topicById = id => T.TOPICS.find(t => t.id === id);

  T.LEVELS = [
    { lv: 1, name: 'Cấp 1 · Khởi động', desc: 'Làm quen dạng bài' },
    { lv: 2, name: 'Cấp 2 · Tăng tốc', desc: 'Mức độ đề thi' },
    { lv: 3, name: 'Cấp 3 · Thử thách', desc: 'Câu khó, lấy huy chương' },
  ];

  T.EXAM_MODES = {
    full: { name: 'Thi thử TIMO', short: 'Chuẩn', per: 5, levels: [1, 1, 2, 2, 3], minutes: 90, desc: '25 câu · 90 phút · giống đề thi thật' },
    hard: { name: 'Thi thử nâng cao', short: 'Nâng cao', per: 5, levels: [2, 2, 3, 3, 3], minutes: 90, desc: '25 câu · 90 phút · luyện lấy huy chương vàng' },
    mini: { name: 'Thi nhanh', short: 'Nhanh', per: 2, levels: [1, 2], minutes: 20, desc: '10 câu · 20 phút · ôn nhanh mỗi ngày' },
  };
  T.EXAM_COUNT = 30;

  T.medal = function (score) {
    if (score >= 85) return { icon: '🥇', name: 'Huy chương Vàng', cls: 'gold' };
    if (score >= 70) return { icon: '🥈', name: 'Huy chương Bạc', cls: 'silver' };
    if (score >= 50) return { icon: '🥉', name: 'Huy chương Đồng', cls: 'bronze' };
    if (score >= 30) return { icon: '🎖️', name: 'Giải Khuyến khích', cls: 'merit' };
    return { icon: '💪', name: 'Cố gắng thêm nhé!', cls: 'none' };
  };
})(window.T);
