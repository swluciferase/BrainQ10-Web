// BrainQ10 量表資料定義
// 包含：GDS-15, PHQ-9, ASRS, SNAP-IV, Vanderbilt家長版, Vanderbilt教師版, 巴哈花精

const FREQ4 = [
  { label: '從不', value: 0 },
  { label: '偶爾', value: 1 },
  { label: '經常', value: 2 },
  { label: '總是', value: 3 }
];

const FREQ5 = [
  { label: '從不', value: 0 },
  { label: '很少', value: 1 },
  { label: '有時', value: 2 },
  { label: '常常', value: 3 },
  { label: '非常頻繁', value: 4 }
];

const SNAP4 = [
  { label: '完全沒有', value: 0 },
  { label: '有一點點', value: 1 },
  { label: '還算不少', value: 2 },
  { label: '非常的多', value: 3 }
];

const PHQ4 = [
  { label: '完全沒有', value: 0 },
  { label: '幾天', value: 1 },
  { label: '一半以上天數', value: 2 },
  { label: '幾乎每天', value: 3 }
];

const PERF5 = [
  { label: '優秀', value: 1 },
  { label: '平均以上', value: 2 },
  { label: '平均', value: 3 },
  { label: '有點問題', value: 4 },
  { label: '有嚴重問題', value: 5 }
];

const LIKERT5 = [
  { label: '1 – 完全不符合', value: 1 },
  { label: '2 – 大部分不符合', value: 2 },
  { label: '3 – 有些符合', value: 3 },
  { label: '4 – 大部分符合', value: 4 },
  { label: '5 – 非常符合', value: 5 }
];

