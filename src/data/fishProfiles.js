import baoPhoto from '../assets/photos/bao.jpg';
import hangPhoto from '../assets/photos/hang.jpg';
import diemPhoto from '../assets/photos/diem.jpg';
import quynhPhoto from '../assets/photos/quynh.jpg';
import quocAnhPhoto from '../assets/photos/quoc-anh.jpg';
import thuPhoto from '../assets/photos/thu.jpg';
import thienPhoto from '../assets/photos/thien.jpg';

import baoCutout from '../assets/cutouts-opt/bao.png';
import hangCutout from '../assets/cutouts-opt/hang.png';
import diemCutout from '../assets/cutouts-opt/diem.png';
import quynhCutout from '../assets/cutouts-opt/quynh.png';
import quocAnhCutout from '../assets/cutouts-opt/quoc-anh.png';
import thuCutout from '../assets/cutouts-opt/thu.png';
import thienCutout from '../assets/cutouts-opt/thien.png';

export const DEFAULT_FISH_PHOTOS = {
  bao: baoPhoto,
  hang: hangPhoto,
  diem: diemPhoto,
  quynh: quynhPhoto,
  'quoc-anh': quocAnhPhoto,
  thu: thuPhoto,
  thien: thienPhoto,
};

export const DEFAULT_FISH_CUTOUTS = {
  bao: { src: baoCutout, width: 481, height: 720 },
  hang: { src: hangCutout, width: 476, height: 720 },
  diem: { src: diemCutout, width: 720, height: 720 },
  quynh: { src: quynhCutout, width: 480, height: 720 },
  'quoc-anh': { src: quocAnhCutout, width: 480, height: 720 },
  thu: { src: thuCutout, width: 481, height: 720 },
  thien: { src: thienCutout, width: 720, height: 720 },
};

const BOOK_COLOR_PRESETS = [
  { cover: '#0B1842', type: '#F4F5FA', spine: '#0192C6' },
  { cover: '#112358', type: '#F1FF62', spine: '#004499' },
  { cover: '#004499', type: '#F4F5FA', spine: '#0192C6' },
  { cover: '#D4EAFF', type: '#112358', spine: '#004499' },
];

function makeDefaultBooks(memberName, items) {
  const labels = ['Món khoái khẩu', 'Quán ruột', 'Kỷ niệm nhóm', 'Sở thích & Gu'];
  const arts = ['sunrise', 'lamp', 'path', 'days'];
  return items.map((item, idx) => ({
    id: `book-${idx + 1}`,
    label: item.label || labels[idx],
    title: item.title,
    coverLines: item.coverLines || [
      item.title.split(' ').slice(0, 2).join(' '),
      item.title.split(' ').slice(2).join(' ') || memberName,
    ],
    topics: item.topics || [],
    art: arts[idx % arts.length],
    colors: BOOK_COLOR_PRESETS[idx % BOOK_COLOR_PRESETS.length],
    chapter: item.chapter || `Trang 0${idx + 1}`,
    chapterTitle: item.chapterTitle,
    text: item.text,
    image: item.image || '',
  }));
}

function makeLetter(name, { eyebrow, greeting, messages, seal = 'FISH' }) {
  return {
    eyebrow,
    heading: eyebrow,
    greeting,
    messages,
    body: messages.join('\n\n'),
    signoff: `— ${name}`,
    stamp: 'Gửi tới\nCả Nhóm',
    postmark: 'Sky Post',
    seal,
    sealing: 'Đang niêm phong',
    counter: 'Lời nhắn',
  };
}

