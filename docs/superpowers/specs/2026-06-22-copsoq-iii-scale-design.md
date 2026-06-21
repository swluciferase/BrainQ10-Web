# ScalarMynd — COPSOQ III 職場心理社會量表 設計文件

- **日期：** 2026-06-22
- **專案：** BrainQ10-Web (ScalarMynd) — `/Users/swryociao/BrainQ10-Web/`
- **版本影響：** v1.2 → **v1.3**（新增量表 = MINOR；同時加入 `APP_VERSION` 常數）
- **狀態：** 待 user 審閱

---

## 1. 目標

在 ScalarMynd 量表清單中，於**巴哈花精量表旁邊**（`scales.js` 陣列最後、bach 之後）新增 **COPSOQ III（哥本哈根職場心理社會問卷 第三版）**，支援**三種語言**（繁體中文 / 简体中文 / English）與**三種長度版本**（短版 / 中版 / 長版，預設中版、可自選）。報告採 COPSOQ 標準：各向度 **0–100 分** + **🔴 紅 / 🟡 黃 / 🟢 綠** 三區風險燈號。

---

## 2. 已鎖定的設計決策（來自 brainstorming 問答）

| # | 決策 | 選擇 |
|---|------|------|
| D1 | 長度版本 | **三種都放**（短/中/長），預設**中版**，問卷頁可自選 |
| D2 | 中文來源 | 官方台灣 C-COPSOQ III **不存在** → **依官方英文作台灣繁中譯本**（見 §3） |
| D3 | 計分呈現 | **COPSOQ 標準 0–100 + 紅黃綠**（新增 `copsoq` scoring type） |
| D4 | 題組範圍 | **只做核心心理社會向度**（不含選填模組、不含個人背景題） |
| D5 | Work Engagement | **移除 WE 向度**（UWES 商業授權限制，3ihc.nl） |
| D6 | 版號 | 加 `APP_VERSION` 常數；顯示版號 v1.2 → **v1.3** |

---

## 3. 語言來源與信效度聲明（重要）

研究（附帶來源）確認：

- **English** — 每題皆有官方逐字題目（COPSOQ International Network 指引 Annex 1）。
- **简体中文** — 每題皆有經同儕審查驗證的逐字題目（中國 COPSOQ III validation, *Healthcare* 2025, 13(7):825 補充檔 File S1）。
- **繁體中文（官方台灣）** — **整套 COPSOQ III 不存在**。台灣唯一驗證過的是 COPSOQ-II 衍生的**職場疲勞量表**（鄭雅文／葉婉榆 2008），僅涵蓋疲勞家族（個人疲勞 / 工作疲勞 / 服務對象疲勞）。

**繁中處理規則（D2）：**
1. 以**官方國際 COPSOQ III 英文題目為準**，撰寫**台灣語境**繁中（員工／主管／職務／同事，避免簡中用語如「劳动者／上级／岗位／工间休息」）。
2. **疲勞家族（BO）**直接採用台灣**職場疲勞量表**已驗證繁中用詞（如「您常覺得疲勞嗎？」「您常覺得情緒上心力交瘁嗎？」）。
3. 報告頁與量表卡需明確標示免責：**「繁中為本系統依官方英文之台灣譯本；除疲勞向度外，未經官方心理計量實證。本結果僅供參考，不構成診斷。」**
4. 简中用詞沿用 China validation 驗證版；但需修正 China 補充檔三處已知錯置（IN6 與 PR1 串行、RE1↔RE2、CO2↔CO3 互換）——以英文為真值對齊。

---

## 4. 納入範圍（向度清單）

採 COPSOQ III 標準 **per-item 版本標籤**（core / middle / long），巢狀規則：

- **短版 (short)** = 所有 `core` 題
- **中版 (middle)** = `core` + `middle` 題（**預設**）
- **長版 (long)** = `core` + `middle` + `long` 題（全部）

> 國際指引明訂 core 題為各國必備、單獨不構成短版；各國自訂短/中/長實際題數。本 app 採「短版=core」之務實定義。

**納入 6 大領域（scored 0–100）：**

