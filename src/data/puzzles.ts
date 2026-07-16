/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PuzzleLevel, AchievementBadge } from "../types";

export const PRESET_LEVELS: PuzzleLevel[] = [
  {
    id: 1,
    theme: "Trường Học",
    englishTheme: "School & Study",
    difficulty: "Dễ",
    description: "Khám phá các từ vựng thân thuộc quanh lớp học và trường học của bạn.",
    keyWord: "TEACH",
    rows: [
      {
        id: 0,
        clue: "Cái bàn dùng để học tập, viết lách hoặc làm việc trong lớp.",
        word: "TABLE",
        keyCharIndex: 0 // 'T' in TABLE
      },
      {
        id: 1,
        clue: "Dụng cụ viết hoặc vẽ bằng than chì, dễ dàng tẩy xóa bằng gôm.",
        word: "PENCIL",
        keyCharIndex: 1 // 'E' in PENCIL
      },
      {
        id: 2,
        clue: "Tấm bảng đen hoặc trắng lớn ở đầu lớp dùng để thầy cô viết bài giảng.",
        word: "BOARD",
        keyCharIndex: 2 // 'A' in BOARD
      },
      {
        id: 3,
        clue: "Đồ vật có bốn chân dùng để ngồi học, thường đi kèm với cái bàn.",
        word: "CHAIR",
        keyCharIndex: 0 // 'C' in CHAIR
      },
      {
        id: 4,
        clue: "Nhiệm vụ học tập hoặc bài tập mà giáo viên giao cho bạn làm ở nhà.",
        word: "HOMEWORK",
        keyCharIndex: 0 // 'H' in HOMEWORK
      }
    ]
  },
  {
    id: 2,
    theme: "Thế giới Động Vật",
    englishTheme: "Animal Kingdom",
    difficulty: "Dễ",
    description: "Kiểm tra vốn từ vựng về các loài thú cưng và động vật hoang dã quanh ta.",
    keyWord: "TIGER",
    rows: [
      {
        id: 0,
        clue: "Loài bò sát di chuyển chậm chạp, nổi tiếng với chiếc mai cứng và sự kiên trì.",
        word: "TURTLE",
        keyCharIndex: 0 // 'T' in TURTLE
      },
      {
        id: 1,
        clue: "Được mệnh danh là 'Chúa tể muông thú' với chiếc bờm oai vệ xung quanh cổ.",
        word: "LION",
        keyCharIndex: 1 // 'I' in LION
      },
      {
        id: 2,
        clue: "Loài động vật bốn chân trung thành, thường được nuôi để giữ nhà hoặc làm thú cưng.",
        word: "DOG",
        keyCharIndex: 2 // 'G' in DOG
      },
      {
        id: 3,
        clue: "Loài vật hiền lành nhút nhát sống trong rừng, con đực thường có cặp sừng phân nhánh rất đẹp.",
        word: "DEER",
        keyCharIndex: 1 // 'E' in DEER
      },
      {
        id: 4,
        clue: "Loài thú nhỏ có đôi tai dài, thích ăn cà rốt và có tài chạy nhảy cực nhanh.",
        word: "RABBIT",
        keyCharIndex: 0 // 'R' in RABBIT
      }
    ]
  },
  {
    id: 3,
    theme: "Ẩm Thực & Ăn Uống",
    englishTheme: "Food & Drinks",
    difficulty: "Trung bình",
    description: "Những từ vựng thơm ngon về đồ ăn thức uống hằng ngày của chúng ta.",
    keyWord: "SWEET",
    rows: [
      {
        id: 0,
        clue: "Món ăn dạng lỏng được nấu từ thịt, rau củ, thường dùng nóng làm món khai vị.",
        word: "SOUP",
        keyCharIndex: 0 // 'S' in SOUP
      },
      {
        id: 1,
        clue: "Chất lỏng trong suốt, không màu, không mùi, cực kỳ quan trọng đối với cơ thể sống.",
        word: "WATER",
        keyCharIndex: 0 // 'W' in WATER
      },
      {
        id: 2,
        clue: "Món ăn sáng quốc dân làm từ bột mì nướng chín, có lớp vỏ vàng giòn.",
        word: "BREAD",
        keyCharIndex: 2 // 'E' in BREAD
      },
      {
        id: 3,
        clue: "Thức uống thảo mộc được pha chế bằng cách hãm lá cây khô trong nước sôi.",
        word: "TEA",
        keyCharIndex: 2 // 'A' in TEA
      },
      {
        id: 4,
        clue: "Một loại quả tròn mọng màu đỏ, thường được làm salad, nấu canh hoặc làm nước sốt.",
        word: "TOMATO",
        keyCharIndex: 5 // 'T' in TOMATO (T-O-M-A-T-O -> O is 5. Wait: T[0] O[1] M[2] A[3] T[4] O[5]. Ah! letter is 'T' at index 4 or 'O' at index 5. KeyWord letter is 'T'. Let's use index 4!)
      }
    ]
  },
  {
    id: 4,
    theme: "Thể Thao & Sức Khỏe",
    englishTheme: "Sports & Health",
    difficulty: "Trung bình",
    description: "Nâng cao tinh thần thể thao với các từ vựng vận động đầy năng lượng.",
    keyWord: "MATCH",
    rows: [
      {
        id: 0,
        clue: "Hoạt động di chuyển cơ thể dưới nước bằng cách quạt tay và đạp chân.",
        word: "SWIM",
        keyCharIndex: 3 // 'M' in SWIM (S-W-I-M -> index 3)
      },
      {
        id: 1,
        clue: "Quả cầu tròn hoặc bóng da dập nổi, không thể thiếu trong bóng đá, bóng rổ.",
        word: "BALL",
        keyCharIndex: 1 // 'A' in BALL (B-A-L-L -> index 1)
      },
      {
        id: 2,
        clue: "Môn thể thao dùng vợt đánh bóng qua lưới trên sân chữ nhật, có nguồn gốc từ châu Âu.",
        word: "TENNIS",
        keyCharIndex: 0 // 'T' in TENNIS (T-E-N-N-I-S -> index 0)
      },
      {
        id: 3,
        clue: "Người hướng dẫn, chỉ đạo kỹ thuật và chiến thuật cho các cầu thủ hoặc vận động viên.",
        word: "COACH",
        keyCharIndex: 3 // 'C' in COACH (C-O-A-C-H -> index 3)
      },
      {
        id: 4,
        clue: "Trò chơi trí tuệ đấu trí trên bàn cờ gỗ có 64 ô vuông đen trắng đan xen.",
        word: "CHESS",
        keyCharIndex: 1 // 'H' in CHESS (C-H-E-S-S -> index 1)
      }
    ]
  },
  {
    id: 5,
    theme: "Trái Đất & Vũ Trụ",
    englishTheme: "Earth & Space",
    difficulty: "Khó",
    description: "Khám phá hành tinh xanh tuyệt đẹp và không gian bao la bên ngoài Trái Đất.",
    keyWord: "GREEN",
    rows: [
      {
        id: 0,
        clue: "Mô hình quả cầu mô phỏng bản đồ thu nhỏ của Trái Đất.",
        word: "GLOBE",
        keyCharIndex: 0 // 'G' in GLOBE
      },
      {
        id: 1,
        clue: "Hiện tượng thời tiết khi nước ngưng tụ trong khí quyển rơi xuống đất thành từng giọt.",
        word: "RAIN",
        keyCharIndex: 0 // 'R' in RAIN
      },
      {
        id: 2,
        clue: "Vùng đất rộng lớn có mật độ cây cối dày đặc, ngôi nhà của phần lớn động vật hoang dã.",
        word: "FOREST",
        keyCharIndex: 3 // 'E' in FOREST (F-O-R-E-S-T -> index 3)
      },
      {
        id: 3,
        clue: "Hành tinh xanh thân yêu của chúng ta, hành tinh thứ ba tính từ Mặt Trời.",
        word: "EARTH",
        keyCharIndex: 0 // 'E' in EARTH
      },
      {
        id: 4,
        clue: "Ngôi sao khổng lồ phát sáng ở trung tâm Thái Dương Hệ, sưởi ấm toàn bộ Trái Đất.",
        word: "SUN",
        keyCharIndex: 2 // 'N' in SUN (S-U-N -> index 2)
      }
    ]
  }
];