export const DEFAULT_FISH_PROFILES = {
  bao: {
    displayFirst: 'Bảo',
    displayLast: 'The Keeper',
    nickname: 'Bảo',
    craft: 'Planner',
    role: 'Calendar & schedules',
    roles: ['Calendar Keeper', 'Lịch trình', 'Giữ nhịp'],
    headline: ['Chốt ngày đẹp', 'trước khi trôi chat.'],
    bio: 'Gom lịch rảnh của cả 7 cá về một mối, giữ cho những buổi hẹn luôn thành thật.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Cơm tấm, cold brew ít đường',
    contact: 'Inbox nhóm / Google Calendar',
    focus: '50% 24%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@bao.fish', href: '' },
      { id: 'fb', label: 'Facebook', handle: 'Bảo · Fish', href: '' },
    ],
    books: makeDefaultBooks('Bảo', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Cơm tấm', 'Cold brew'],
        chapterTitle: 'Đủ 7 người',
        text: 'Ưu tiên quán ngồi thoải mái nói chuyện lâu được. Buổi sáng nhất định phải có một ly cold brew không đường trước khi mở lịch.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Cuối Tuần'],
        topics: ['Hồ Tây', 'Bàn gỗ dài'],
        chapterTitle: 'Góc cửa sổ',
        text: 'Thích những quán cà phê có bàn gỗ dài đủ cho cả nhóm trải đồ, ánh sáng tự nhiên và không quá ồn.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['Picnic', 'Hoàng hôn'],
        chapterTitle: 'Chiều Hồ Tây',
        text: 'Hôm ở Hồ Tây ai cũng sợ mưa, cuối cùng trời hửng nắng đúng lúc trải thảm. Cả nhóm ngồi cười tới khi đèn đường bật sáng.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Indie Pop', 'Đi bộ chiều'],
        chapterTitle: 'Chậm lại',
        text: 'Mê cảm giác gạch đầu dòng xong hết việc rồi tắt điện thoại đi dạo hồ, nghe nhạc nhẹ và chụp vài tấm phim.',
      },
    ]),
    letter: makeLetter('Bảo', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi 6 con cá,',
      messages: [
        'Cảm ơn mọi người vì lúc nào cũng nhiệt tình vote lịch dù bận rộn. Tháng này mình lại kiếm một buổi chiều không vội bên bờ hồ nhé.',
        'Nhớ cập nhật ngày bận trên Calendar để cuối tuần này cả đội chốt kèo ăn uống thật gọn!',
      ],
      seal: 'BẢO',
    }),
  },
  hang: {
    displayFirst: 'Hằng',
    displayLast: 'Spot Scout',
    nickname: 'Hằng',
    craft: 'Spots',
    role: 'Cafe & picnic scout',
    roles: ['Spot Scout', 'Cà phê mới', 'Góc chill'],
    headline: ['Luôn biết một góc', 'đón gió cực yên.'],
    bio: 'Bản đồ sống về những quán cà phê có nắng đẹp, bãi cỏ picnic ít người và góc ngồi dịu mắt.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Trà trái cây thanh mát, croissant',
    contact: 'Nhắn ở tab Outings / Zalo',
    focus: '50% 22%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@hang.sky', href: '' },
      { id: 'tt', label: 'TikTok', handle: 'Góc chill', href: '' },
    ],
    books: makeDefaultBooks('Hằng', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Trà đào', 'Croissant'],
        chapterTitle: 'Ngọt vừa',
        text: 'Buổi chiều chỉ cần một chiếc croissant giòn rụm và ly trà ổi hồng hoặc matcha latte. Tối se lạnh thì lẩu nấm luôn thắng.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Săn Nắng'],
        topics: ['Sân vườn', 'Nhiều cây'],
        chapterTitle: 'Khoảng sân nhỏ',
        text: 'Luôn lưu sẵn danh sách những quán mới mở có tán cây xanh và ghế mây ngoài hiên để nhóm bí chỗ là có ngay tọa độ đẹp.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['Đà Lạt', 'Hiên gỗ'],
        chapterTitle: 'Nắng gió cao nguyên',
        text: 'Lần cả 7 đứa chen nhau đứng chụp hình trước hiên gỗ, vừa đếm 1-2-3 thì ai cũng bật cười trước khi kịp tạo dáng.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Decor', 'Hoa tươi'],
        chapterTitle: 'Điều nhỏ xinh',
        text: 'Mê ngắm nội thất gỗ, lưu ảnh góc quán đẹp và mua vài nhành hoa nhỏ cắm bàn mỗi dịp tụ họp.',
      },
    ]),
    letter: makeLetter('Hằng', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi hội mê cà phê,',
      messages: [
        'Mỗi tuần mình đều lưu thêm vài quán mới có ánh sáng đẹp để dành cho cả nhóm. Chỉ cần gật đầu một ngày rảnh là mình dẫn đường!',
        'Kèo Market stroll tới ghim thêm một quán trà tầng hai cực chill cho đủ bộ nhé.',
      ],
      seal: 'HẰNG',
    }),
  },
  diem: {
    displayFirst: 'Diễm',
    displayLast: 'Tea Curator',
    nickname: 'Diễm',
    craft: 'Treats',
    role: 'Tea & snacks curator',
    roles: ['Tea Curator', 'Ăn vặt', 'Phố cổ'],
    headline: ['Tìm tiệm trà ấm', 'và những món đêm.'],
    bio: 'Chuyên gia ẩm thực của nhóm: từ quán trà giữa phố cũ tới xe đồ ăn vặt mở khuya.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Trà ô long rang, dimsum, kem bơ',
    contact: 'Tag tên khi thèm trà chiều',
    focus: '50% 24%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@diem.treats', href: '' },
      { id: 'fb', label: 'Facebook', handle: 'Diễm', href: '' },
    ],
    books: makeDefaultBooks('Diễm', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Trà ô long', 'Dimsum'],
        chapterTitle: 'Bụng đói hay vui',
        text: 'Team thích đồ ăn đường phố chính hiệu: xiên nướng, chè nóng mùa đông, trà sữa ô long rang đậm vị trà.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Phố Cũ'],
        topics: ['Phố cổ', 'Tầng hai'],
        chapterTitle: 'Ban công nhỏ',
        text: 'Thích những tiệm trà nằm trên tầng 2 nhà cũ, ấm áp tiếng nói cười và có đĩa bánh quy bơ ăn kèm.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['Chợ đêm', 'Sữa đậu'],
        chapterTitle: 'Bữa khuya bất tận',
        text: 'Trời lạnh run mà cả lũ ngồi quây quanh nồi sữa đậu nóng hổi, chia nhau từng chiếc bánh rán nóng giữa chợ đêm.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Food tour', 'Podcast'],
        chapterTitle: 'Bản đồ ăn ngon',
        text: 'Cuối tuần rảnh là xem list quán mới và rủ nhóm đi ăn thử theo kiểu mỗi quán chỉ gọi một món đặc sản.',
      },
    ]),
    letter: makeLetter('Diễm', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi team hay đói,',
      messages: [
        'Đừng bao giờ sợ đi chơi mà không biết ăn gì nha. Mình đã ghim sẵn cả danh sách tiệm trà và hàng ăn vặt cho kèo sắp tới!',
        'Ai thèm món gì cứ ném vào phần ghi chú để mình gom thành một vòng food tour.',
      ],
      seal: 'DIỄM',
    }),
  },
  quynh: {
    displayFirst: 'Quỳnh',
    displayLast: 'Mood Maker',
    nickname: 'Quỳnh',
    craft: 'Moods',
    role: 'Winter & sunset ideas',
    roles: ['Mood Maker', 'Giờ vàng', 'Plan B'],
    headline: ['Luôn có phương án B', 'cho chiều đổ mưa.'],
    bio: 'Người giữ mood cho cả đội: canh giờ hoàng hôn đẹp nhất và chuẩn bị sẵn kèo lẩu ngày trở gió.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Lẩu nóng dưới 18°C, cacao ấm',
    contact: 'Nhắn lúc hoàng hôn xuống',
    focus: '50% 22%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@quynh.moods', href: '' },
      { id: 'sp', label: 'Spotify', handle: 'Golden Hour', href: '' },
    ],
    books: makeDefaultBooks('Quỳnh', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Lẩu Thái', 'Cacao nóng'],
        chapterTitle: 'Ngày trở gió',
        text: 'Chỉ cần nhiệt độ giảm nhẹ là nghĩ ngay tới nồi lẩu chua cay hoặc lẩu gà lá é ngồi quây quần thật lâu.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Giờ Vàng'],
        topics: ['Rooftop', 'Hoàng hôn'],
        chapterTitle: 'Bầu trời 5 giờ',
        text: 'Chuộng các quán tầng cao hoặc ven hồ thoáng gió, nơi bầu trời tím hồng phản chiếu xuống mặt nước đẹp như tranh.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['Trời mưa', 'Acoustic'],
        chapterTitle: 'Chiều mưa rào',
        text: 'Không đi ngoài trời được nhưng cả nhóm chui vào một góc quán nhỏ, bật playlist chung và nói chuyện tới tận tối muộn.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Playlist', 'Nến thơm'],
        chapterTitle: 'Nhạc cho mỗi chuyến đi',
        text: 'Mỗi chuyến đi đều có một playlist Spotify riêng để sau này nghe lại vẫn nhớ y nguyên bầu không khí hôm đó.',
      },
    ]),
    letter: makeLetter('Quỳnh', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi bầu trời chung,',
      messages: [
        'Dù nắng đẹp hay bất chợt mưa rào, chỉ cần 7 đứa còn ngồi cạnh nhau thì buổi nào cũng thành kỷ niệm đáng nhớ.',
        'Mùa lạnh sắp tới nhớ lên kèo lẩu sớm nhé, mình giữ sẵn playlist cho buổi tối rồi!',
      ],
      seal: 'QUỲNH',
    }),
  },
  'quoc-anh': {
    displayFirst: 'Quốc Anh',
    displayLast: 'The Frame',
    nickname: 'Quốc Anh',
    craft: 'Lens',
    role: 'Trip archive & frames',
    roles: ['Camera & Lens', 'Trip Vault', 'Khung hình'],
    headline: ['Biến khoảnh khắc lạ', 'thành album để dành.'],
    bio: 'Cầm máy đi sau cùng, bắt trọn những nụ cười tự nhiên nhất rồi gom tất cả vào Trip Vault.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Đồ nướng, phở bò, trà đá',
    contact: 'Gửi link ảnh / Trip Vault',
    focus: '50% 22%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@quocanh.lens', href: '' },
      { id: 'fb', label: 'Facebook', handle: 'Quốc Anh', href: '' },
    ],
    books: makeDefaultBooks('Quốc Anh', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Đồ nướng', 'Phở bò'],
        chapterTitle: 'Nạp năng lượng',
        text: 'Sau một buổi chạy bộ chụp hình cho cả đội thì một bữa nướng xèo xèo hoặc bát phở tái lăn nóng hổi là chân ái.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Góc Chụp'],
        topics: ['Nắng xiên', 'Retro'],
        chapterTitle: 'Ánh sáng đẹp',
        text: 'Thích những địa điểm có mảng tường mộc, tán cây thưa và ánh nắng chiều xiên qua cửa sổ tạo bóng đổ đẹp.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['35mm', 'Đêm Đà Lạt'],
        chapterTitle: 'Cuộn phim cũ',
        text: 'Cảm giác hồi hộp đợi rửa ảnh rồi gửi vào nhóm chat xem lại từng biểu cảm khó đỡ của 6 thành viên còn lại.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Nhiếp ảnh', 'Chỉnh màu'],
        chapterTitle: 'Khoảnh khắc thật',
        text: 'Không thích bắt mọi người đứng nghiêm tạo dáng; khoảnh khắc đẹp nhất luôn là lúc mọi người đang mải trêu nhau.',
      },
    ]),
    letter: makeLetter('Quốc Anh', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi 6 người mẫu,',
      messages: [
        'Lần tới đi chơi cứ tự nhiên cười nói, việc bắt lại những khung hình đẹp nhất cứ để mình lo. Nhớ up ảnh vào Trip Vault nha!',
        'Cuộn phim sau mình muốn chụp thêm thật nhiều ảnh nhóm dưới nắng chiều.',
      ],
      seal: 'Q.A',
    }),
  },
  thu: {
    displayFirst: 'Thư',
    displayLast: 'Dawn Chaser',
    nickname: 'Thư',
    craft: 'Dawn',
    role: 'Early-morning pace',
    roles: ['Dawn Chaser', '4:45 Sáng', 'Bình minh'],
    headline: ['Báo thức 4:45 sáng', 'để săn thung lũng mây.'],
    bio: 'Người đủ nghị lực dựng cả nhóm dậy trước bình minh—tới nơi rồi ai cũng cảm ơn rối rít.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Sữa đậu nóng, bánh mì chảo, matcha',
    contact: 'Nhắn trước 9h tối kẻo ngủ sớm',
    focus: '50% 22%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@thu.dawn', href: '' },
      { id: 'tt', label: 'TikTok', handle: '@thu.sunrise', href: '' },
    ],
    books: makeDefaultBooks('Thư', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Bánh mì chảo', 'Sữa đậu'],
        chapterTitle: 'Bữa sáng sớm',
        text: 'Thức dậy đón bình minh xong ghé hàng ăn sáng nóng hổi, uống ly sữa đậu nành ấm tay giữa tiết trời se lạnh.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Buổi Sớm'],
        topics: ['Mở cửa 6h', 'Thoáng gió'],
        chapterTitle: 'Phố còn ngái ngủ',
        text: 'Yêu thích những quán cà phê mở từ 6 giờ sáng, đường phố còn thưa xe và không khí trong veo.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['4:45 AM', 'Biển mây'],
        chapterTitle: 'Đồi Thiên Phúc Đức',
        text: 'Cú báo thức 4:45 sáng huyền thoại ở Đà Lạt—cả nhóm run cầm cập leo đồi rồi vỡ òa khi thấy cả thung lũng dưới màn sương.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Chạy bộ', 'Journaling'],
        chapterTitle: 'Buổi sáng chậm',
        text: 'Thích dậy sớm chạy bộ quanh hồ, viết vài dòng nhật ký và tận hưởng khoảng thời gian tĩnh lặng trước khi phố đông lên.',
      },
    ]),
    letter: makeLetter('Thư', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi hội ngủ nướng,',
      messages: [
        'Chuyến đi xa tiếp theo cho phép mình đặt báo thức sớm một bữa nữa thôi nha, hứa sẽ tìm chỗ ngắm bình minh xịn hơn cả lần trước!',
        'Sáng sớm trời lạnh nhớ mang thêm áo khoác mỏng và một bình giữ nhiệt nhé.',
      ],
      seal: 'THƯ',
    }),
  },
  thien: {
    displayFirst: 'Thiên',
    displayLast: 'Route Pilot',
    nickname: 'Thiên',
    craft: 'Routes',
    role: 'Maps & getting there',
    roles: ['Route Pilot', 'Bản đồ', 'Lộ trình'],
    headline: ['Giữ chuẩn từng ghim', 'và khúc cua ghé ngang.'],
    bio: 'Hoa tiêu của nhóm: thuộc từng đường tránh tắc, chỗ gửi xe dễ tìm và điểm dừng bất ngờ.',
    birthday: 'Chưa cập nhật',
    foodNotes: 'Bún bò Huế, hải sản, nước mía',
    contact: 'Ping khi cần tìm đường / chốt xe',
    focus: '50% 24%',
    socials: [
      { id: 'ig', label: 'Instagram', handle: '@thien.routes', href: '' },
      { id: 'fb', label: 'Facebook', handle: 'Thiên', href: '' },
    ],
    books: makeDefaultBooks('Thiên', [
      {
        title: 'Món khoái khẩu',
        coverLines: ['Món', 'Khoái Khẩu'],
        topics: ['Bún bò', 'Nước mía'],
        chapterTitle: 'Chạy đường xa',
        text: 'Ăn chắc bụng, đậm vị và nhanh gọn để còn chạy tiếp sang điểm tham quan kế tiếp.',
      },
      {
        title: 'Quán ruột',
        coverLines: ['Quán Ruột', 'Ven Đường'],
        topics: ['Đỗ xe dễ', 'View đèo'],
        chapterTitle: 'Trạm dừng chân',
        text: 'Luôn để ý những quán có chỗ đậu xe thoải mái cho cả đoàn và góc nhìn rộng mở để cả lũ nghỉ chân uống nước.',
      },
      {
        title: 'Kỷ niệm nhóm',
        coverLines: ['Kỷ Niệm', 'Của Nhóm'],
        topics: ['Đường đèo', '7 xe nối đuôi'],
        chapterTitle: 'Cú rẽ bất ngờ',
        text: 'Có lần định né đoạn kẹt xe mà vô tình dẫn cả đội vào con đường thông xanh mướt không bóng người.',
      },
      {
        title: 'Sở thích & Gu',
        coverLines: ['Sở Thích', '& Nhịp Riêng'],
        topics: ['Google Maps', 'Roadtrip'],
        chapterTitle: 'Ghim sẵn tọa độ',
        text: 'Thích cảm giác lên lộ trình mượt mà để mọi người đi cùng chỉ việc tận hưởng phong cảnh mà không lo lạc đường.',
      },
    ]),
    letter: makeLetter('Thiên', {
      eyebrow: 'Lời nhắn gửi nhóm',
      greeting: 'Gửi đoàn xe 7 cá,',
      messages: [
        'Mọi người chỉ việc chuẩn bị đồ đẹp và tinh thần vui vẻ, còn đường đi, chỗ đỗ xe và trạm dừng ngắm cảnh để mình lo hết cho.',
        'Có điểm nào mới muốn ghé cứ thả ghim lên Trip Vault là mình nối tuyến luôn!',
      ],
      seal: 'THIÊN',
    }),
  },
};

