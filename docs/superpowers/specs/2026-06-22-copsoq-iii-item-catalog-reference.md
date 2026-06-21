# COPSOQ III — Verified Item Catalog (implementation reference)

> Companion to `2026-06-22-copsoq-iii-scale-design.md`. **English** = official COPSOQ International Network guidelines (Annex 1). **简体中文 + response anchors** = peer-reviewed China validation supplement (*Healthcare* 2025, 13(7):825, File S1). **繁體中文 (繁中)** is authored at implementation per spec §3 (Taiwan register from official English; burnout family uses Taiwan 職場疲勞量表 wording) — every 繁中 cell below is flagged `⚠ 需官方 zh-TW` because no official Taiwan COPSOQ III exists.
>
> Scope for this app (spec §4): EXCLUDE Work Engagement (WE), Offensive Behaviours (Domain F), Self-Efficacy (SE/Personality). Keep everything else.
>
> Legend: **Lvl** = CORE/MIDDLE/LONG version tag · **RO** = response-option code (see anchor table) · **Rev?** = reverse-scored · `*` after item code = dropped from China-final scale after psychometric eval (still a valid international item).

---

## Response anchor sets (value 0..4 in app; 0–100 in COPSOQ)

| Code | Anchors (EN) | App option order (value 4→0) | 0–100 |
|---|---|---|---|
| **1** frequency | Always / Often / Sometimes / Seldom / Never-hardly | 總是 / 經常 / 有時 / 很少 / 從不幾乎沒有 | 100/75/50/25/0 |
| **1R** | (reversed) | — | 0/25/50/75/100 |
| **2** extent | very large / large / Somewhat / small / very small extent | 程度非常大 / 程度很大 / 有些 / 程度很小 / 程度非常小 | 100/75/50/25/0 |
| **2R** | (reversed) | — | 0/25/50/75/100 |
| **6** satisfaction | Very satisfied / Satisfied / Neither / Unsatisfied / Very unsatisfied | 非常滿意 / 滿意 / 普通 / 不滿意 / 非常不滿意 | 100/75/50/25/0 |
| **7** health | Excellent / Very good / Good / Fair / Poor | 極佳 / 非常好 / 好 / 普通 / 差 | 100/75/50/25/0 |
| **9** last-4-weeks | All the time / large part / part / small part / Not at all | 一直如此 / 大部分時間 / 部分時間 / 一小部分時間 / 完全沒有 | 100/75/50/25/0 |

Footnotes: `†` add "我沒有主管" option (coded missing); `‡` add "我沒有同事".

---

## DOMAIN A — Demands at Work / 工作要求

### Quantitative Demands · 量化要求 (QD) — dir: demand (high=🔴)
| Item | Lvl | English | 简中 | RO | Rev |
|---|---|---|---|---|---|
| QD1* | MIDDLE | Is your workload unevenly distributed so it piles up? | 您的工作负荷被分配不均，因此其堆积成山吗？ | 1 | no |
| QD2 | CORE | How often do you not have time to complete all your work tasks? | 由于时间不足，您无法完成您所有工作任务的频次是? | 1 | no |
| QD3 | CORE | Do you get behind with your work? | 您拖延您的工作了吗？ | 1 | no |
| QD4* | LONG | Do you have enough time for your work tasks? | 您有足够的时间完成您的工作任务吗？ | 1 | **yes** |

### Work Pace · 工作步調 (WP) — demand
| WP1 | CORE | Do you have to work very fast? | 您不得不很快地工作吗？ | 1 | no |
| WP2 | CORE | Do you work at a high pace throughout the day? | 您一整天都处于高节奏的工作吗？ | 2 | no |
| WP3 | LONG | Is it necessary to keep working at a high pace? | 保持高节奏的工作是必须的吗？ | 2 | no |