const SCALES = [
  // ─────────────────────────────────────────────
  // 1. GDS-15 老年憂鬱量表
  // ─────────────────────────────────────────────
  {
    id: 'gds15',
    name: 'GDS-15',
    fullName: '老年憂鬱量表 (GDS-15)',
    description: '老年憂鬱症篩查量表，評估過去一週的情緒狀態',
    category: '情緒評估',
    estimatedMinutes: 5,
    criteria: { minAge: 65, maxAge: null, roles: ['self'] },
    instructions: '以下問題請根據您過去一週的感受，選擇「是」或「否」。',
    sections: [
      {
        id: 'main',
        label: null,
        questions: [
          { id: 1,  text: '基本上，您對您的生活滿意嗎？',                          options: [{label:'是',value:0},{label:'否',value:1}] },
          { id: 2,  text: '您是否常常感到厭煩？',                                  options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 3,  text: '您是否常常感到，無論做什麼都沒有用？',                  options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 4,  text: '您是否比較喜歡待在家裡，而較不喜歡外出或做新的事？',  options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 5,  text: '您是否感覺您現在活的很沒有價值？',                      options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 6,  text: '您是否減少很多的活動和嗜好？',                          options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 7,  text: '您是否覺得您的生活很空虛？',                            options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 8,  text: '您是否大部分時間精神都很好？',                          options: [{label:'是',value:0},{label:'否',value:1}] },
          { id: 9,  text: '您害怕將有不幸的事情發生在您身上嗎？',                  options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 10, text: '您是否大部分時間都感到快樂？',                          options: [{label:'是',value:0},{label:'否',value:1}] },
          { id: 11, text: '您是否覺得您比大多數人有較多記憶的問題？',              options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 12, text: '您是否覺得現在還能活著是很好的事？',                    options: [{label:'是',value:0},{label:'否',value:1}] },
          { id: 13, text: '您是否覺得精力很充沛？',                                options: [{label:'是',value:0},{label:'否',value:1}] },
          { id: 14, text: '您是否覺得您現在的狀況是沒有希望的？',                  options: [{label:'是',value:1},{label:'否',value:0}] },
          { id: 15, text: '您是否覺得大部分的人都比您幸福？',                      options: [{label:'是',value:1},{label:'否',value:0}] }
        ]
      }
    ],
    scoring: {
      type: 'sum',
      subscales: [{ id: 'total', name: '總分', questionIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }],
      interpretation: {
        subscaleId: 'total',
        ranges: [
          { min: 0,  max: 4,  severity: 'normal',   label: '正常',    color: '#27ae60', note: '無明顯憂鬱症狀。' },
          { min: 5,  max: 8,  severity: 'mild',     label: '輕度憂鬱', color: '#f39c12', note: '有輕度憂鬱傾向，建議持續關注情緒狀況。' },
          { min: 9,  max: 11, severity: 'moderate', label: '中度憂鬱', color: '#e67e22', note: '建議尋求心理諮詢或醫療協助。' },
          { min: 12, max: 15, severity: 'severe',   label: '重度憂鬱', color: '#e74c3c', note: '強烈建議盡快接受完整的醫療評估與治療。' }
        ]
      }
    }
  },

  // ─────────────────────────────────────────────
  // 2. PHQ-9 病人健康問卷
  // ─────────────────────────────────────────────
  {
    id: 'phq9',
    name: 'PHQ-9',
    fullName: '病人健康問卷 (PHQ-9)',
    description: '憂鬱症篩查量表，評估過去兩週的情緒與功能狀況',
    category: '情緒評估',
    estimatedMinutes: 5,
    criteria: { minAge: 18, maxAge: null, roles: ['self'] },
    instructions: '在過去兩個星期，有多少時候受到以下任何問題所困擾：',
    sections: [
      {
        id: 'main',
        label: null,
        questions: [
          { id: 1, text: '做事時提不起勁或沒有樂趣',                                  options: PHQ4 },
          { id: 2, text: '感到心情低落、沮喪或絕望',                                  options: PHQ4 },
          { id: 3, text: '入睡困難、睡不安穩或睡眠過多',                              options: PHQ4 },
          { id: 4, text: '感覺疲倦或沒有活力',                                        options: PHQ4 },
          { id: 5, text: '食慾不振或吃太多',                                          options: PHQ4 },
          { id: 6, text: '覺得自己很糟、失敗，或讓自己或家人失望',                    options: PHQ4 },
          { id: 7, text: '對事物專注有困難，例如閱讀報紙或看電視',                    options: PHQ4 },
          { id: 8, text: '動作或說話速度緩慢，或煩躁或坐立不安',                      options: PHQ4 },
          { id: 9, text: '有不如死掉或用某種方式傷害自己的念頭',                      options: PHQ4, flag: true }
        ]
      }
    ],
    scoring: {
      type: 'sum',
      subscales: [{ id: 'total', name: '總分', questionIds: [1,2,3,4,5,6,7,8,9] }],
      flags: [{ questionId: 9, triggerValues: [1,2,3], message: '⚠️ 第9題出現自傷念頭，請立即進行安全評估並尋求專業協助。', severity: 'critical' }],
      interpretation: {
        subscaleId: 'total',
        ranges: [
          { min: 0,  max: 4,  severity: 'minimal',           label: '無/極輕微', color: '#27ae60', note: '無明顯憂鬱症狀。' },
          { min: 5,  max: 9,  severity: 'mild',              label: '輕度憂鬱',  color: '#f39c12', note: '建議持續觀察，注意情緒變化。' },
          { min: 10, max: 14, severity: 'moderate',          label: '中度憂鬱',  color: '#e67e22', note: '建議尋求心理諮詢或醫療協助。' },
          { min: 15, max: 19, severity: 'moderately_severe', label: '中重度憂鬱', color: '#d35400', note: '建議積極尋求醫療評估與治療。' },
          { min: 20, max: 27, severity: 'severe',            label: '重度憂鬱',  color: '#e74c3c', note: '強烈建議立即就醫接受完整評估。' }
        ]
      }
    }
  },

  // ─────────────────────────────────────────────
  // 3. ASRS-v1.1 成人ADHD自填量表
  // ─────────────────────────────────────────────
  {
    id: 'asrs',
    name: 'ASRS-v1.1',
    fullName: '成人ADHD自填量表 (ASRS-v1.1)',
    description: 'WHO成人注意力缺失/過動症篩查量表，評估過去6個月的狀況',
    category: 'ADHD評估',
    estimatedMinutes: 10,
    criteria: { minAge: 18, maxAge: null, roles: ['self'] },
    instructions: '以下問題請根據您過去6個月的狀況，選擇最符合的選項：',
    sections: [
      {
        id: 'inattention',
        label: '注意力不集中（第1–9題）',
        questions: [
          { id: 1, text: '當必須進行一件枯燥或困難的計畫時，你會多常粗心犯錯', options: FREQ5 },
          { id: 2, text: '當正在做枯燥或重複性的工作時，你多常有持續專注的困難', options: FREQ5 },
          { id: 3, text: '即使有人直接對你說話，你會多常有困難專注於別人跟你講話的內容', options: FREQ5 },
          { id: 4, text: '完成計畫中最具挑戰的部分後，你多常有完成計畫最後細節的困難', options: FREQ5 },
          { id: 5, text: '當必須從事需要有組織規劃性的任務時，你會多常有困難去執行', options: FREQ5 },
          { id: 6, text: '當有一件需要多費心思考的工作時，你會多常逃避或是延後開始去做', options: FREQ5 },
          { id: 7, text: '在家或是在工作時，你會多常沒有把東西放對地方或是找不到東西', options: FREQ5 },
          { id: 8, text: '你會多常因身旁的活動或聲音而分心', options: FREQ5 },
          { id: 9, text: '你會多常有問題去記得約會或是必須要做的事', options: FREQ5 }
        ]
      },
      {
        id: 'hyperactivity',
        label: '過動／衝動（第10–18題）',
        questions: [
          { id: 10, text: '當你必須長時間坐著時，你會多常坐不安穩或扭動手腳', options: FREQ5 },
          { id: 11, text: '你會多常在開會時或在其他必須坐好的場合中離開座位', options: FREQ5 },
          { id: 12, text: '你會多常覺得靜不下來或煩躁不安', options: FREQ5 },
          { id: 13, text: '當有自己獨處的時間時，你會多常覺得有困難使自己平靜和放鬆', options: FREQ5 },
          { id: 14, text: '你會多常像被馬達所驅動一樣，覺得自己過度活躍，不得不做事情', options: FREQ5 },
          { id: 15, text: '在社交場合中，你會多常發現自己話講太多', options: FREQ5 },
          { id: 16, text: '當與他人交談時，你會多常在別人還沒講話完前就插嘴', options: FREQ5 },
          { id: 17, text: '在需要輪流排隊的場合時，你會多常有困難輪流等待', options: FREQ5 },
          { id: 18, text: '你會多常在別人忙碌時打斷別人', options: FREQ5 }
        ]
      }
    ],
    scoring: {
      type: 'subscale_sum',
      subscales: [
        { id: 'inattention',   name: '注意力不集中', questionIds: [1,2,3,4,5,6,7,8,9],         maxScore: 36 },
        { id: 'hyperactivity', name: '過動／衝動',   questionIds: [10,11,12,13,14,15,16,17,18], maxScore: 36 }
      ],
      // ASRS Part A 篩查：Q1-6 特定閾值
      screeningPartA: {
        items: [
          { qId: 1, threshold: 2 },
          { qId: 2, threshold: 2 },
          { qId: 3, threshold: 2 },
          { qId: 4, threshold: 3 },
          { qId: 5, threshold: 3 },
          { qId: 6, threshold: 3 }
        ],
        positiveCount: 4
      },
      interpretation: {
        subscales: {
          inattention:   { ranges: [
            { min: 0,  max: 13, label: '低度',  color: '#27ae60' },
            { min: 14, max: 22, label: '中度',  color: '#f39c12' },
            { min: 23, max: 36, label: '高度',  color: '#e74c3c' }
          ]},
          hyperactivity: { ranges: [
            { min: 0,  max: 13, label: '低度',  color: '#27ae60' },
            { min: 14, max: 22, label: '中度',  color: '#f39c12' },
            { min: 23, max: 36, label: '高度',  color: '#e74c3c' }
          ]}
        }
      }
    }
  },

  // ─────────────────────────────────────────────
  // 4. SNAP-IV 兒童注意力評估量表
  // ─────────────────────────────────────────────
  {
    id: 'snapiv',
    name: 'SNAP-IV',
    fullName: 'SNAP-IV 兒童注意力量表（26題版）',
    description: '兒童ADHD及對立反抗評估量表（26題），由家長或教師依據孩子平時表現填寫。來源：akai.org.tw 中文版常模（劉昱志等，2006）',
    category: 'ADHD評估（兒童）',
    estimatedMinutes: 12,
    criteria: { minAge: 6, maxAge: 13, roles: ['parent', 'teacher'] },
    instructions: '根據孩子的平時表現，請選擇最符合孩子狀況的選項：',
    sections: [
      {
        id: 'inattention',
        label: '注意力不集中（第1–9題）',
        questions: [
          { id: 1,  text: '在做學校作業或其他活動時，無法專注於細節的部分或出現粗心的錯誤', options: SNAP4 },
          { id: 2,  text: '很難持續專注於工作或遊戲活動', options: SNAP4 },
          { id: 3,  text: '看起來好像沒有在聽別人對他(她)說話的內容', options: SNAP4 },
          { id: 4,  text: '沒有辦法遵循指示，也無法完成學校作業或家事(並不是由於對立性行為或無法了解指示的內容)', options: SNAP4 },
          { id: 5,  text: '很難組織規劃工作及活動', options: SNAP4 },
          { id: 6,  text: '逃避、或表達不願意，或有困難於需要持續性動腦的工作(例如學校作業或家庭作業)', options: SNAP4 },
          { id: 7,  text: '會弄丟工作上或活動所必須的東西(例如學校作業、鉛筆、書、工具或玩具)', options: SNAP4 },
          { id: 8,  text: '很容易受外在刺激影響而分心', options: SNAP4 },
          { id: 9,  text: '在日常生活中忘東忘西的', options: SNAP4 }
        ]
      },
      {
        id: 'hyperactivity',
        label: '過動／衝動（第10–18題）',
        questions: [
          { id: 10, text: '在座位上玩弄手腳或不好好坐著', options: SNAP4 },
          { id: 11, text: '在教室或其他必須持續坐著的場合，會任意離開座位', options: SNAP4 },
          { id: 12, text: '在不適當的場合，亂跑或爬高爬低', options: SNAP4 },
          { id: 13, text: '很難安靜地玩或參與休閒活動', options: SNAP4 },
          { id: 14, text: '總是一直在動或是像裝了馬達似的動個不停', options: SNAP4 },
          { id: 15, text: '話很多', options: SNAP4 },
          { id: 16, text: '在問題還沒問完前就急著回答', options: SNAP4 },
          { id: 17, text: '在遊戲中或團體活動中，無法排隊或輪流等待', options: SNAP4 },
          { id: 18, text: '打斷或干擾別人(例如：插嘴或打斷別人的遊戲)', options: SNAP4 }
        ]
      },
      {
        id: 'odd',
        label: '對立反抗行為（第19–26題）',
        questions: [
          { id: 19, text: '發脾氣', options: SNAP4 },
          { id: 20, text: '與大人爭論', options: SNAP4 },
          { id: 21, text: '主動地反抗或拒絕大人的要求與規定', options: SNAP4 },
          { id: 22, text: '故意地做一些事去干擾別人', options: SNAP4 },
          { id: 23, text: '因自己犯的錯或不適當的行為而怪罪別人', options: SNAP4 },
          { id: 24, text: '易怒的或容易被別人激怒', options: SNAP4 },
          { id: 25, text: '生氣的及怨恨的', options: SNAP4 },
          { id: 26, text: '惡意的或有報復心的', options: SNAP4 }
        ]
      }
    ],
    scoring: {
      type: 'subscale_avg',
      subscales: [
        { id: 'inattention',   name: '注意力不集中', questionIds: [1,2,3,4,5,6,7,8,9],         dsmRequired: 6 },
        { id: 'hyperactivity', name: '過動／衝動',   questionIds: [10,11,12,13,14,15,16,17,18], dsmRequired: 6 },
        { id: 'odd',           name: '對立反抗',     questionIds: [19,20,21,22,23,24,25,26],    dsmRequired: 4 }
      ],
      positiveItemThreshold: 2,
      avgCutoff: 2.0,
      interpretation: {
        rules: [
          { condition: 'both',              label: 'ADHD 混合型（符合DSM-IV門檻）',             color: '#e74c3c' },
          { condition: 'inattention_only',  label: 'ADHD 注意力不集中型（符合DSM-IV門檻）',     color: '#e67e22' },
          { condition: 'hyperactivity_only',label: 'ADHD 過動／衝動型（符合DSM-IV門檻）',       color: '#e67e22' },
          { condition: 'neither',           label: '未達ADHD診斷門檻',                          color: '#27ae60' }
        ]
      }
    }
  },

  // ─────────────────────────────────────────────
  // 5. Vanderbilt 家長版（55題）
  // ─────────────────────────────────────────────
  {
    id: 'vanderbilt_parent',
    name: 'Vanderbilt 家長版',
    fullName: 'Vanderbilt ADHD 家長評估量表',
    description: '全面ADHD評估量表（家長版），評估兒童過去6個月的行為',
    category: 'ADHD評估（兒童）',
    estimatedMinutes: 15,
    criteria: { minAge: 6, maxAge: 18, roles: ['parent'] },
    instructions: '以下問題請根據孩子過去6個月的行為，選擇最符合的選項：',
    sections: [
      {
        id: 'symptoms',
        label: '症狀評估（第1–47題）',
        questions: [
          { id: 1,  text: '做事不注意細節或粗心犯錯（如作業）',                           options: FREQ4, sub: 'inattention' },
          { id: 2,  text: '在任務或活動中難以維持專注',                                    options: FREQ4, sub: 'inattention' },
          { id: 3,  text: '與他直接說話時，感覺他沒在聽',                                  options: FREQ4, sub: 'inattention' },
          { id: 4,  text: '無法遵循指示且無法完成學校課業、雜務或職責',                    options: FREQ4, sub: 'inattention' },
          { id: 5,  text: '難以規劃或組織任務與活動',                                      options: FREQ4, sub: 'inattention' },
          { id: 6,  text: '逃避、不喜歡或不願意開始需要持續動腦的任務（如作業）',          options: FREQ4, sub: 'inattention' },
          { id: 7,  text: '弄丟任務所需的必需品（如筆、書、工具）',                        options: FREQ4, sub: 'inattention' },
          { id: 8,  text: '容易被外在刺激分心',                                            options: FREQ4, sub: 'inattention' },
          { id: 9,  text: '在日常活動中忘東忘西',                                          options: FREQ4, sub: 'inattention' },
          { id: 10, text: '座位上玩弄手腳、扭動或坐不安穩',                                options: FREQ4, sub: 'hyperactivity' },
          { id: 11, text: '在必須坐著的場合任意離開座位',                                  options: FREQ4, sub: 'hyperactivity' },
          { id: 12, text: '在不當場合亂跑或過度爬高',                                      options: FREQ4, sub: 'hyperactivity' },
          { id: 13, text: '難以安靜地玩耍或參與休閒活動',                                  options: FREQ4, sub: 'hyperactivity' },
          { id: 14, text: '像被馬達驅動般「一直動」，停不下來',                            options: FREQ4, sub: 'hyperactivity' },
          { id: 15, text: '話很多，過度說話',                                              options: FREQ4, sub: 'hyperactivity' },
          { id: 16, text: '在問題還沒問完前就搶著回答',                                    options: FREQ4, sub: 'hyperactivity' },
          { id: 17, text: '難以等待輪流',                                                  options: FREQ4, sub: 'hyperactivity' },
          { id: 18, text: '打斷或干擾他人（如插嘴、強入遊戲）',                            options: FREQ4, sub: 'hyperactivity' },
          { id: 19, text: '與大人爭論',                                                    options: FREQ4, sub: 'odd' },
          { id: 20, text: '發脾氣',                                                        options: FREQ4, sub: 'odd' },
          { id: 21, text: '主動反抗或拒絕遵守大人的要求或規則',                            options: FREQ4, sub: 'odd' },
          { id: 22, text: '故意惹人煩',                                                    options: FREQ4, sub: 'odd' },
          { id: 23, text: '為了自己的錯誤或不當行為而怪罪他人',                            options: FREQ4, sub: 'odd' },
          { id: 24, text: '容易過敏或被他人激怒',                                          options: FREQ4, sub: 'odd' },
          { id: 25, text: '感到生氣或憤恨不平',                                            options: FREQ4, sub: 'odd' },
          { id: 26, text: '充滿惡意且想要報復',                                            options: FREQ4, sub: 'odd' },
          { id: 27, text: '霸凌、威脅或恐嚇他人',                                          options: FREQ4, sub: 'cd' },
          { id: 28, text: '發起打架',                                                      options: FREQ4, sub: 'cd' },
          { id: 29, text: '為了逃避責任或獲取好處而撒謊（「欺騙」他人）',                  options: FREQ4, sub: 'cd' },
          { id: 30, text: '未經許可逃學',                                                  options: FREQ4, sub: 'cd' },
          { id: 31, text: '對人體格殘酷',                                                  options: FREQ4, sub: 'cd' },
          { id: 32, text: '偷竊有價值的物品',                                              options: FREQ4, sub: 'cd' },
          { id: 33, text: '故意破壞他人財產',                                              options: FREQ4, sub: 'cd' },
          { id: 34, text: '使用能致傷的武器（如棍子、刀）',                                options: FREQ4, sub: 'cd' },
          { id: 35, text: '虐待動物',                                                      options: FREQ4, sub: 'cd' },
          { id: 36, text: '故意縱火造成損害',                                              options: FREQ4, sub: 'cd' },
          { id: 37, text: '闖入他人的房屋、商店或汽車',                                    options: FREQ4, sub: 'cd' },
          { id: 38, text: '未經許可深夜逗留在外',                                          options: FREQ4, sub: 'cd' },
          { id: 39, text: '曾離家出走',                                                    options: FREQ4, sub: 'cd' },
          { id: 40, text: '強迫他人進行性行為',                                            options: FREQ4, sub: 'cd' },
          { id: 41, text: '感到恐懼、焦慮或擔憂',                                          options: FREQ4, sub: 'anxiety' },
          { id: 42, text: '因怕犯錯而不敢嘗試新事物',                                      options: FREQ4, sub: 'anxiety' },
          { id: 43, text: '覺得自己沒用或低人一等',                                        options: FREQ4, sub: 'anxiety' },
          { id: 44, text: '過度自責或覺得有罪',                                            options: FREQ4, sub: 'anxiety' },
          { id: 45, text: '感到孤單、沒人愛，抱怨沒人喜歡自己',                            options: FREQ4, sub: 'anxiety' },
          { id: 46, text: '感到悲傷、不快樂或沮喪',                                        options: FREQ4, sub: 'anxiety' },
          { id: 47, text: '容易自卑或難為情',                                              options: FREQ4, sub: 'anxiety' }
        ]
      },
      {
        id: 'performance',
        label: '整體表現評估（第48–55題）',
        note: '請依「1=優秀」至「5=有嚴重問題」進行評分',
        questions: [
          { id: 48, text: '整體學業表現', options: PERF5, sub: 'performance' },
          { id: 49, text: '閱讀能力',     options: PERF5, sub: 'performance' },
          { id: 50, text: '寫作能力',     options: PERF5, sub: 'performance' },
          { id: 51, text: '數學能力',     options: PERF5, sub: 'performance' },
          { id: 52, text: '與父母關係',   options: PERF5, sub: 'performance' },
          { id: 53, text: '與兄弟姊妹關係', options: PERF5, sub: 'performance' },
          { id: 54, text: '與同儕關係',   options: PERF5, sub: 'performance' },
          { id: 55, text: '參與團體活動能力', options: PERF5, sub: 'performance' }
        ]
      }
    ],
    scoring: {
      type: 'vanderbilt',
      positiveThreshold: 2,
      symptomSubscales: [
        { id: 'inattention',   name: '注意力不集中', questionIds: [1,2,3,4,5,6,7,8,9],                              dsmRequired: 6 },
        { id: 'hyperactivity', name: '過動／衝動',   questionIds: [10,11,12,13,14,15,16,17,18],                     dsmRequired: 6 },
        { id: 'odd',           name: '對立反抗',     questionIds: [19,20,21,22,23,24,25,26],                        dsmRequired: 4 },
        { id: 'cd',            name: '品行障礙',     questionIds: [27,28,29,30,31,32,33,34,35,36,37,38,39,40],     dsmRequired: 3 },
        { id: 'anxiety',       name: '焦慮／憂鬱',  questionIds: [41,42,43,44,45,46,47],                            dsmRequired: 3 }
      ],
      performanceSubscale: {
        id: 'performance', name: '整體表現',
        questionIds: [48,49,50,51,52,53,54,55],
        impairmentThreshold: 4
      }
    }
  },

  // ─────────────────────────────────────────────
  // 6. Vanderbilt 教師版（43題）
  // ─────────────────────────────────────────────
  {
    id: 'vanderbilt_teacher',
    name: 'Vanderbilt 教師版',
    fullName: 'Vanderbilt ADHD 教師評估量表',
    description: '全面ADHD評估量表（教師版），評估兒童本學期的行為表現',
    category: 'ADHD評估（兒童）',
    estimatedMinutes: 15,
    criteria: { minAge: 6, maxAge: 18, roles: ['teacher'] },
    instructions: '以下問題請根據孩子自本學期開始的表現，選擇最符合的選項：',
    sections: [
      {
        id: 'symptoms',
        label: '症狀評估（第1–35題）',
        questions: [
          { id: 1,  text: '做學校功課時，無法注意細節或粗心犯錯',              options: FREQ4, sub: 'inattention' },
          { id: 2,  text: '在任務或遊戲活動中難以維持專注',                    options: FREQ4, sub: 'inattention' },
          { id: 3,  text: '與他直接說話時，感覺他沒在聽',                      options: FREQ4, sub: 'inattention' },
          { id: 4,  text: '無法遵循指示且無法完成學校課業（非因反抗行為或不理解）', options: FREQ4, sub: 'inattention' },
          { id: 5,  text: '難以規劃或組織任務與活動',                          options: FREQ4, sub: 'inattention' },
          { id: 6,  text: '避免、不喜歡或不願意開始需要持續動腦的任務（如課堂作業）', options: FREQ4, sub: 'inattention' },
          { id: 7,  text: '弄丟任務或活動所需的必需品（如作業簿、鉛筆、書本）',options: FREQ4, sub: 'inattention' },
          { id: 8,  text: '容易被外在刺激分心',                                options: FREQ4, sub: 'inattention' },
          { id: 9,  text: '在日常活動中忘東忘西',                              options: FREQ4, sub: 'inattention' },
          { id: 10, text: '座位上玩弄手腳、扭動或坐不安穩',                    options: FREQ4, sub: 'hyperactivity' },
          { id: 11, text: '在必須坐著的場合任意離開座位',                      options: FREQ4, sub: 'hyperactivity' },
          { id: 12, text: '在不當場合亂跑或過度爬高',                          options: FREQ4, sub: 'hyperactivity' },
          { id: 13, text: '難以安靜地參與休閒活動',                            options: FREQ4, sub: 'hyperactivity' },
          { id: 14, text: '像被馬達驅動般「一直動」，停不下來',                options: FREQ4, sub: 'hyperactivity' },
          { id: 15, text: '話很多，過度說話',                                  options: FREQ4, sub: 'hyperactivity' },
          { id: 16, text: '在問題還沒問完前就搶著回答',                        options: FREQ4, sub: 'hyperactivity' },
          { id: 17, text: '難以在排隊時等待輪流',                              options: FREQ4, sub: 'hyperactivity' },
          { id: 18, text: '打斷或干擾他人（如強行加入對話或遊戲）',            options: FREQ4, sub: 'hyperactivity' },
          { id: 19, text: '鬧脾氣、發脾氣',                                    options: FREQ4, sub: 'odd_cd' },
          { id: 20, text: '主動反抗或拒絕遵守大人的要求或規則',                options: FREQ4, sub: 'odd_cd' },
          { id: 21, text: '感到生氣或憤恨不平',                                options: FREQ4, sub: 'odd_cd' },
          { id: 22, text: '充滿惡意且懷恨報復',                                options: FREQ4, sub: 'odd_cd' },
          { id: 23, text: '霸凌、威脅或恐嚇他人',                              options: FREQ4, sub: 'odd_cd' },
          { id: 24, text: '主動發起肢體打架',                                  options: FREQ4, sub: 'odd_cd' },
          { id: 25, text: '為了獲取好處或逃避責任而撒謊（「騙取」財物或承諾）',options: FREQ4, sub: 'odd_cd' },
          { id: 26, text: '對人體格殘酷',                                      options: FREQ4, sub: 'odd_cd' },
          { id: 27, text: '偷竊有價值的物品',                                  options: FREQ4, sub: 'odd_cd' },
          { id: 28, text: '故意破壞他人財產',                                  options: FREQ4, sub: 'odd_cd' },
          { id: 29, text: '感到恐懼、焦慮或擔憂',                              options: FREQ4, sub: 'anxiety' },
          { id: 30, text: '容易難為情或感到羞恥',                              options: FREQ4, sub: 'anxiety' },
          { id: 31, text: '因怕犯錯而不敢嘗試新事物',                          options: FREQ4, sub: 'anxiety' },
          { id: 32, text: '覺得自己沒用或低人一等',                            options: FREQ4, sub: 'anxiety' },
          { id: 33, text: '過度自責或覺得有罪',                                options: FREQ4, sub: 'anxiety' },
          { id: 34, text: '感到孤單、沒人愛，抱怨沒人喜歡自己',                options: FREQ4, sub: 'anxiety' },
          { id: 35, text: '感到悲傷、不快樂或沮喪',                            options: FREQ4, sub: 'anxiety' }
        ]
      },
      {
        id: 'performance',
        label: '學業與行為表現評估（第36–43題）',
        note: '請依「1=優秀」至「5=有嚴重問題」進行評分',
        questions: [
          { id: 36, text: '閱讀表現',           options: PERF5, sub: 'performance' },
          { id: 37, text: '數學表現',           options: PERF5, sub: 'performance' },
          { id: 38, text: '寫作表現',           options: PERF5, sub: 'performance' },
          { id: 39, text: '與同儕關係',         options: PERF5, sub: 'performance' },
          { id: 40, text: '遵循規則與指示的能力', options: PERF5, sub: 'performance' },
          { id: 41, text: '干擾課堂行為',       options: PERF5, sub: 'performance' },
          { id: 42, text: '作業完成度',         options: PERF5, sub: 'performance' },
          { id: 43, text: '組織與規劃能力',     options: PERF5, sub: 'performance' }
        ]
      }
    ],
    scoring: {
      type: 'vanderbilt',
      positiveThreshold: 2,
      symptomSubscales: [
        { id: 'inattention',   name: '注意力不集中',    questionIds: [1,2,3,4,5,6,7,8,9],         dsmRequired: 6 },
        { id: 'hyperactivity', name: '過動／衝動',      questionIds: [10,11,12,13,14,15,16,17,18], dsmRequired: 6 },
        { id: 'odd_cd',        name: '對立反抗／品行障礙', questionIds: [19,20,21,22,23,24,25,26,27,28], dsmRequired: 4 },
        { id: 'anxiety',       name: '焦慮／憂鬱',      questionIds: [29,30,31,32,33,34,35],       dsmRequired: 3 }
      ],
      performanceSubscale: {
        id: 'performance', name: '學業與行為表現',
        questionIds: [36,37,38,39,40,41,42,43],
        impairmentThreshold: 4
      }
    }
  },

  // ─────────────────────────────────────────────
  // 7. 巴哈花精情緒自我評量表
  // ─────────────────────────────────────────────
  {
    id: 'bach',
    name: '巴哈花精情緒量表',
    fullName: '巴哈花精情緒自我評量表',
    description: '評估目前的情緒狀態，找出需要支持的情緒面向（共36題）',
    category: '情緒評估',
    estimatedMinutes: 10,
    criteria: { minAge: 18, maxAge: null, roles: ['self'] },
    instructions: '以下描述請依據您目前的狀態，選擇最符合的程度（1=完全不符合，5=非常符合）：',
    sections: [
      {
        id: 'fear',
        label: '恐懼類',
        questions: [
          { id: 1,  text: '巨大的驚嚇，超乎一般情況的恐懼',                                                       options: LIKERT5 },
          { id: 2,  text: '具體的害怕，例如怕坐飛機、怕面對人群、怕蜘蛛、怕上台',                                  options: LIKERT5 },
          { id: 3,  text: '怕控制不住自己的情緒，例如暴衝的行為、一吃就停不下來、忍不住一直買',                    options: LIKERT5 },
          { id: 4,  text: '不知道自己在害怕什麼，但就是會怕',                                                     options: LIKERT5 },
          { id: 5,  text: '一直擔心自己愛的家人受傷',                                                             options: LIKERT5 }
        ]
      },
      {
        id: 'uncertainty',
        label: '不確定類',
        questions: [
          { id: 6,  text: '對自己的決定沒自信，一直問別人意見',                                                   options: LIKERT5 },
          { id: 7,  text: '在兩個選擇裡左右搖擺，無法做決定',                                                     options: LIKERT5 },
          { id: 8,  text: '遇到挫折，仍然沈浸在挫敗感，難以前進',                                                 options: LIKERT5 },
          { id: 9,  text: '感覺絕望，認為未來不會有正向發展了',                                                   options: LIKERT5 },
          { id: 10, text: '光想到一件事，還沒做就已經累了、沒動力',                                               options: LIKERT5 },
          { id: 11, text: '心中有熱情，但不知道要把動力投注在哪個方向',                                           options: LIKERT5 }
        ]
      },
      {
        id: 'present',
        label: '對當下缺乏興趣類',
        questions: [
          { id: 12, text: '常常思緒飄走，專注力容易不在當下',                                                     options: LIKERT5 },
          { id: 13, text: '常常想到以前的事，思緒困在過往',                                                       options: LIKERT5 },
          { id: 14, text: '感覺悲傷',                                                                             options: LIKERT5 },
          { id: 15, text: '腦中重複想同一件事、同一句話、同一個場景，停不下來',                                    options: LIKERT5 },
          { id: 16, text: '沒有一件事可以讓自己心裡出現火花或心動，對大部分的事都沒感覺、沒興趣',                  options: LIKERT5 }
        ]
      },
      {
        id: 'loneliness',
        label: '孤獨類',
        questions: [
          { id: 17, text: '一直想要找別人講話',                                                                   options: LIKERT5 },
          { id: 18, text: '個性急躁、無法等待',                                                                   options: LIKERT5 },
          { id: 19, text: '不喜歡在人多的地方，面對群體不自在，只想要自己一個人做自己的事，但有時感到寂寞',        options: LIKERT5 }
        ]
      },
      {
        id: 'sensitivity',
        label: '過度敏感類',
        questions: [
          { id: 20, text: '表面輕鬆、沒什麼事，但煩惱與痛苦都藏在心底',                                           options: LIKERT5 },
          { id: 21, text: '難以說不，容易幫助別人而失去自我',                                                     options: LIKERT5 },
          { id: 22, text: '有憎恨、想要報復、比較、嫉妒、猜忌等情緒之一',                                         options: LIKERT5 },
          { id: 23, text: '生活上有轉變，但難以適應',                                                             options: LIKERT5 }
        ]
      },
      {
        id: 'despair',
        label: '絕望與沮喪類',
        questions: [
          { id: 24, text: '覺得自己不好看、或不乾淨、或常常懷疑自己是否被感染、懷疑自己有什麼疾病',               options: LIKERT5 },
          { id: 25, text: '通常很有自信，但有突發事件產生，突然沒有信心',                                         options: LIKERT5 },
          { id: 26, text: '常常覺得自己比較差，別人比較優秀，就裹足不前',                                         options: LIKERT5 },
          { id: 27, text: '身體不舒服仍然努力工作、或忙碌奔走，覺得生病很礙事',                                   options: LIKERT5 },
          { id: 28, text: '自責、責怪自己',                                                                       options: LIKERT5 },
          { id: 29, text: '發生任何創傷',                                                                         options: LIKERT5 },
          { id: 30, text: '痛苦超過了極限，心情極度折磨地生活著',                                                 options: LIKERT5 },
          { id: 31, text: '覺得上天對自己不好，或是命運的某個安排是在考驗自己',                                   options: LIKERT5 }
        ]
      },
      {
        id: 'overcare',
        label: '過度關注他人類',
        questions: [
          { id: 32, text: '容易看到他人的缺點，看別人時都看到不好的地方',                                         options: LIKERT5 },
          { id: 33, text: '用愛或為你好作為開場，希望對方按照自己的想法去行動',                                   options: LIKERT5 },
          { id: 34, text: '自己非常認同某一個價值觀或理念，就非常用力地說服別人也一起來相信，無法容忍不同陣線的人', options: LIKERT5 },
          { id: 35, text: '霸道地要求他人聽從自己的指令，不容許他人爭辯或反抗',                                   options: LIKERT5 },
          { id: 36, text: '對自己要求極高，嚴格規範自己的生活方式，壓抑個人需求與享受',                           options: LIKERT5 }
        ]
      }
    ],
    scoring: {
      type: 'bach',
      significantThreshold: 3,
      categoryLabels: {
        fear:        '恐懼類',
        uncertainty: '不確定類',
        present:     '對當下缺乏興趣類',
        loneliness:  '孤獨類',
        sensitivity: '過度敏感類',
        despair:     '絕望與沮喪類',
        overcare:    '過度關注他人類'
      }
    }
  }
];