function sanitizeBooks(savedBooks, fallbackBooks) {
  if (!Array.isArray(savedBooks) || savedBooks.length === 0) return fallbackBooks;
  return fallbackBooks.map((fb, idx) => {
    const incoming = savedBooks[idx];
    if (!incoming || typeof incoming !== 'object') return fb;
    return {
      ...fb,
      label: typeof incoming.label === 'string' && incoming.label.trim() ? incoming.label : fb.label,
      title: typeof incoming.title === 'string' && incoming.title.trim() ? incoming.title : fb.title,
      coverLines:
        Array.isArray(incoming.coverLines) && incoming.coverLines.length >= 2
          ? [String(incoming.coverLines[0] || ''), String(incoming.coverLines[1] || '')]
          : fb.coverLines,
      topics: Array.isArray(incoming.topics)
        ? incoming.topics.map((t) => String(t).trim()).filter(Boolean)
        : fb.topics,
      art: ['sunrise', 'lamp', 'path', 'days'].includes(incoming.art) ? incoming.art : fb.art,
      chapter: typeof incoming.chapter === 'string' ? incoming.chapter : fb.chapter,
      chapterTitle: typeof incoming.chapterTitle === 'string' ? incoming.chapterTitle : fb.chapterTitle,
      text: typeof incoming.text === 'string' ? incoming.text : fb.text,
      image: typeof incoming.image === 'string' ? incoming.image : (fb.image || ''),
    };
  });
}