### Cognitive Demands · 認知要求 (CD) — demand (方向爭議，加註腳)
| CD1 | LONG | Do you have to keep your eyes on lots of things while you work? | 您工作时，不得不密切关注很多事情吗？ | 1 | no |
| CD2 | LONG | Does your work require that you remember a lot of things? | 您的工作要求您记住很多东西吗？ | 1 | no |
| CD3 | LONG | Does your work demand that you are good at coming up with new ideas? | 您的工作要求您擅长想出新思路吗？ | 1 | no |
| CD4 | LONG | Does your work require you to make difficult decisions? | 您的工作要求您做出艰难的决策吗？ | 1 | no |

### Emotional Demands · 情緒要求 (ED) — demand
| ED1 | MIDDLE | Does your work put you in emotionally disturbing situations? | 您的工作使您处于情绪困扰的情境吗？ | 1 | no |
| EDX2 | CORE | Do you have to deal with other people's personal problems as part of your work? | 作为您工作的一部分，您不得不处理他人的个人问题吗？ | 1 | no |
| ED3 | CORE | Is your work emotionally demanding? | 您的工作是情感要求型的吗？ | 2 | no |

### Demands for Hiding Emotions · 隱藏情緒要求 (HE) — demand
| HE1 | LONG | Are you required to treat everyone equally, even if you do not feel like it? | 您的工作要求您平等对待每个人，即使您不喜欢这样吗? | 1 | no |
| HE2 | MIDDLE | Does your work require that you hide your feelings? | 您的工作要求您隐藏您的感受吗？ | 2 | no |
| HE3 | MIDDLE | Are you required to be kind and open towards everyone regardless of how they behave towards you? | 您的工作要求您对每个人都保持友善和开放的态度，无论他们如何待人吗? | 2 | no |
| HE4* | MIDDLE | Does your work require that you do not state your opinion? | 您的工作要求您不陈述您的意见吗？ | 1 | no |

## DOMAIN B — Work Organization & Job Content / 工作組織與內容

### Influence at Work · 工作影響力 (IN) — resource (high=🟢)
| INX1 | CORE | Do you have a large degree of influence on the decisions concerning your work? | 您对涉及您工作的决策有很大程度的影响力吗？ | 1 | no |
| IN2* | LONG | Do you have a say in choosing who you work with? | 您有选择与谁工作的发言权吗？ | 1 | no |
| IN3* | MIDDLE | Can you influence the amount of work assigned to you? | 您能够影响分配给您的工作量吗？ | 1 | no |
| IN4* | MIDDLE | Do you have any influence on what you do at work? | 您对您在工作中做什么有任何影响吗？ | 1 | no |
| IN5* | LONG | Can you influence how quickly you work? | 您能够影响您工作（进度）多快吗？ | 1 | no |
| IN6* | MIDDLE | Do you have any influence on HOW you do your work? | ⚠ 简中供应材料此处误植 PR1 文字；正确简中应为「您对您如何完成工作有任何影响吗？」（以英文为真值） | 1 | no |

### Possibilities for Development · 發展可能性 (PD) — resource
| PD2 | CORE | Do you have the possibility of learning new things through your work? | 通过工作，您有学习新生事物的可能性吗? | 2 | no |
| PD3 | CORE | Can you use your skills or expertise in your work? | 您能够在您的工作中运用您的技能或专长吗？ | 2 | no |
| PD4* | MIDDLE | Does your work give you the opportunity to develop your skills? | 您的工作给了您发展技能的机会吗？ | 2 | no |

### Variation of Work · 工作變化性 (VA) — resource
| VA1 | LONG | Is your work varied? | 您的工作是变化的吗? | 1 | no |
| VA2* | LONG | Do you have to do the same thing over and over again? | 您不得不一遍又一遍做同样的事情吗？ | 1 | **yes** |