| 領域 | 向度（slug）| 方向 | 高分=色 |
|------|------|------|------|
| **A 工作要求** | 量化要求 QD · 工作步調 WP · 認知要求 CD* · 情緒要求 ED · 隱藏情緒要求 HE | demand | 高=🔴 |
| **B 工作組織與內容** | 工作影響力 IN · 發展可能性 PD · 工作變化性 VA · 工時掌控 CT · 工作意義 MW | resource | 高=🟢 |
| **C 人際關係與領導** | 可預測性 PR · 認可 RE · 角色明確 CL · 角色衝突 CO · 不合理任務 IT · 領導品質 QL · 主管支持 SS · 同事支持 SC · 職場社群感 SW | 混合 | PR/RE/CL/QL/SS/SC/SW 高=🟢；CO/IT 高=🔴 |
| **D 工作—個人介面** | 職場承諾 CW · 工作不安全感 JI · 工作條件不安全感 IW · 工作品質 QW · 工作滿意 JS · 工作—生活衝突 WF | 混合 | CW/QW/JS 高=🟢；JI/IW/WF 高=🔴 |
| **E 社會資本** | 水平信任 TE · 垂直信任 TM · 組織公正 JU | resource | 高=🟢 |
| **G 健康與幸福** | 自評健康 GH · 睡眠困擾 SL · 職業倦怠 BO · 壓力 ST · 身體壓力 SO · 認知壓力 CS · 憂鬱症狀 DS | 混合 | GH 高=🟢；SL/BO/ST/SO/CS/DS 高=🔴 |

**\* 認知要求 CD 方向爭議：** 中國 validation 視為 demand（高=🔴）；國際上 CD 常被視中性。**本 app 採 demand 慣例**，報告加註腳說明此向度方向有爭議。

**排除（本次不做，可列為未來擴充）：**
- **F 冒犯行為**（流言/衝突/騷擾/霸凌/暴力）— 為「過去 12 個月暴露」類別題（categorical），不適用 0–100 + 三分位模型。
- **H 人格 — 自我效能 SE** — 屬人格特質、4 點量尺，非職場環境向度。
- **WE 工作投入**（D5，授權限制）。
- COPSOQ 選填模組與個人背景題（職業/性別/工時等，D4）。

---

## 5. 計分演算法（`copsoq` scoring type）

每題作答存 raw value `0..4`（5 點量尺）。

1. **反向題：** `s = rev ? (4 - v) : v`
2. **向度分 0–100：** `dim100 = mean(s over answered items in dim) / 4 * 100`，四捨五入整數。未作答題不計入分母。
3. **三區燈號（tertile heuristic）：**
   - **demand 向度**（高分=不利健康）：🟢 0–33.3 / 🟡 33.4–66.6 / 🔴 66.7–100
   - **resource 向度**（高分=有利健康）：🔴 0–33.3 / 🟡 33.4–66.6 / 🟢 66.7–100
   - 報告明標此為**固定三分位啟發式**，非官方母群三分位；附中國母群參考均值（見 §8）供比較。
4. **報告呈現：** 依 6 大領域分組，每向度一列：向度名 + 0–100 橫條（依燈號著色）+ 燈號徽章 + 該向度作答題數。領域標題顯示該領域平均。頂部摘要：最需關注（紅燈）向度數與清單。

> **無官方固定切點：** COPSOQ 網絡明示不採單一通用 cut-off；三分位由參考母群決定。本啟發式為可辯護的預設，已於報告標明。

---

## 6. 資料模型（`scales.js`）

於 `bach` 之後新增單一 `copsoq` scale 物件：