function normalizeLetter(savedLetter, fallbackLetter, memberName) {
  const merged = {
    ...fallbackLetter,
    ...(savedLetter && typeof savedLetter === 'object' ? savedLetter : {}),
  };

  let messages = Array.isArray(merged.messages)
    ? merged.messages.map((m) => String(m).trim()).filter(Boolean)
    : [];

  if (typeof savedLetter?.body === 'string' && savedLetter.body.trim()) {
    messages = savedLetter.body
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
  }

  if (messages.length === 0) {
    messages = fallbackLetter.messages || ['Chưa có lời nhắn gửi nhóm.'];
  }

  return {
    eyebrow: merged.eyebrow || merged.heading || 'Lời nhắn gửi nhóm',
    heading: merged.eyebrow || merged.heading || 'Lời nhắn gửi nhóm',
    greeting: merged.greeting || `Gửi cả nhóm,`,
    messages,
    body: typeof merged.body === 'string' && merged.body.trim() ? merged.body : messages.join('\n\n'),
    signoff: merged.signoff || `— ${memberName}`,
    stamp: merged.stamp || 'Gửi tới\nCả Nhóm',
    postmark: merged.postmark || 'Sky Post',
    seal: (merged.seal || memberName.slice(0, 4).toUpperCase()).slice(0, 5),
    sealing: merged.sealing || 'Đang niêm phong',
    counter: merged.counter || 'Lời nhắn',
  };
}