### Control over Working Time · 工時掌控 (CT) — resource
| CT1* | MIDDLE | Can you decide when to take a break? | 您能够决定何时工间休息吗？ | 1 | no |
| CT2* | MIDDLE | Can you take holidays more or less when you wish? | 您能根据自己的意愿或多或少地休假吗? | 1 | no |
| CT3* | MIDDLE | Can you leave your work to have a chat with a colleague? | 您能放下您的工作去和同事聊聊天吗? | 1 | no |
| CT4* | MIDDLE | If you have some private business, can you leave your place of work for half an hour without special permission? | 如果您有一些私事，您有可能离开您的工作场所半小时而无需专门许可吗？ | 1 | no |
| CT5* | LONG | Do you have to do overtime? | 您不得不加班吗? | 1 | **yes** |

### Meaning of Work · 工作意義 (MW) — resource
| MW1 | CORE | Is your work meaningful? | 您的工作是有意义的吗? | 2 | no |
| MW2* | MIDDLE | Do you feel that the work you do is important? | 您感觉您所做的工作是重要的吗? | 2 | no |

## DOMAIN C — Interpersonal Relations & Leadership / 人際關係與領導

### Predictability · 可預測性 (PR) — resource
| PR1 | CORE | At your place of work, are you informed well in advance concerning e.g. important decisions, changes or plans for the future? | 在您的工作场所，您被良好地提前告知诸如关切未来的重要决策、变革或规划吗？ | 2 | no |
| PR2 | CORE | Do you receive all the information you need in order to do your work well? | 为做好您的工作，您收到了所有您所需要的信息吗? | 2 | no |

### Recognition · 認可 (RE) — resource  ⚠ 简中 RE1↔RE2 在补充档互换，以英文为真值
| RE1 | CORE | Is your work recognized and appreciated by the management? | 您的工作被管理层认可和赞赏吗?（修正后） | 2 | no |
| RE2 | LONG | Does the management at your workplace respect you? | 您工作场所的管理层尊重您吗？（修正后） | 2 | no |
| RE3 | LONG | Are you treated fairly at your workplace? | 在您的工作场所您是被公平对待的吗？ | 2 | no |

### Role Clarity · 角色明確 (CL) — resource
| CL1* | CORE | Does your work have clear objectives? | 您的工作有明确的目标吗？ | 2 | no |
| CL2 | MIDDLE | Do you know exactly which areas are your responsibility? | 您清楚地知道哪些领域是您负责的吗? | 2 | no |
| CL3 | MIDDLE | Do you know exactly what is expected of you at work? | 您是否准确地知道（单位）对您工作的期望是什么吗？ | 2 | no |

### Role Conflicts · 角色衝突 (CO) — demand  ⚠ 简中 CO2↔CO3 互换，以英文为真值
| CO2 | CORE | Are contradictory demands placed on you at work? | 在工作中，您被置于相互矛盾的要求之中吗？（修正后） | 2 | no |
| CO3 | CORE | Do you sometimes have to do things which ought to have been done in a different way? | 您有时不得不做一些本应已经以不同方式被完成的事情吗?（修正后） | 2 | no |

### Illegitimate Tasks · 不合理任務 (IT) — demand
| IT1* | MIDDLE | Do you sometimes have to do things which seem to be unnecessary? | 您有时不得不做一些看似不必要的事情吗? | 2 | no |

### Quality of Leadership · 領導品質 (QL) — resource — 詞幹「您的直接主管…」
| QLX1* | MIDDLE | …makes sure that staff have good development opportunities? | …确保其成员们有良好的发展机会？ | 2† | no |
| QL2 | LONG | …gives high priority to job satisfaction? | …对工作满意度给予高度优先？ | 2† | no |
| QL3 | CORE | …is good at work planning? | …擅长制定工作规划？ | 2† | no |
| QL4 | CORE | …is good at solving conflicts? | …擅长解决冲突？ | 2† | no |

### Social Support – Supervisor · 主管支持 (SS) — resource
| SSX1 | MIDDLE | How often is your immediate superior willing to listen to your problems at work, if needed? | 如果需要，您的直接领导多久愿意倾听您在工作中的问题? | 1† | no |
| SSX2 | CORE | How often do you get help and support from your immediate superior, if needed? | 如果需要，您多久从您的直接领导那里得到帮助和支持? | 1† | no |
| SSX3* | LONG | How often does your immediate superior talk with you about how well you carry out your work? | 您的直接领导会多久与您谈论您工作表现的好坏？ | 1† | no |

