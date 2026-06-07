import type { ScriptStyle } from '../types/script'

export const demoNovel = {
  title: '迷雾城',
  style: 'film' as ScriptStyle,
  sourceText:
    '第一章，林舟在雨夜醒来，发现自己身处一座陌生的旧城区。街道两侧的霓虹灯忽明忽暗，所有钟表都停在凌晨三点。林舟想不起自己为何来到这里，只记得口袋里有一张写着“不要相信时间”的纸条。\n\n第二章，林舟在废弃车站遇到一名神秘女子。女子告诉他，这座城市每天都会重置一次，而能保留记忆的人只有极少数。她怀疑林舟就是打破循环的关键。\n\n第三章，林舟决定跟随女子进入城市中心的钟楼。钟楼里传来熟悉的声音，似乎有人正在等待他做出选择。随着钟声响起，林舟终于意识到，这场循环并不是惩罚，而是一场被隐藏起来的测试。'
}

export const demoYamlPreview = `title: "迷雾城"
version: "1.0"
source:
  type: "novel"
  chapter_count: 3
characters:
  - id: "c001"
    name: "林舟"
    role: protagonist
scenes:
  - id: "s001"
    chapter: 1
    title: "雨夜醒来"
    location: "旧城区街道"
    time: "night"
    summary: "林舟在雨夜醒来，发现自己身处陌生城市。"
    dialogues:
      - speaker: "林舟"
        text: "这里到底发生了什么？"
        emotion: "confused"
    actions:
      - "林舟检查口袋中的纸条。"`