export function buildMemberProfiles(basePeople, savedMap = {}) {
  const safeMap = savedMap && typeof savedMap === 'object' ? savedMap : {};

  return basePeople.map((person) => {
    const cutout = DEFAULT_FISH_CUTOUTS[person.id] || { src: '', width: 1024, height: 1536 };
    const defaults = DEFAULT_FISH_PROFILES[person.id] || {
      displayFirst: person.name,
      displayLast: 'Fish',
      nickname: person.name,
      craft: 'Fish',
      role: 'Fish Upon The Sky',
      roles: ['Fish Upon The Sky'],
      headline: ['One of seven,', 'sharing one sky.'],
      bio: '',
      birthday: 'Chưa cập nhật',
      foodNotes: '',
      contact: '',
      focus: '50% 24%',
      socials: [],
      books: makeDefaultBooks(person.name, [
        { title: 'Món khoái khẩu', chapterTitle: 'Món yêu thích', text: '' },
        { title: 'Quán ruột', chapterTitle: 'Quán quen', text: '' },
        { title: 'Kỷ niệm nhóm', chapterTitle: 'Kỷ niệm', text: '' },
        { title: 'Sở thích & Gu', chapterTitle: 'Sở thích', text: '' },
      ]),
      letter: makeLetter(person.name, {
        eyebrow: 'Lời nhắn gửi nhóm',
        greeting: 'Gửi cả nhóm,',
        messages: ['Hẹn mọi người vào buổi tụ họp sắp tới nhé!'],
      }),
    };

    const saved = safeMap[person.id] && typeof safeMap[person.id] === 'object' ? safeMap[person.id] : {};

    return {
      ...defaults,
      ...person,
      ...saved,
      id: person.id,
      name: person.name,
      color: person.color,
      defaultPhoto: DEFAULT_FISH_PHOTOS[person.id] || '',
      cutoutPhoto: cutout.src,
      cutoutWidth: cutout.width,
      cutoutHeight: cutout.height,
      customPhoto: typeof saved.customPhoto === 'string' ? saved.customPhoto : '',
      roles: Array.isArray(saved.roles) && saved.roles.length > 0 ? saved.roles.map(String) : defaults.roles,
      headline:
        Array.isArray(saved.headline) && saved.headline.length >= 2
          ? [String(saved.headline[0] || ''), String(saved.headline[1] || '')]
          : defaults.headline,
      socials: Array.isArray(saved.socials)
        ? saved.socials.map((s, idx) => ({
            id: s?.id || `social-${idx}`,
            label: String(s?.label || ''),
            handle: String(s?.handle || ''),
            href: String(s?.href || ''),
          }))
        : defaults.socials,
      books: sanitizeBooks(saved.books, defaults.books),
      letter: normalizeLetter(saved.letter, defaults.letter, person.name),
    };
  });
}

export function serializeMemberProfile(member) {
  return {
    displayFirst: member.displayFirst,
    displayLast: member.displayLast,
    nickname: member.nickname,
    craft: member.craft,
    role: member.role,
    roles: member.roles,
    headline: member.headline,
    bio: member.bio,
    birthday: member.birthday,
    foodNotes: member.foodNotes,
    contact: member.contact,
    focus: member.focus,
    customPhoto: member.customPhoto || '',
    socials: member.socials,
    books: member.books,
    letter: member.letter,
  };
}

export function compressPortraitFile(file, maxWidth = 720, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || '').startsWith('image/')) {
      reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp ảnh từ máy.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Ảnh tải lên không hợp lệ hoặc bị hỏng.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(1, img.width));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh.'));
          return;
        }
        const isPng = String(file.type || '').includes('png');
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export function normalizeExternalUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^javascript:/i.test(trimmed)) return '';
  return `https://${trimmed}`;
}