### Social Support – Colleagues · 同事支持 (SC) — resource
| SCX1 | CORE | How often do you get help and support from your colleagues, if needed? | 如果需要，您多久从您的同事那里得到帮助和支持? | 1‡ | no |
| SCX2 | MIDDLE | How often are your colleagues willing to listen to your problems at work, if needed? | 如果需要，您的同事多久愿意倾听您在工作中遇到的问题? | 1‡ | no |
| SC3* | LONG | How often do your colleagues talk with you about how well you carry out your work? | 您的同事会多久与您讨论您工作表现的好坏？ | 1‡ | no |

### Sense of Community at Work · 職場社群感 (SW) — resource
| SW1 | CORE | Is there a good atmosphere between you and your colleagues? | 您和您的同事之间有良好的氛围吗？ | 1‡ | no |
| SW2* | LONG | Is there good co-operation between the colleagues at work? | 在工作中，同事之间有良好的合作吗? | 1‡ | no |
| SW3* | MIDDLE | Do you feel part of a community at your place of work? | 在您工作的地方，您感到您是社区的一部分吗? | 1‡ | no |

## DOMAIN D — Work–Individual Interface / 工作—個人介面  (WE 已移除)

### Commitment to the Workplace · 職場承諾 (CW) — resource
| CW1 | LONG | Do you enjoy telling others about your place of work? | 您喜欢向别人介绍您工作的地方吗？ | 2 | no |
| CW2* | LONG | Do you feel that your place of work is of great importance to you? | 您觉得您的工作场所对您来说非常重要吗？ | 2 | no |
| CWX3* | LONG | Would you recommend others to apply for a position at your workplace? | 您愿意推荐其他人在您的工作场所申请一个职位吗？ | 2 | no |
| CW4* | LONG | How often do you consider looking for work elsewhere? | 您多频繁考虑要在其他地方找工作？ | 1 | **yes** |
| CW5* | LONG | Are you proud of being part of this organization? | 您为作为这个组织的一员而骄傲吗？ | 2 | no |

### Job Insecurity · 工作不安全感 (JI) — demand
| JI1 | CORE | Are you worried about becoming unemployed? | 您担心会失业吗? | 2 | no |
| JI2* | LONG | Are you worried about new technology making you redundant? | 您担心新技术会让您变得多余吗? | 2 | no |
| JI3 | CORE | Are you worried about it being difficult to find another job if you became unemployed? | 您担心万一失业将难以找到另一份工作吗？ | 2 | no |

### Insecurity over Working Conditions · 工作條件不安全感 (IW) — demand
| IW1 | CORE | Are you worried about being transferred to another job against your will? | 您担心在违背您意愿的情况下被调离到另一个岗位吗？ | 2 | no |
| IW2* | LONG | Are you worried about your working tasks being changed against your will? | 您担心在违背您的意愿的情况下变更您的工作任务吗？ | 2 | no |
| IW3* | MIDDLE | Are you worried about the timetable being changed (shift, weekdays, hours) against your will? | 您担心在违背您的意愿的情况下改变工作时间表（轮班、工作日、上下班时间）吗？ | 2 | no |
| IW4* | MIDDLE | Are you worried about a decrease in your salary? | 您担心您的工资会被减少（降薪、引入可变薪酬）吗？ | 2 | no |
| IW5* | LONG | Are there good prospects in your job? | 您的岗位有良好的前景吗？ | 2 | **yes** |

### Quality of Work · 工作品質 (QW) — resource
| QW1 | LONG | To what extent is it possible to perform your work tasks at a satisfactory quality? | 您发现在多大程度上可能以令人满意的质量完成您的工作任务？ | 2 | no |
| QW2 | MIDDLE | Are you satisfied with the quality of the work performed at your workplace? | 在您的工作场所，您对所完成工作的质量满意吗? | 2 | no |