```js
{
  id: 'copsoq',
  name: 'COPSOQ III 職場量表',
  fullName: '哥本哈根職場心理社會問卷 第三版（COPSOQ III）',
  description: '評估職場心理社會工作環境（工作要求、組織、人際領導、身心健康等向度）',
  category: '職場健康',          // 新 category → 新 badge class
  estimatedMinutes: 15,          // 中版約 15 分；短版 ~7、長版 ~25（可依版本動態顯示）
  criteria: { minAge: 18, maxAge: null, roles: ['self'] },
  versioned: true,               // 新欄位：啟用版本選擇器
  defaultVersion: 'middle',
  versions: ['short', 'middle', 'long'],
  instructions: '以下問題請依您近期的實際工作狀況作答…',
  sections: [
    { id: 'demands', label: '工作要求', questions: [
      { id: 5001, dim: 'QD', lvl: 'core',   text: '由於時間不足，您無法完成所有工作任務的頻率是？', options: CO_FREQ, rev: false },
      // …
    ]},
    // … 其餘領域 sections
  ],
  scoring: {
    type: 'copsoq',
    dimensions: {
      QD: { name: '量化要求', domain: '工作要求', dir: 'demand' },
      // … 每向度 name/domain/dir
    },
    domainOrder: ['工作要求','工作組織與內容','人際關係與領導','工作—個人介面','社會資本','健康與幸福']
  }
}
```

**選項常數（value 0..4，報告/計分自控）：**
- `CO_FREQ`（頻率 RO1）：總是4 / 經常3 / 有時2 / 很少1 / 從不幾乎沒有0
- `CO_EXTENT`（程度 RO2）：程度非常大4 / 程度很大3 / 有些2 / 程度很小1 / 程度非常小0
- `CO_SAT`（滿意 RO6）：非常滿意4 / 滿意3 / 普通2 / 不滿意1 / 非常不滿意0
- `CO_HEALTH`（自評健康 RO7）：極佳4 / 非常好3 / 好2 / 普通1 / 差0
- `CO_RECENT`（近四週 RO9）：一直如此4 / 大部分時間3 / 部分時間2 / 一小部分時間1 / 完全沒有0

反向題以 `rev:true` 處理（不另設反向選項組）。每題的 `options` 對應其官方 RO 碼（見 §8 catalog 的 RO 欄）。

---

## 7. UI / 程式改動（`app.js`, `index.html`, `i18n-data.js`, `style.css`）

1. **版本選擇器（versioned scale）：** `renderQuestionnaire()` 開頭，若 `scale.versioned`，渲染一排晶片（短版 / **中版** / 長版），預設 `scale.defaultVersion`，狀態存 `S.copsoqVersion`。切換時清空作答並重渲染（含確認提示，避免誤清）。報告記錄所選版本。
2. **版本過濾：** `getAllQuestions(scale)` 改為版本感知 — `short`→`lvl==='core'`；`middle`→`lvl∈{core,middle}`；`long`→全部。問卷渲染、進度計算、計分均走過濾後集合。
3. **計分與報告：** score switch（app.js ~525）與 report switch（~445）新增 `copsoq` 分支：`computeCopsoq()` + `renderCopsoqReport()`（§5）。
4. **量表卡 badge：** `renderScaleCards()`（~142）新增 `category.includes('職場')` → `badge-work`（新 CSS class）。
5. **動態工時顯示：** 卡片/問卷顯示題數與預估時間依預設版本（卡片）/所選版本（問卷）。
6. **三語字串：** 所有新繁中字串（題目、向度名、領域名、報告 UI、燈號標籤、免責聲明）加入 `i18n-data.js` `window.SCALE_TR`，每筆含 `hans` + `en`。word-order 不同者用 `L3()`。
7. **版號：** `app.js` 頂部加 `const APP_VERSION = 'v1.3';`；`index.html` `<span class="meta-label">` 由 v1.2 → 由 `APP_VERSION` 帶入（或直接寫 v1.3）。

**慣例遵循：** 純前端、無後端、無 build step；事件用 `addEventListener`（無 inline onclick）；繁中為 source-of-truth，計分用 raw zh 邏輯。

---

## 8. 題目 Catalog（實作參考）

> **真值來源：** English = 官方 COPSOQ III 指引；简中 = 中國 validation 補充檔（已修正 §3.4 三處錯置）。**繁中於實作時依 §3 規則撰寫**，並經 §9 audit 逐題人工複核後才 ship。`lvl` = core/middle/long 版本標籤；`RO` = §6 選項組；`rev` = 反向題。完整逐題英文/简中表已存於本 session 研究輸出，實作時據以建檔。