// Correct index 4 of level 3
PRESET_LEVELS[2].rows[4].keyCharIndex = 4; // 'T' at TOMATO index 4 (T-O-M-A-T-O -> index 4 is the second T)

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: "first_win",
    name: "Khởi Đầu May Mắn",
    description: "Giải mã thành công ô chữ đầu tiên.",
    icon: "🌟",
    criteria: "Hoàn thành 1 cấp độ bất kỳ."
  },
  {
    id: "score_500",
    name: "Nhà Thông Thái",
    description: "Tích lũy được từ 500 điểm trở lên.",
    icon: "🧙‍♂️",
    criteria: "Tổng điểm đạt 500."
  },
  {
    id: "no_hints",
    name: "Trí Tuệ Tuyệt Đối",
    description: "Giải mã hoàn hảo một ô chữ mà không dùng bất kỳ gợi ý nào.",
    icon: "🧠",
    criteria: "Giải đúng cả màn chơi không bấm xem chữ cái gợi ý."
  },
  {
    id: "all_completed",
    name: "Nhà Vô Địch Từ Vựng",
    description: "Vượt qua toàn bộ 5 cấp độ ô chữ mặc định của trò chơi.",
    icon: "🏆",
    criteria: "Hoàn thành tất cả 5 cấp độ mặc định."
  },
  {
    id: "creator",
    name: "Kiến Tạo Giáo Án",
    description: "Tạo thành công một bộ ô chữ tùy chỉnh của riêng bạn.",
    icon: "🛠️",
    criteria: "Tạo thành công 1 màn chơi tùy chỉnh."
  }
];