### Job Satisfaction · 工作滿意 (JS) — resource — 詞幹「整體而言，您對…的滿意度」
| JS1 | MIDDLE | …your work prospects? | …您的工作前景？ | 6 | no |
| JS2 | LONG | …the physical working conditions? | …物理工作条件? | 6 | no |
| JS3 | LONG | …the way your abilities are used? | …您的能力被使用的方式? | 6 | no |
| JS4 | CORE | …your job as a whole, everything considered? | …将所有因素纳入考虑，您对整个工作满意吗? | 6 | no |
| JS5* | MIDDLE | …your salary? | …您的工资? | 6 | no |

### Work–Life Conflict · 工作—生活衝突 (WF) — demand
| WFX1* | LONG | Are there times when you need to be at work and at home at the same time? | 有没有出现过您的工作和家里都同时需要您的情况? | 1 | no |
| WF2 | CORE | Do you feel that your work drains so much energy that it has a negative effect on your private life? | 您感到您的工作空耗了您如此多的精力，以至于对您的私人生活产生了消极影响吗？ | 2 | no |
| WF3 | CORE | Do you feel that your work takes so much time that it has a negative effect on your private life? | 您感到您的工作占用了您如此多的时间，以至于对您的个人生活产生了消极影响吗？ | 2 | no |
| WF5* | LONG | The demands of my work interfere with my private and family life. | 我的工作需求干扰了我的个人和家庭生活吗？ | 2 | no |
| WF6* | LONG | Due to work-related duties, I have to make changes to my plans for private and family activities. | 由于工作相关的职责，我不得不改变我的个人活动和家庭活动的计划。 | 2 | no |

## DOMAIN E — Social Capital: Trust & Justice / 社會資本

### Horizontal Trust · 水平信任 (TE) — resource
| TE1* | LONG | Do the employees withhold information from each other? | 劳动者之间互相隐瞒信息吗？ | 2 | **yes** |
| TE2* | LONG | Do the employees withhold information from the management? | 劳动者对管理层隐瞒信息吗？ | 2 | **yes** |
| TE3* | MIDDLE | Do the employees in general trust each other? | 劳动者之间总体上是相互信任的吗？ | 2 | no |

### Vertical Trust · 垂直信任 (TM) — resource
| TM1* | CORE | Does the management trust the employees to do their work well? | 管理层信任劳动者能做好他们的工作吗？ | 2 | no |
| TMX2* | CORE | Can the employees trust the information that comes from the management? | 劳动者相信来自管理层的信息吗？ | 2 | no |
| TM3* | LONG | Does the management withhold important information from the employees? | 管理层对劳动者隐瞒了重要信息吗？ | 2 | **yes** |
| TM4* | MIDDLE | Are the employees able to express their views and feelings? | 劳动者能够表达他们的观点和感受吗？ | 2 | no |

### Organizational Justice · 組織公正 (JU) — resource
| JU1 | CORE | Are conflicts resolved in a fair way? | 冲突以公正的方式得以解决吗？ | 2 | no |
| JU2 | LONG | Are employees appreciated when they have done a good job? | 当劳动者工作做得很好时，他们是否受到赞赏？ | 2 | no |
| JU3 | LONG | Are all suggestions from employees treated seriously by the management? | 管理层是否认真对待劳动者的所有建议？ | 2 | no |
| JU4 | CORE | Is the work distributed fairly? | 工作的分配是否公平？ | 2 | no |

## DOMAIN G — Health & Wellbeing / 健康與幸福  (詞幹「過去四週中…」, all LONG)

### Self-rated Health · 自評健康 (GH) — resource
| GH1 | LONG | In general, would you say your health is: | 总体上，您认为您的健康是： | 7 | no |
（GH2 0–10 階梯題本次省略，保留 GH1 即可；如需可後補）