各向度方向（dir）見 §4 表。每向度題目組成（題數，core/middle/long 分佈）摘要：

- **工作要求：** QD(core×2,middle×1,long×1) · WP(core×2,long×1) · CD(long×4) · ED(core×2,middle×1) · HE(middle×3,long×1)
- **工作組織：** IN(core×1,middle×3,long×2) · PD(core×2,middle×1) · VA(long×2) · CT(middle×4,long×1) · MW(core×1,middle×1)
- **人際領導：** PR(core×2) · RE(core×1,long×2) · CL(core×1,middle×2) · CO(core×2) · IT(middle×1) · QL(core×2,middle×1,long×1) · SS(core×1,middle×1,long×1) · SC(core×1,middle×1,long×1) · SW(core×1,middle×1,long×1)
- **工作—個人介面：** CW(long×5) · JI(core×2,long×1) · IW(core×1,middle×2,long×2) · QW(middle×1,long×1) · JS(core×1,middle×2,long×2) · WF(core×2,long×3)
- **社會資本：** TE(middle×1,long×2) · TM(core×2,middle×1,long×1) · JU(core×2,long×2)
- **健康與幸福（皆 long；BO 用台灣疲勞量表驗證繁中）：** GH×1（自評健康；0–10 階梯題 GH2 本次省略）· SL×4 · BO×4 · ST×3 · SO×4 · CS×4 · DS×4

**中國母群參考均值（建三分位/百分位比較用）：** QD 37.2, WP 58.9, CD 60.0, ED 43.5, HE 54.5, IN 44.7, PD 62.3, VA 40.1, CT 38.7, MW 72.0, PR 57.7, RE 62.9, CL 69.3, CO 47.7, IT 45.9, QL 58.7, SS 58.7, SC 62.0, SW 68.7, CW 62.9, JI 44.5, IW 50.4, QW 63.9, JS 61.8, WF 44.3, TE 60.8, TM 61.4, JU 61.5, GH —, SL 38.2, BO 37.1, ST 36.3, SO 26.7, CS 31.6, DS 28.6。

---

## 9. 測試與驗證（遵循 memory 強制規則）

- **計分單元驗證：** 以手算範例驗 0–100 轉換、反向題、三分位著色（demand vs resource 鏡像）、未作答題不計入分母。
- **版本切換：** 短/中/長題數正確過濾；切換清空作答；報告記錄版本。
- **三語 audit（強制）：** push 後 spawn `code-reviewer` subagent（**opus**），跑 headless Playwright 真實流程：三語各切換 → 開 COPSOQ → 選版本 → 作答 → 看報告 → 驗 DOM 文字非黏連、非殘留中文、燈號方向正確、免責聲明在位。**字串存在 ≠ 行為正確**，必跑 runtime 不可只 grep。
- **繁中逐題複核：** 由具臨床/語言判斷者（或 reviewer agent）逐題核對台灣語境與疲勞家族官方用詞。

---

## 10. 來源（研究實際擷取）

1. COPSOQ International Network — COPSOQ III Guidelines & questionnaire（Annex 1）：向度清單、英文逐字題、core/middle/long 標籤、RO 碼與 0–100、反向題規則。
2. China validation, *Healthcare* 2025 13(7):825, File S1 supplement（mdpi-res.com CDN）：简中逐字題、簡中選項錨點、`*`刪題標記。
3. 同文 BioC API（PMC11988307）：各向度 Positive Value（high/low）方向、參考均值/SD/題數。
4. Burr et al. 2019, PMC6933167：領域分組與 resource/demand 分類交叉驗證。
5. Swedish validation PMC7246423：確認無官方固定 cut-off。
6. NTU 碩論 doi:10.6342/NTU202003559：台灣**職場疲勞量表**（COPSOQ-II 疲勞家族）已驗證繁中用詞。

**已知資料缺口：** 官方台灣 COPSOQ III 繁中不存在（除疲勞家族）；CD 方向爭議；無官方數值切點。處理見 §3、§4*、§5。