### Sleeping Troubles · 睡眠困擾 (SL) — demand
| SL1* | LONG | How often have you slept badly and restlessly? | 您多久有睡眠不好和睡眠不宁的情况？ | 9 | no |
| SL2 | LONG | How often have you found it hard to go to sleep? | 您多久有难以入睡的情况？ | 9 | no |
| SL3 | LONG | How often have you woken up too early and not been able to get back to sleep? | 您多久有早醒而无法再入睡的情况? | 9 | no |
| SL4 | LONG | How often have you woken up several times and found it difficult to get back to sleep? | 您多久有醒好几次并发现很难再入睡的情况？ | 9 | no |

### Burnout · 職業倦怠 (BO) — demand — **繁中採台灣職場疲勞量表已驗證用詞**
| BO1 | LONG | How often have you felt worn out? | 您多久感到疲惫不堪？ | 9 | no | 繁中：您常覺得疲勞嗎？ |
| BO2 | LONG | How often have you been physically exhausted? | 您多久感到身体上枯竭？ | 9 | no | 繁中：您常覺得身體上體力透支嗎？ |
| BO3 | LONG | How often have you been emotionally exhausted? | 您多久感到情绪上枯竭？ | 9 | no | 繁中：您常覺得情緒上心力交瘁嗎？ |
| BO4 | LONG | How often have you felt tired? | 您多久感到劳累？ | 9 | no | 繁中：您常覺得累嗎？ |

### Stress · 壓力 (ST) — demand
| ST1 | LONG | How often have you had problems relaxing? | 您多久有难以放松的问题？ | 9 | no |
| ST2 | LONG | How often have you been irritable? | 您多久曾感到易怒？ | 9 | no |
| ST3 | LONG | How often have you been tense? | 您多久感到紧张？ | 9 | no |

### Somatic Stress · 身體壓力 (SO) — demand
| SO1* | LONG | How often have you had stomach ache? | 您多久出现胃痛的症状？ | 9 | no |
| SO2* | LONG | How often have you had a headache? | 您多久出现头痛的症状？ | 9 | no |
| SO3 | LONG | How often have you had palpitations? | 您多久出现心悸的症状？ | 9 | no |
| SO4 | LONG | How often have you had tension in various muscles? | 您多久出现各种肌肉紧张症状？ | 9 | no |

### Cognitive Stress · 認知壓力 (CS) — demand
| CS1* | LONG | How often have you had problems concentrating? | 您多久有注意力不集中的问题？ | 9 | no |
| CS2 | LONG | How often have you found it difficult to think clearly? | 您多久发现难以清晰思考？ | 9 | no |
| CS3 | LONG | How often have you had difficulty in taking decisions? | 您多久有难以做决定的情况？ | 9 | no |
| CS4 | LONG | How often have you had difficulty with remembering? | 您多久有记忆困难的情况？ | 9 | no |

### Depressive Symptoms · 憂鬱症狀 (DS) — demand
| DS1 | LONG | How often have you felt sad? | 您多久感到悲伤？ | 9 | no |
| DS2* | LONG | How often have you lacked self-confidence? | 您多久缺乏自信？ | 9 | no |
| DS3* | LONG | How often have you had a bad conscience or felt guilty? | 您多久感到良心不安或内疚？ | 9 | no |
| DS4* | LONG | How often have you lacked interest in everyday things? | 您多久对日常事物缺乏兴趣？ | 9 | no |

---

## Implementation notes / gaps (carry into build)
- Fix China-supplement errors when building 简中: **IN6** (mis-pasted PR1 text), **RE1↔RE2** swap, **CO2↔CO3** swap, **SSX3** English (use guidelines wording). English column is ground truth.
- **CD** direction = demand (China convention) — add report footnote noting international ambiguity.
- 繁中: author all in Taiwan register (員工/主管/同事/職務; not 劳动者/上级/岗位). BO family uses the Taiwan 職場疲勞量表 wording shown above.
- `*` items remain valid international items (only dropped from China-final scale) — keep them; they carry their Lvl tag for short/middle/long filtering.
- All scored items map to value 0..4; reverse items use `rev:true` (score = 4 - v).
