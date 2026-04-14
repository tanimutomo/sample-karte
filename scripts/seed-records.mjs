#!/usr/bin/env node
/**
 * 電子カルテ フルリセット＆シードスクリプト
 *
 * 全データ（ユーザー・患者・アレルギー・記録）を削除して再投入する。
 * サンプルプロジェクト用。いつでも `node scripts/seed-records.mjs` で
 * まっさらな状態からデモデータを復元できる。
 *
 * Usage: node scripts/seed-records.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cekhaptyinhciodgoaks.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2hhcHR5aW5oY2lvZGdvYWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYxNTc0NywiZXhwIjoyMDkxMTkxNzQ3fQ.SV_RW9S6Dn5RI1dBPIrAnTcDzLI7QyODWTvRAIy-F5Y";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- ユーザー定義 ----
const USERS = [
  { email: "doctor@example.com",  password: "password123", display_name: "山田 太郎", role: "doctor" },
  { email: "nurse@example.com",   password: "password123", display_name: "佐藤 花子", role: "nurse" },
  { email: "rehab@example.com",   password: "password123", display_name: "鈴木 一郎", role: "rehab" },
];

// ---- ユーザーIDは実行時に決まる ----
let DOCTOR, NURSE, REHAB;

// ---- 患者ID (固定) ----
const P1 = "a1111111-1111-1111-1111-111111111111"; // 田中太郎 70歳男 高血圧・狭心症疑い
const P2 = "a2222222-2222-2222-2222-222222222222"; // 佐藤花子 57歳女 上気道炎→肺炎疑い
const P3 = "a3333333-3333-3333-3333-333333333333"; // 鈴木一郎 83歳男 変形性膝関節症・脳梗塞既往
const P4 = "a4444444-4444-4444-4444-444444444444"; // 高橋美咲 46歳女 妊娠糖尿病
const P5 = "a5555555-5555-5555-5555-555555555555"; // 渡辺健二 50歳男 腰椎椎間板ヘルニア

// ---- 患者データ ----
const PATIENTS = [
  { id: P1, medical_record_number: "MRN-001", last_name: "田中", first_name: "太郎", last_name_kana: "タナカ", first_name_kana: "タロウ", date_of_birth: "1955-03-15", gender: "male", blood_type: "A", address: "東京都新宿区西新宿1-1-1", phone: "03-1234-5678", emergency_contact: "田中花子 (妻) 03-1234-5679", insurance_number: "12345678901" },
  { id: P2, medical_record_number: "MRN-002", last_name: "佐藤", first_name: "花子", last_name_kana: "サトウ", first_name_kana: "ハナコ", date_of_birth: "1968-07-22", gender: "female", blood_type: "B", address: "東京都渋谷区渋谷2-2-2", phone: "03-2345-6789", emergency_contact: "佐藤一郎 (夫) 03-2345-6790", insurance_number: "23456789012" },
  { id: P3, medical_record_number: "MRN-003", last_name: "鈴木", first_name: "一郎", last_name_kana: "スズキ", first_name_kana: "イチロウ", date_of_birth: "1942-11-03", gender: "male", blood_type: "O", address: "東京都品川区大崎3-3-3", phone: "03-3456-7890", emergency_contact: "鈴木美智子 (娘) 090-1111-2222", insurance_number: "34567890123" },
  { id: P4, medical_record_number: "MRN-004", last_name: "高橋", first_name: "美咲", last_name_kana: "タカハシ", first_name_kana: "ミサキ", date_of_birth: "1980-01-10", gender: "female", blood_type: "AB", address: "東京都目黒区目黒4-4-4", phone: "03-4567-8901", emergency_contact: "高橋健太 (夫) 090-3333-4444", insurance_number: "45678901234" },
  { id: P5, medical_record_number: "MRN-005", last_name: "渡辺", first_name: "健二", last_name_kana: "ワタナベ", first_name_kana: "ケンジ", date_of_birth: "1975-09-28", gender: "male", blood_type: "A", address: "東京都世田谷区三軒茶屋5-5-5", phone: "03-5678-9012", emergency_contact: "渡辺由美 (妻) 090-5555-6666", insurance_number: "56789012345" },
];

// ---- アレルギーデータ ----
const ALLERGIES = [
  { patient_id: P1, allergen: "ペニシリン", severity: "severe", reaction: "蕁麻疹・呼吸困難", notes: "2020年に確認" },
  { patient_id: P1, allergen: "アスピリン", severity: "moderate", reaction: "胃腸障害", notes: null },
  { patient_id: P2, allergen: "スギ花粉", severity: "mild", reaction: "鼻炎・くしゃみ", notes: "季節性" },
  { patient_id: P3, allergen: "ラテックス", severity: "moderate", reaction: "接触性皮膚炎", notes: null },
  { patient_id: P5, allergen: "セフェム系抗菌薬", severity: "severe", reaction: "アナフィラキシー", notes: "即時型アレルギー" },
];

function dt(month, day, hour, min = 0) {
  return `2026-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}T${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}:00+09:00`;
}
function d(month, day) {
  return `2026-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

async function insert(table, data) {
  // Supabase REST has a row limit per request, batch in chunks of 50
  for (let i = 0; i < data.length; i += 50) {
    const chunk = data.slice(i, i + 50);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      console.error(`  ✗ ${table} (rows ${i}-${i+chunk.length}): ${error.message}`);
      return false;
    }
  }
  console.log(`  ✓ ${table}: ${data.length} 件`);
  return true;
}

// =====================================================
// 全削除
// =====================================================

async function deleteAllData() {
  console.log("[1/2] 全テーブルのデータを削除");
  // 子テーブルから順に削除 (FK制約)
  const tables = ["instructions", "admissions", "documents", "orders", "prescriptions", "vitals", "progress_notes", "allergies", "patients", "profiles"];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) console.error(`  ✗ ${t}: ${error.message}`);
    else console.log(`  ✓ ${t}`);
  }
}

async function deleteAllUsers() {
  console.log("[2/2] 全ユーザーを削除");
  // Admin API で全ユーザーを取得して削除
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const body = await res.json();
  const users = body.users || body || [];
  for (const u of users) {
    const delRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
      method: "DELETE",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (delRes.ok) {
      console.log(`  ✓ ユーザー削除: ${u.email}`);
    } else {
      console.error(`  ✗ ユーザー削除失敗: ${u.email} (${delRes.status})`);
    }
  }
  if (users.length === 0) console.log("  (ユーザーなし)");
}

// =====================================================
// ユーザー・患者・アレルギー作成
// =====================================================

async function createUsers() {
  console.log("[ユーザー作成]");
  const ids = [];
  for (const u of USERS) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { display_name: u.display_name },
      }),
    });
    const data = await res.json();
    if (data.id) {
      ids.push(data.id);
      console.log(`  ✓ ${u.display_name} (${u.email}) → ${data.id}`);
      // profilesのroleを更新
      await supabase.from("profiles").update({ role: u.role }).eq("id", data.id);
    } else {
      console.error(`  ✗ ${u.email}: ${JSON.stringify(data)}`);
      ids.push(null);
    }
  }
  return ids;
}

// =====================================================
// データ生成
// =====================================================

function generateVitals() {
  const rows = [];

  // P1: 田中太郎 - 高血圧、入院14日間、1日2回測定
  for (let day = 1; day <= 14; day++) {
    const bp_s = 145 - day * 1.5 + (Math.random() * 6 - 3);
    const bp_d = 90 - day * 0.8 + (Math.random() * 4 - 2);
    rows.push({ patient_id: P1, body_temperature: +(36.2 + Math.random()*0.5).toFixed(1), blood_pressure_systolic: Math.round(bp_s), blood_pressure_diastolic: Math.round(bp_d), pulse: Math.round(74 + Math.random()*8 - 4), spo2: Math.round(96 + Math.random()*3), respiration_rate: Math.round(15 + Math.random()*3), consciousness_level: "清明", recorded_by: NURSE, recorded_at: dt(4, day, 6) });
    rows.push({ patient_id: P1, body_temperature: +(36.3 + Math.random()*0.4).toFixed(1), blood_pressure_systolic: Math.round(bp_s - 3), blood_pressure_diastolic: Math.round(bp_d - 2), pulse: Math.round(72 + Math.random()*8 - 4), spo2: Math.round(97 + Math.random()*2), respiration_rate: Math.round(14 + Math.random()*3), consciousness_level: "清明", recorded_by: NURSE, recorded_at: dt(4, day, 14) });
  }

  // P2: 佐藤花子 - 発熱→解熱の経過
  for (let day = 5; day <= 14; day++) {
    const temp = day <= 8 ? +(37.2 + Math.random()*0.8).toFixed(1) : +(36.3 + Math.random()*0.5).toFixed(1);
    rows.push({ patient_id: P2, body_temperature: temp, blood_pressure_systolic: Math.round(115 + Math.random()*10), blood_pressure_diastolic: Math.round(68 + Math.random()*8), pulse: Math.round(78 + (day<=8?8:0) + Math.random()*6 - 3), spo2: Math.round(day<=8 ? 95+Math.random()*2 : 97+Math.random()*2), respiration_rate: Math.round(day<=8 ? 18+Math.random()*3 : 15+Math.random()*2), consciousness_level: "清明", notes: day<=8 ? "咳嗽あり" : null, recorded_by: NURSE, recorded_at: dt(4, day, 6) });
  }

  // P3: 鈴木一郎 - 高齢者、やや高血圧
  for (let day = 1; day <= 14; day++) {
    rows.push({ patient_id: P3, body_temperature: +(36.0 + Math.random()*0.5).toFixed(1), blood_pressure_systolic: Math.round(150 + Math.random()*15 - 7), blood_pressure_diastolic: Math.round(88 + Math.random()*10 - 5), pulse: Math.round(66 + Math.random()*8 - 4), spo2: Math.round(95 + Math.random()*3), respiration_rate: Math.round(14 + Math.random()*3), consciousness_level: "清明", recorded_by: NURSE, recorded_at: dt(4, day, 6) });
  }

  // P4: 高橋美咲 - 妊婦、血圧正常範囲
  for (let day = 3; day <= 14; day++) {
    rows.push({ patient_id: P4, body_temperature: +(36.4 + Math.random()*0.4).toFixed(1), blood_pressure_systolic: Math.round(118 + Math.random()*10), blood_pressure_diastolic: Math.round(72 + Math.random()*8), pulse: Math.round(78 + Math.random()*6), spo2: Math.round(98 + Math.random()*2), respiration_rate: Math.round(16 + Math.random()*2), consciousness_level: "清明", recorded_by: NURSE, recorded_at: dt(4, day, 6) });
  }

  // P5: 渡辺健二 - 正常範囲
  for (let day = 1; day <= 14; day++) {
    rows.push({ patient_id: P5, body_temperature: +(36.3 + Math.random()*0.5).toFixed(1), blood_pressure_systolic: Math.round(128 + Math.random()*10 - 5), blood_pressure_diastolic: Math.round(80 + Math.random()*8 - 4), pulse: Math.round(76 + Math.random()*8 - 4), spo2: Math.round(97 + Math.random()*2), respiration_rate: Math.round(15 + Math.random()*3), consciousness_level: "清明", recorded_by: NURSE, recorded_at: dt(4, day, 6) });
  }

  return rows;
}

function generateProgressNotes() {
  const rows = [];

  // P1: 田中太郎 - 高血圧・狭心症の入院経過
  const p1notes = [
    { day:1, h:9, type:"doctor", s:"胸痛と息切れを主訴に来院。階段昇降時に増悪。", o:"BP 145/90, HR 80, 心音整・雑音なし。心電図:正常洞調律、ST変化なし。", a:"高血圧症の増悪、労作時狭心症の疑い。入院精査の方針。", p:"降圧剤増量（アムロジピン5mg→10mg）。心臓超音波・血液検査オーダー。" },
    { day:1, h:10, type:"nursing", s:"入院オリエンテーション実施。胸痛は安静で軽減とのこと。", o:"BT 36.4, BP 142/88, SpO2 97%。ADL自立。", a:"バイタル安定。安静指示の理解あり。", p:"バイタル3検/日。胸痛出現時は直ちに報告。安静度:病棟内フリー。" },
    { day:2, h:9, type:"doctor", s:"昨夜は胸痛なし。睡眠良好。", o:"BP 138/85, HR 76。血液検査:BNP 45pg/mL、トロポニンI 陰性。", a:"急性冠症候群は否定的。高血圧性心疾患の精査を継続。", p:"心エコー本日実施予定。降圧剤継続。" },
    { day:2, h:14, type:"rehab", s:"歩行時に息切れあるが、リハビリへの意欲高い。", o:"6分間歩行テスト:350m。Borg Scale 14。安静時HR 76→歩行後HR 98。", a:"軽度の運動耐容能低下。心肺機能リハビリの適応あり。", p:"段階的な有酸素運動プログラム開始。週5回実施。" },
    { day:3, h:9, type:"doctor", s:"体調良好。胸痛なし。", o:"BP 135/82, HR 74。心エコー:EF 58%、壁運動異常なし、弁膜症なし。", a:"心エコー正常範囲。冠動脈病変の精査が必要。", p:"冠動脈CTをオーダー。バイアスピリン追加。" },
    { day:3, h:10, type:"nursing", s:"食事は全量摂取。排便あり。", o:"BT 36.3, BP 133/80。表情明るい。", a:"全身状態良好。降圧効果あり。", p:"引き続き観察継続。冠動脈CT前の絶食指示を説明。" },
    { day:4, h:9, type:"doctor", s:"冠動脈CT施行。造影剤アレルギーなし。", o:"冠動脈CT:LAD#6に50%狭窄疑い。RCA、LCXは有意狭窄なし。", a:"LAD軽度狭窄あり。薬物療法で管理可能な範囲。", p:"循環器内科にコンサルト。薬物療法の最適化を検討。" },
    { day:5, h:9, type:"doctor", s:"循環器内科より回答あり。現時点でカテーテル検査の適応なし。", o:"BP 130/78, HR 72。自覚症状なし。", a:"薬物療法で経過観察の方針。退院に向けた調整を開始。", p:"退院後の外来フォロー計画を作成。生活指導実施。" },
    { day:5, h:15, type:"rehab", s:"歩行も楽になってきた。退院後も運動を続けたい。", o:"6分間歩行テスト:410m（入院時350m）。Borg Scale 12。", a:"運動耐容能の改善を認める。", p:"退院後の運動処方を作成。外来リハビリに移行予定。" },
    { day:6, h:9, type:"doctor", s:"体調良好。退院希望あり。", o:"BP 128/76, HR 70。全身状態良好。", a:"血圧コントロール良好。退院可能。", p:"明日退院。外来予約2週間後。紹介状作成。" },
    { day:6, h:10, type:"nursing", s:"退院指導実施。薬の飲み方、受診日を確認。", o:"退院指導パンフレット渡済。内服薬5日分処方確認。", a:"退院準備完了。自己管理への理解あり。", p:"明日退院。最終バイタル確認後、退院手続き。" },
    { day:7, h:8, type:"nursing", s:"退院当日。体調良好とのこと。", o:"BT 36.3, BP 126/74, HR 70, SpO2 99%。", a:"状態安定。退院基準を満たす。", p:"退院処理完了。外来フォローアップ2週間後。" },
    { day:9, h:10, type:"rehab", s:"外来リハビリ初回。体調良好。退院後も散歩を続けている。", o:"6分間歩行テスト:420m。Borg Scale 11。血圧130/78。", a:"運動耐容能は維持。自主トレの継続効果あり。", p:"外来リハビリプログラム継続。有酸素運動の強度を段階的に上げる。" },
    { day:10, h:10, type:"doctor", s:"退院後外来再診。胸痛なし。服薬も継続できている。", o:"BP 126/76, HR 68。血液検査:BNP 28pg/mL、LDL 102mg/dL。", a:"血圧・脂質ともに改善傾向。薬物療法の効果あり。", p:"現処方継続。次回は1ヶ月後。負荷心筋シンチを6ヶ月後に予定。" },
    { day:12, h:14, type:"rehab", s:"運動中の息切れはなくなった。自信がついてきた。", o:"6分間歩行テスト:440m。Borg Scale 10。HR安静72→運動92。", a:"運動耐容能のさらなる改善を認める。", p:"リハビリ頻度を週1回に減らし、自主管理中心へ移行。" },
    { day:13, h:9, type:"nursing", s:"外来受診時。自宅での血圧記録を持参。概ね130/80未満。", o:"BP 124/74。自己管理手帳確認。減塩食も継続中。", a:"自己管理良好。生活習慣の改善が定着。", p:"引き続き血圧手帳の記録を継続。次回外来で確認。" },
    { day:14, h:10, type:"doctor", s:"経過良好。胸痛の再発なし。減塩食と運動を継続中。", o:"BP 122/74, HR 66。心電図:正常洞調律、変化なし。", a:"安定した経過。外来フォロー間隔の延長を検討。", p:"外来を月1回に変更。心臓リハビリ外来は継続。半年後に負荷心筋シンチ。" },
  ];
  p1notes.forEach(n => rows.push({ patient_id: P1, note_type: n.type, subjective: n.s, objective: n.o, assessment: n.a, plan: n.p, created_by: n.type==="doctor"?DOCTOR:n.type==="nursing"?NURSE:REHAB, created_at: dt(4, n.day, n.h) }));

  // P2: 佐藤花子 - 上気道炎→肺炎疑い→回復
  const p2notes = [
    { day:5, h:11, type:"doctor", s:"3日前から咳と微熱。鼻水もある。", o:"BT 37.6, 咽頭発赤あり、肺音清。WBC 9800, CRP 1.5。", a:"急性上気道炎。", p:"対症療法開始。カロナール、トローチ処方。3日後に再診。" },
    { day:5, h:14, type:"nursing", s:"倦怠感あり。食欲低下。", o:"BT 37.8, SpO2 97%。水分摂取少量。", a:"発熱持続。脱水リスクあり。", p:"水分摂取を促す。体温4検開始。" },
    { day:6, h:8, type:"nursing", s:"咳が辛くて眠れなかった。", o:"BT 37.9, SpO2 96%。咳嗽頻回、湿性。", a:"症状やや増悪。SpO2低下傾向に注意。", p:"医師に報告。酸素準備。" },
    { day:6, h:9, type:"doctor", s:"咳が増悪し、痰が黄色くなった。", o:"BT 38.1, SpO2 96%。右下肺野にcrackles聴取。", a:"肺炎の合併を疑う。", p:"胸部X線オーダー。抗菌薬（アジスロマイシン）開始。" },
    { day:6, h:14, type:"doctor", s:"胸部X線結果確認。", o:"右下肺野に浸潤影あり。WBC 11200, CRP 4.8。", a:"市中肺炎（右下葉）。A-DROPスコア1（軽症）。", p:"抗菌薬継続。外来フォローで経過観察。悪化時は入院検討。" },
    { day:7, h:8, type:"nursing", s:"昨夜は咳で2回起きたが、前日よりは楽。", o:"BT 37.5, SpO2 97%。食事半量摂取。", a:"発熱は軽減傾向。食事摂取量を注視。", p:"水分・栄養摂取を促す。引き続き観察。" },
    { day:8, h:9, type:"doctor", s:"咳は残るが熱が下がってきた。食欲も回復。", o:"BT 37.0, SpO2 98%。肺音:crackles減少。CRP 2.1。", a:"改善傾向。抗菌薬の効果あり。", p:"抗菌薬5日間完遂予定。再度胸部X線を1週間後に。" },
    { day:9, h:8, type:"nursing", s:"よく眠れた。咳も減った。", o:"BT 36.7, SpO2 98%。食事全量摂取。", a:"回復順調。", p:"観察継続。退院に向けた指導開始。" },
    { day:10, h:9, type:"doctor", s:"体調良好。咳はほぼ消失。", o:"BT 36.5, SpO2 99%。肺音清。", a:"肺炎は治癒傾向。", p:"抗菌薬終了。1週間後に外来でX線フォロー。" },
    { day:10, h:10, type:"nursing", s:"退院希望あり。自宅でも安静にすると。", o:"全身状態良好。ADL自立。退院指導実施。", a:"退院基準を満たす。", p:"退院処理。外来予約1週間後。" },
    { day:14, h:10, type:"doctor", s:"外来再診。咳完全消失。体調良好。", o:"BT 36.4, SpO2 99%。胸部X線:浸潤影消失。CRP 0.2。", a:"肺炎治癒確認。", p:"治療終了。再発時は早めの受診を指導。" },
  ];
  p2notes.forEach(n => rows.push({ patient_id: P2, note_type: n.type, subjective: n.s, objective: n.o, assessment: n.a, plan: n.p, created_by: n.type==="doctor"?DOCTOR:n.type==="nursing"?NURSE:REHAB, created_at: dt(4, n.day, n.h) }));

  // P3: 鈴木一郎 - 膝OA + MSW介入
  const p3notes = [
    { day:1, h:10, type:"doctor", s:"左膝痛で歩行困難。3日前から急に悪化。", o:"左膝関節腫脹あり、ROM屈曲110度。X線:OA Grade III。", a:"変形性膝関節症の増悪。", p:"NSAIDs処方。リハビリ依頼。ヒアルロン酸注射を検討。" },
    { day:1, h:14, type:"nursing", s:"痛みで食事の姿勢がつらい。ベッド上で過ごしている。", o:"NRS 6/10（動作時）。氷嚢使用中。食事7割摂取。", a:"疼痛による活動性低下。", p:"疼痛時にロキソプロフェン使用。体位変換介助。" },
    { day:2, h:10, type:"rehab", s:"膝が痛くて歩くのがつらい。", o:"ROM:屈曲110度/伸展-5度。MMT:大腿四頭筋4/5。歩行器で10m歩行可。", a:"筋力低下あり。歩行補助具が必要。", p:"大腿四頭筋訓練、ROM訓練開始。週5回。" },
    { day:3, h:10, type:"doctor", s:"痛みは薬で少しマシ。", o:"左膝腫脹やや軽減。NRS 4/10。", a:"NSAIDsの効果あり。", p:"ヒアルロン酸関節内注射施行。2週間後に2回目。" },
    { day:4, h:10, type:"rehab", s:"注射後、少し楽になった気がする。", o:"ROM:屈曲115度に改善。歩行器で30m歩行可。", a:"可動域・歩行距離ともに改善。", p:"段階的に荷重訓練追加。" },
    { day:5, h:15, type:"msw", s:"退院後の生活が不安。一人暮らしで買い物にも困る。", o:"要介護1。娘は遠方で週1回訪問が限界。", a:"在宅サービスの導入が必要。", p:"ケアマネと連携。訪問介護・デイサービスの利用調整。" },
    { day:6, h:10, type:"rehab", s:"歩行が安定してきた。", o:"歩行器で50m歩行可。階段は手すり使用で昇降可。", a:"ADLの改善を認める。", p:"退院に向けた自主トレーニング指導。" },
    { day:7, h:10, type:"doctor", s:"膝の痛みはだいぶ良くなった。", o:"NRS 2/10。ROM屈曲120度。歩行安定。", a:"症状改善。退院可能と判断。", p:"退院後は外来リハビリ週2回。NSAIDs継続。" },
    { day:7, h:14, type:"msw", s:"ケアマネとの面談完了。サービス開始日決定。", o:"訪問介護週3回、デイサービス週2回で調整済み。", a:"退院後の生活支援体制が整った。", p:"退院日にケアマネ同席でサービス内容最終確認。" },
    { day:8, h:9, type:"nursing", s:"退院準備完了。本人も安心している様子。", o:"バイタル安定。歩行器で自立歩行可。", a:"退院基準を満たす。", p:"退院処理。外来2週間後。" },
    { day:8, h:10, type:"doctor", s:"退院日。状態安定。", o:"BP 148/86, HR 68。左膝NRS 2/10。", a:"退院サマリーを作成。", p:"外来リハビリ継続。ヒアルロン酸2回目は外来で。" },
    { day:10, h:10, type:"doctor", s:"外来初回再診。退院後の経過良好。膝の痛みは軽度。", o:"NRS 1-2/10。ROM屈曲122度。歩行器で安定歩行。", a:"改善傾向維持。在宅サービスも順調に利用。", p:"NSAIDs継続。ヒアルロン酸2回目を本日施行。" },
    { day:10, h:14, type:"msw", s:"在宅サービスの利用状況を電話確認。ケアマネより順調との報告。", o:"訪問介護・デイサービスとも問題なく利用中。本人の満足度高い。", a:"退院後の在宅支援体制は機能している。", p:"1ヶ月後にモニタリング。必要時サービス内容を見直し。" },
    { day:11, h:10, type:"rehab", s:"外来リハビリ2回目。自宅での自主トレも続けている。", o:"ROM屈曲123度。歩行器で屋外歩行200m可。階段昇降安定。", a:"筋力・歩行能力ともに改善傾向。", p:"T字杖への移行を開始。バランス訓練を追加。" },
    { day:13, h:10, type:"nursing", s:"外来受診時。薬の管理は娘がサポートしてくれている。", o:"バイタル安定。服薬コンプライアンス良好。転倒なし。", a:"在宅での自己管理体制が整っている。", p:"引き続き服薬管理の確認。転倒予防の注意喚起。" },
    { day:14, h:10, type:"rehab", s:"外来リハビリ。自宅での生活は概ね問題なし。", o:"ROM屈曲125度。MMT大腿四頭筋4+/5。T字杖歩行自立。", a:"回復順調。在宅生活に適応。", p:"リハビリ頻度を週1回に減らし、自主トレ中心へ移行。" },
  ];
  p3notes.forEach(n => rows.push({ patient_id: P3, note_type: n.type, subjective: n.s, objective: n.o, assessment: n.a, plan: n.p, created_by: n.type==="doctor"?DOCTOR:n.type==="nursing"?NURSE:n.type==="msw"?REHAB:REHAB, created_at: dt(4, n.day, n.h) }));

  // P4: 高橋美咲 - 妊娠糖尿病の管理
  const p4notes = [
    { day:3, h:10, type:"doctor", s:"妊娠28週。健診で血糖高値を指摘。口渇あり。", o:"随時血糖 180mg/dL, HbA1c 6.2%。胎児発育正常。", a:"妊娠糖尿病（GDM）。", p:"栄養指導依頼。SMBG開始（4検/日）。2週間後再診。" },
    { day:3, h:14, type:"nursing", s:"血糖測定が不安。食事制限が辛い。", o:"SMBG手技確認済み。指導パンフレット配布。", a:"自己管理への不安あり。", p:"SMBG手技の再確認。栄養士面談を調整。" },
    { day:4, h:10, type:"doctor", s:"OGTT施行。空腹時92、1h 190、2h 162。", o:"75gOGTT:空腹時92、1h 190、2h 162mg/dL（2項目以上陽性）。", a:"GDM確定。食事療法から開始。", p:"分割食（6回/日）指導。1週間後の血糖推移を確認。" },
    { day:5, h:9, type:"nursing", s:"分割食を始めた。少し慣れてきた。", o:"SMBG値:朝食前95、朝食後135、昼食前88、昼食後140。", a:"食後血糖がやや高め。食事内容の見直しが必要。", p:"栄養士と食事内容を再確認。" },
    { day:7, h:10, type:"doctor", s:"食事療法で頑張っているが、食後血糖が高い。", o:"SMBG直近3日平均:食前90、食後2h 148mg/dL。目標120未満に対し高値。", a:"食事療法のみではコントロール不十分。", p:"インスリン導入を開始（超速効型、毎食前4単位）。" },
    { day:8, h:9, type:"nursing", s:"インスリン注射は怖かったが、やってみたら大丈夫だった。", o:"インスリン自己注射手技確認済み。注射部位ローテーション指導。", a:"自己注射の手技獲得良好。", p:"低血糖症状の教育。ブドウ糖を常備するよう指導。" },
    { day:9, h:10, type:"doctor", s:"インスリン開始後、血糖が安定してきた。", o:"SMBG:食前85、食後2h 115mg/dL。胎動正常。", a:"血糖コントロール改善。", p:"現処方継続。NST（胎児心拍モニタリング）実施。" },
    { day:10, h:10, type:"nursing", s:"体調良い。赤ちゃんも元気に動いている。", o:"NST:reactive pattern。胎動カウント正常。", a:"母子ともに良好。", p:"毎日の胎動カウント継続。次回受診は1週間後。" },
    { day:11, h:10, type:"doctor", s:"血糖安定。体重増加も適正範囲。", o:"体重+0.3kg/週（適正）。SMBG良好。超音波:胎児推定体重1200g（28w相当）。", a:"GDM管理良好。胎児発育正常。", p:"現治療継続。32週で再度超音波。" },
    { day:12, h:9, type:"nursing", s:"自己管理にも慣れてきた。退院後も頑張れそう。", o:"SMBG記録を確認。全て目標範囲内。", a:"自己管理能力十分。外来管理に移行可能。", p:"退院後のSMBG・インスリン管理のまとめ指導。" },
    { day:13, h:10, type:"doctor", s:"管理良好。外来フォローに移行。", o:"SMBG 3日間平均:食前82、食後2h 110。HbA1c 5.8%。", a:"血糖コントロール良好。外来管理へ。", p:"週1回の外来受診。分娩は37-38週を目標。" },
  ];
  p4notes.forEach(n => rows.push({ patient_id: P4, note_type: n.type, subjective: n.s, objective: n.o, assessment: n.a, plan: n.p, created_by: n.type==="doctor"?DOCTOR:n.type==="nursing"?NURSE:REHAB, created_at: dt(4, n.day, n.h) }));

  // P5: 渡辺健二 - 腰椎ヘルニア
  const p5notes = [
    { day:1, h:11, type:"doctor", s:"1週間前から腰痛と左下肢のしびれ。前屈で増悪。", o:"SLR test陽性(左30度)。左L5領域知覚低下。MRI:L4/5ヘルニア。", a:"腰椎椎間板ヘルニア(L4/5)。神経根症状あり。", p:"保存的治療開始。NSAIDs+プレガバリン処方。リハビリ依頼。" },
    { day:2, h:14, type:"rehab", s:"腰を反らすと楽になる。座っていると痛い。", o:"体幹伸展で症状改善。McKenzie評価:Derangement syndrome。", a:"伸展系エクササイズが有効。", p:"McKenzie法伸展エクササイズ指導。姿勢指導。" },
    { day:3, h:9, type:"doctor", s:"薬を飲んでいるが、しびれがまだ強い。", o:"NRS 6/10（左下肢）。SLR 35度。", a:"症状改善不十分。神経ブロック注射を検討。", p:"硬膜外神経ブロック注射を予約。" },
    { day:3, h:14, type:"nursing", s:"座っているのが辛く、食事も横になって食べたい。", o:"体動時にNRS増悪。安静時NRS 3/10。", a:"日常生活動作に支障あり。", p:"クッション使用で座位の工夫。食事時の体位調整。" },
    { day:4, h:10, type:"doctor", s:"神経ブロック注射施行。", o:"L4/5レベル左側に硬膜外ブロック施行。施行後30分でNRS 3/10に改善。", a:"ブロック注射の即時効果あり。", p:"安静後に離床。効果持続を観察。" },
    { day:5, h:14, type:"rehab", s:"注射後、だいぶ楽。リハビリも頑張れる。", o:"SLR 50度に改善。体幹伸展ROM改善。10分間歩行可。", a:"神経症状の改善を認める。", p:"コアスタビリティトレーニング追加。" },
    { day:6, h:9, type:"doctor", s:"しびれが軽減。腰痛は少し残る。", o:"SLR 55度。筋力低下なし。NRS 3/10。", a:"保存的治療の効果あり。継続。", p:"リハビリ継続。2回目のブロック注射を1週間後に予定。" },
    { day:7, h:14, type:"rehab", s:"自主トレも毎日やっている。痛みが減った。", o:"体幹筋力向上。プランク30秒保持可。歩行30分可。", a:"順調に回復。", p:"自主トレメニューを更新。負荷を段階的に増加。" },
    { day:8, h:9, type:"nursing", s:"夜間の痛みはなくなった。よく眠れている。", o:"NRS 2/10。食事全量摂取。表情明るい。", a:"疼痛コントロール良好。", p:"退院に向けた自己管理指導。" },
    { day:9, h:10, type:"doctor", s:"回復順調。退院希望。", o:"SLR 60度。NRS 1-2/10。ADL自立。", a:"退院可能。外来フォローへ移行。", p:"退院。外来リハビリ週2回。2週間後に再診。4週後MRI再検。" },
    { day:9, h:14, type:"rehab", s:"退院前最終評価。自宅での自主トレに自信あり。", o:"体幹筋力4+/5。歩行1km可。デスクワーク30分可。", a:"職場復帰に向けた体力は回復。", p:"職場復帰プログラム作成。段階的に座位時間を延長。" },
    { day:10, h:14, type:"rehab", s:"外来リハビリ初回。自宅でも自主トレを続けている。", o:"SLR 65度。体幹筋力良好。プランク45秒保持可。歩行1.5km可。", a:"退院後も順調に回復が進んでいる。", p:"コアトレーニングの負荷を増加。座位持続時間を段階的に延長。" },
    { day:11, h:9, type:"doctor", s:"2回目の神経ブロック注射のため来院。しびれはほぼ消失。", o:"SLR 65度。NRS 1/10。左L5領域の知覚低下は改善。", a:"保存的治療の効果が持続。2回目のブロック注射は見送り可能。", p:"ブロック注射は保留。薬物療法とリハビリを継続。プレガバリン漸減を検討。" },
    { day:12, h:14, type:"rehab", s:"外来リハビリ2回目。デスクワークも少しずつ再開。", o:"座位60分持続可。腰痛の増悪なし。体幹伸展ROM正常化。", a:"職場復帰プログラムは順調に進行中。", p:"第2週のプログラム（6時間勤務）への移行を許可。" },
    { day:13, h:9, type:"nursing", s:"外来受診時。職場復帰初週を終えて問題なし。", o:"NRS 0-1/10。睡眠良好。食事全量摂取。表情明るい。", a:"疼痛コントロール維持。日常生活の質が向上。", p:"服薬管理の確認。プレガバリン漸減時の注意点を指導。" },
    { day:14, h:10, type:"doctor", s:"外来再診。腰痛ほぼなし。仕事にも復帰。", o:"SLR 70度。NRS 0-1/10。日常生活に支障なし。", a:"症状改善。保存的治療成功。", p:"MRI再検予約。リハビリ頻度を週1回に。プレガバリン漸減開始。" },
  ];
  p5notes.forEach(n => rows.push({ patient_id: P5, note_type: n.type, subjective: n.s, objective: n.o, assessment: n.a, plan: n.p, created_by: n.type==="doctor"?DOCTOR:n.type==="nursing"?NURSE:REHAB, created_at: dt(4, n.day, n.h) }));

  return rows;
}

function generatePrescriptions() {
  const rows = [];

  // P1: 田中太郎
  const p1rx = [
    { name:"アムロジピン錠10mg", dosage:"1", unit:"錠", freq:"1日1回朝食後", route:"oral", start:d(4,1), notes:"5mgから増量", day:1 },
    { name:"バイアスピリン錠100mg", dosage:"1", unit:"錠", freq:"1日1回朝食後", route:"oral", start:d(4,3), day:3 },
    { name:"アトルバスタチン錠10mg", dosage:"1", unit:"錠", freq:"1日1回夕食後", route:"oral", start:d(4,3), notes:"LDL高値のため", day:3 },
    { name:"ニトログリセリン舌下錠0.3mg", dosage:"1", unit:"錠", freq:"胸痛発作時", route:"oral", start:d(4,1), notes:"頓用", day:1 },
    { name:"酸化マグネシウム錠330mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,2), end:d(4,7), notes:"便秘時", day:2 },
    { name:"ゾルピデム錠5mg", dosage:"1", unit:"錠", freq:"不眠時", route:"oral", start:d(4,1), end:d(4,7), notes:"頓用", day:1 },
    { name:"ヘパリンナトリウム注射液", dosage:"5000", unit:"単位", freq:"12時間毎", route:"iv", start:d(4,1), end:d(4,3), notes:"DVT予防", day:1 },
    { name:"ランソプラゾールOD錠15mg", dosage:"1", unit:"錠", freq:"1日1回朝食前", route:"oral", start:d(4,3), notes:"バイアスピリン併用のため", day:3 },
    { name:"カルベジロール錠2.5mg", dosage:"1", unit:"錠", freq:"1日1回朝食後", route:"oral", start:d(4,5), notes:"心保護目的", day:5 },
    { name:"ニコランジル錠5mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,4), notes:"冠拡張目的", day:4 },
    { name:"エゼチミブ錠10mg", dosage:"1", unit:"錠", freq:"1日1回夕食後", route:"oral", start:d(4,10), notes:"LDL目標未達のため追加", day:10 },
    { name:"カルベジロール錠5mg", dosage:"1", unit:"錠", freq:"1日1回朝食後", route:"oral", start:d(4,10), notes:"2.5mgから増量", day:10 },
    { name:"酸化マグネシウム錠330mg", dosage:"1", unit:"錠", freq:"1日2回朝夕食後", route:"oral", start:d(4,12), notes:"便秘再発のため再開", day:12 },
  ];
  p1rx.forEach(r => rows.push({ patient_id: P1, medication_name: r.name, dosage: r.dosage, unit: r.unit, frequency: r.freq, route: r.route, start_date: r.start, end_date: r.end||null, notes: r.notes||null, prescribed_by: DOCTOR, created_at: dt(4, r.day, 9, 30) }));

  // P2: 佐藤花子
  const p2rx = [
    { name:"カロナール錠500mg", dosage:"1", unit:"錠", freq:"発熱時 1日3回まで", route:"oral", start:d(4,5), end:d(4,12), day:5 },
    { name:"SPトローチ", dosage:"1", unit:"個", freq:"1日4回", route:"oral", start:d(4,5), end:d(4,12), day:5 },
    { name:"アジスロマイシン錠250mg", dosage:"2", unit:"錠", freq:"1日1回（初日500mg、2-5日目250mg）", route:"oral", start:d(4,6), end:d(4,10), notes:"肺炎に対して", day:6 },
    { name:"カルボシステイン錠500mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,6), end:d(4,14), notes:"去痰", day:6 },
    { name:"デキストロメトルファン錠15mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,5), end:d(4,10), notes:"鎮咳", day:5 },
    { name:"トラネキサム酸錠250mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,5), end:d(4,10), notes:"咽頭炎に対して", day:5 },
    { name:"ツロブテロールテープ2mg", dosage:"1", unit:"枚", freq:"1日1回（胸部に貼付）", route:"topical", start:d(4,6), end:d(4,10), notes:"気管支拡張", day:6 },
    { name:"アンブロキソール錠15mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,7), end:d(4,14), notes:"気道分泌促進", day:7 },
    { name:"OS-1（経口補水液）", dosage:"500", unit:"mL", freq:"1日2本", route:"oral", start:d(4,6), end:d(4,9), notes:"脱水予防", day:6 },
    { name:"ロキソプロフェン錠60mg", dosage:"1", unit:"錠", freq:"頭痛時", route:"oral", start:d(4,5), end:d(4,10), notes:"頓用", day:5 },
    { name:"カルボシステイン錠250mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,10), end:d(4,14), notes:"500mgから減量。退院後処方", day:10 },
    { name:"麦門冬湯エキス顆粒", dosage:"1", unit:"包", freq:"1日3回毎食前", route:"oral", start:d(4,11), end:d(4,21), notes:"乾性咳嗽の残存に対して", day:11 },
    { name:"肺炎球菌ワクチン（PPSV23）", dosage:"1", unit:"回", freq:"単回", route:"sc", start:d(4,14), notes:"肺炎再発予防。外来再診時に接種", day:14 },
  ];
  p2rx.forEach(r => rows.push({ patient_id: P2, medication_name: r.name, dosage: r.dosage, unit: r.unit, frequency: r.freq, route: r.route, start_date: r.start, end_date: r.end||null, notes: r.notes||null, prescribed_by: DOCTOR, created_at: dt(4, r.day, 11, 30) }));

  // P3: 鈴木一郎
  const p3rx = [
    { name:"ロキソプロフェン錠60mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,1), end:d(4,21), notes:"膝痛", day:1 },
    { name:"レバミピド錠100mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,1), end:d(4,21), notes:"胃粘膜保護", day:1 },
    { name:"ヒアルロン酸ナトリウム関節注25mg", dosage:"1", unit:"回", freq:"週1回", route:"other", start:d(4,3), notes:"左膝関節内注射", day:3 },
    { name:"エルデカルシトールカプセル0.75μg", dosage:"1", unit:"カプセル", freq:"1日1回朝食後", route:"oral", start:d(4,1), notes:"骨粗鬆症予防", day:1 },
    { name:"アムロジピン錠5mg", dosage:"1", unit:"錠", freq:"1日1回朝食後", route:"oral", start:d(4,1), notes:"高血圧", day:1 },
    { name:"センノシド錠12mg", dosage:"1", unit:"錠", freq:"便秘時就寝前", route:"oral", start:d(4,1), end:d(4,8), notes:"頓用", day:1 },
    { name:"モーラステープ20mg", dosage:"1", unit:"枚", freq:"1日1回（左膝に貼付）", route:"topical", start:d(4,1), end:d(4,14), notes:"消炎鎮痛", day:1 },
    { name:"プレガバリンOD錠25mg", dosage:"1", unit:"錠", freq:"1日2回朝夕", route:"oral", start:d(4,2), end:d(4,8), notes:"膝関節周囲の神経痛に", day:2 },
    { name:"メコバラミン錠500μg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,2), notes:"末梢神経障害に", day:2 },
    { name:"リマプロストアルファデクス錠5μg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,3), notes:"血流改善", day:3 },
    { name:"セレコキシブ錠100mg", dosage:"1", unit:"錠", freq:"1日2回朝夕食後", route:"oral", start:d(4,8), notes:"ロキソプロフェンから変更。胃腸負担軽減", day:8 },
    { name:"ヒアルロン酸ナトリウム関節注25mg", dosage:"1", unit:"回", freq:"週1回", route:"other", start:d(4,10), notes:"左膝関節内注射（2回目）", day:10 },
    { name:"ラフチジン錠10mg", dosage:"1", unit:"錠", freq:"1日2回朝夕食前", route:"oral", start:d(4,10), notes:"NSAIDs長期使用に伴う胃粘膜保護の強化", day:10 },
    { name:"牛車腎気丸エキス顆粒", dosage:"1", unit:"包", freq:"1日3回毎食前", route:"oral", start:d(4,13), notes:"下肢冷感・しびれに対して", day:13 },
  ];
  p3rx.forEach(r => rows.push({ patient_id: P3, medication_name: r.name, dosage: r.dosage, unit: r.unit, frequency: r.freq, route: r.route, start_date: r.start, end_date: r.end||null, notes: r.notes||null, prescribed_by: DOCTOR, created_at: dt(4, r.day, 10, 30) }));

  // P4: 高橋美咲
  const p4rx = [
    { name:"インスリン アスパルト（ノボラピッド）", dosage:"4", unit:"単位", freq:"毎食前", route:"sc", start:d(4,7), notes:"スライディングスケール対応", day:7 },
    { name:"葉酸錠5mg", dosage:"1", unit:"錠", freq:"1日1回", route:"oral", start:d(4,3), notes:"妊娠中の補充", day:3 },
    { name:"鉄剤（フェロミア錠50mg）", dosage:"1", unit:"錠", freq:"1日2回朝夕食後", route:"oral", start:d(4,3), notes:"妊娠性貧血予防", day:3 },
    { name:"酸化マグネシウム錠330mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,5), notes:"便秘に対して", day:5 },
    { name:"メトクロプラミド錠5mg", dosage:"1", unit:"錠", freq:"嘔気時", route:"oral", start:d(4,3), end:d(4,10), notes:"つわり症状に頓用", day:3 },
    { name:"カルシウム製剤（乳酸カルシウム錠）", dosage:"2", unit:"錠", freq:"1日1回", route:"oral", start:d(4,3), notes:"カルシウム補充", day:3 },
    { name:"ビタミンD製剤", dosage:"1", unit:"錠", freq:"1日1回", route:"oral", start:d(4,3), notes:"カルシウム吸収促進", day:3 },
    { name:"SMBG測定チップ", dosage:"4", unit:"枚", freq:"1日4回", route:"other", start:d(4,3), notes:"血糖自己測定用", day:3 },
    { name:"インスリン注射針（ナノパスニードルII）", dosage:"4", unit:"本", freq:"1日4回", route:"other", start:d(4,7), notes:"インスリン注射用", day:7 },
    { name:"ブドウ糖10g", dosage:"1", unit:"包", freq:"低血糖時", route:"oral", start:d(4,7), notes:"低血糖時の補食用", day:7 },
    { name:"インスリン アスパルト（ノボラピッド）", dosage:"6", unit:"単位", freq:"毎食前", route:"sc", start:d(4,11), notes:"4単位から6単位に増量。体重増加に伴う調整", day:11 },
    { name:"酸化マグネシウム錠500mg", dosage:"1", unit:"錠", freq:"1日2回朝夕食後", route:"oral", start:d(4,12), notes:"鉄剤による便秘増悪のため増量", day:12 },
    { name:"クエン酸鉄錠50mg", dosage:"1", unit:"錠", freq:"1日1回夕食後", route:"oral", start:d(4,13), notes:"フェロミアから変更。消化器症状軽減のため", day:13 },
  ];
  p4rx.forEach(r => rows.push({ patient_id: P4, medication_name: r.name, dosage: r.dosage, unit: r.unit, frequency: r.freq, route: r.route, start_date: r.start, end_date: r.end||null, notes: r.notes||null, prescribed_by: DOCTOR, created_at: dt(4, r.day, 10, 30) }));

  // P5: 渡辺健二
  const p5rx = [
    { name:"ロキソプロフェン錠60mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,1), end:d(4,28), day:1 },
    { name:"レバミピド錠100mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,1), end:d(4,28), notes:"胃粘膜保護", day:1 },
    { name:"プレガバリンカプセル75mg", dosage:"1", unit:"カプセル", freq:"1日2回朝夕食後", route:"oral", start:d(4,1), notes:"神経痛に対して", day:1 },
    { name:"エペリゾン塩酸塩錠50mg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,1), end:d(4,14), notes:"筋弛緩", day:1 },
    { name:"リドカインテープ", dosage:"1", unit:"枚", freq:"1日1回（腰部に貼付）", route:"topical", start:d(4,1), end:d(4,14), notes:"局所鎮痛", day:1 },
    { name:"トラマドール塩酸塩錠25mg", dosage:"1", unit:"錠", freq:"疼痛時 1日4回まで", route:"oral", start:d(4,1), end:d(4,7), notes:"頓用。眠気に注意", day:1 },
    { name:"メコバラミン錠500μg", dosage:"1", unit:"錠", freq:"1日3回毎食後", route:"oral", start:d(4,1), notes:"末梢神経修復", day:1 },
    { name:"セレコキシブ錠100mg", dosage:"1", unit:"錠", freq:"1日2回朝夕食後", route:"oral", start:d(4,5), end:d(4,28), notes:"ロキソプロフェンから変更", day:5 },
    { name:"デュロキセチンカプセル20mg", dosage:"1", unit:"カプセル", freq:"1日1回朝食後", route:"oral", start:d(4,6), notes:"慢性疼痛に対して", day:6 },
    { name:"ゾルピデム錠5mg", dosage:"1", unit:"錠", freq:"不眠時", route:"oral", start:d(4,2), end:d(4,9), notes:"頓用。疼痛による不眠に", day:2 },
    { name:"プレガバリンカプセル50mg", dosage:"1", unit:"カプセル", freq:"1日2回朝夕食後", route:"oral", start:d(4,14), notes:"75mgから漸減（50mg）", day:14 },
    { name:"芍薬甘草湯エキス顆粒", dosage:"1", unit:"包", freq:"筋痙攣時", route:"oral", start:d(4,10), notes:"下肢こむら返りに対して頓用", day:10 },
    { name:"ロキソプロフェン錠60mg", dosage:"1", unit:"錠", freq:"疼痛時 1日3回まで", route:"oral", start:d(4,10), end:d(4,28), notes:"退院後処方。常用から頓用に変更", day:10 },
  ];
  p5rx.forEach(r => rows.push({ patient_id: P5, medication_name: r.name, dosage: r.dosage, unit: r.unit, frequency: r.freq, route: r.route, start_date: r.start, end_date: r.end||null, notes: r.notes||null, prescribed_by: DOCTOR, created_at: dt(4, r.day, 11, 30) }));

  return rows;
}

function generateOrders() {
  const rows = [];

  // P1
  const p1o = [
    { type:"lab", title:"血液検査（CBC・生化学・BNP・トロポニン）", detail:"心不全マーカー、心筋逸脱酵素の確認。", status:"completed", day:1, h:9, comp_day:1, comp_h:11 },
    { type:"imaging", title:"12誘導心電図", detail:"胸痛精査。ST変化の確認。", status:"completed", day:1, h:9, comp_day:1, comp_h:9 },
    { type:"imaging", title:"胸部X線（正面）", detail:"心拡大、肺うっ血の確認。", status:"completed", day:1, h:9, comp_day:1, comp_h:10 },
    { type:"imaging", title:"心臓超音波検査", detail:"壁運動異常・弁膜症の評価。", status:"completed", day:2, h:9, comp_day:3, comp_h:10 },
    { type:"lab", title:"血液検査（脂質・HbA1c・甲状腺機能）", detail:"動脈硬化リスク因子の評価。", status:"completed", day:2, h:9, comp_day:2, comp_h:11 },
    { type:"imaging", title:"冠動脈CT", detail:"冠動脈狭窄の評価。", status:"completed", day:4, h:9, comp_day:4, comp_h:11 },
    { type:"lab", title:"血液検査（凝固系・D-ダイマー）", detail:"DVTスクリーニング。", status:"completed", day:1, h:10, comp_day:1, comp_h:12 },
    { type:"procedure", title:"心臓リハビリテーション開始", detail:"心肺運動負荷試験後にプログラム作成。", status:"completed", day:2, h:14, comp_day:2, comp_h:15 },
    { type:"lab", title:"退院前血液検査（CBC・BNP）", detail:"退院判定用。", status:"completed", day:6, h:7, comp_day:6, comp_h:9 },
    { type:"other", title:"循環器内科コンサルト", detail:"冠動脈CT結果について意見照会。", status:"completed", day:4, h:14, comp_day:5, comp_h:9 },
    { type:"lab", title:"外来血液検査（脂質・HbA1c・BNP）", detail:"退院後の薬物療法効果判定。", status:"completed", day:10, h:10, comp_day:10, comp_h:12 },
    { type:"other", title:"外来心臓リハビリテーション継続指示", detail:"外来リハビリプログラム。週2回→週1回へ変更。", status:"completed", day:12, h:14, comp_day:12, comp_h:15 },
    { type:"imaging", title:"負荷心筋シンチグラフィ（予約）", detail:"6ヶ月後に虚血評価。外来予約。", status:"pending", day:14, h:10 },
  ];
  p1o.forEach(o => rows.push({ patient_id: P1, order_type: o.type, title: o.title, details: o.detail, status: o.status, ordered_by: DOCTOR, created_at: dt(4,o.day,o.h), completed_at: o.comp_day?dt(4,o.comp_day,o.comp_h):null }));

  // P2
  const p2o = [
    { type:"lab", title:"血液検査（CBC・CRP）", detail:"炎症反応の確認。", status:"completed", day:5, h:11, comp_day:5, comp_h:13 },
    { type:"imaging", title:"胸部X線（正面・側面）", detail:"肺炎の確認。", status:"completed", day:6, h:9, comp_day:6, comp_h:10 },
    { type:"lab", title:"喀痰培養検査", detail:"起因菌の同定。", status:"completed", day:6, h:9, comp_day:6, comp_h:14 },
    { type:"lab", title:"血液ガス分析", detail:"呼吸状態の評価。", status:"completed", day:6, h:10, comp_day:6, comp_h:10 },
    { type:"lab", title:"血液検査（CRP・プロカルシトニン）", detail:"治療効果判定。", status:"completed", day:8, h:9, comp_day:8, comp_h:11 },
    { type:"lab", title:"インフルエンザ迅速検査", detail:"インフルエンザの鑑別。", status:"completed", day:5, h:11, comp_day:5, comp_h:11 },
    { type:"lab", title:"新型コロナウイルス抗原検査", detail:"COVID-19の鑑別。", status:"completed", day:5, h:11, comp_day:5, comp_h:11 },
    { type:"imaging", title:"胸部X線フォロー", detail:"肺炎の改善確認。", status:"completed", day:14, h:10, comp_day:14, comp_h:10 },
    { type:"lab", title:"退院前血液検査（CBC・CRP）", detail:"炎症消退の確認。", status:"completed", day:10, h:8, comp_day:10, comp_h:10 },
    { type:"other", title:"感染症内科コンサルト", detail:"抗菌薬選択について意見照会。", status:"completed", day:6, h:14, comp_day:7, comp_h:9 },
  ];
  p2o.forEach(o => rows.push({ patient_id: P2, order_type: o.type, title: o.title, details: o.detail, status: o.status, ordered_by: DOCTOR, created_at: dt(4,o.day,o.h), completed_at: o.comp_day?dt(4,o.comp_day,o.comp_h):null }));

  // P3
  const p3o = [
    { type:"imaging", title:"左膝X線（正面・側面）", detail:"OAの評価。", status:"completed", day:1, h:10, comp_day:1, comp_h:10 },
    { type:"lab", title:"血液検査（CBC・CRP・RF・尿酸）", detail:"関節炎の鑑別。", status:"completed", day:1, h:10, comp_day:1, comp_h:12 },
    { type:"procedure", title:"リハビリテーション依頼", detail:"膝OAに対する筋力強化・ROM訓練。", status:"completed", day:1, h:11, comp_day:2, comp_h:10 },
    { type:"procedure", title:"ヒアルロン酸関節内注射（1回目）", detail:"左膝。25mg。", status:"completed", day:3, h:10, comp_day:3, comp_h:10 },
    { type:"imaging", title:"左膝MRI", detail:"半月板・靭帯の評価。", status:"completed", day:4, h:9, comp_day:4, comp_h:11 },
    { type:"procedure", title:"MSW介入依頼", detail:"退院後の在宅サービス調整。", status:"completed", day:4, h:14, comp_day:5, comp_h:15 },
    { type:"lab", title:"骨密度検査（DEXA）", detail:"骨粗鬆症スクリーニング。", status:"completed", day:5, h:9, comp_day:5, comp_h:10 },
    { type:"other", title:"退院前カンファレンス", detail:"多職種（医師・看護・リハビリ・MSW）で退院計画検討。", status:"completed", day:7, h:14, comp_day:7, comp_h:15 },
    { type:"procedure", title:"歩行器レンタル手配", detail:"退院後の自宅用。", status:"completed", day:6, h:10, comp_day:7, comp_h:10 },
    { type:"other", title:"ケアマネージャーとの連携", detail:"退院後サービス計画の最終確認。", status:"completed", day:7, h:15, comp_day:8, comp_h:9 },
    { type:"procedure", title:"ヒアルロン酸関節内注射（2回目）", detail:"左膝。25mg。外来にて。", status:"completed", day:10, h:10, comp_day:10, comp_h:10 },
    { type:"lab", title:"外来血液検査（CRP・RF）", detail:"炎症の経過確認。", status:"completed", day:10, h:10, comp_day:10, comp_h:12 },
    { type:"other", title:"在宅サービスモニタリング依頼", detail:"MSWよりケアマネへ利用状況確認依頼。", status:"completed", day:10, h:14, comp_day:13, comp_h:10 },
    { type:"imaging", title:"左膝X線フォロー", detail:"外来にてOAの経過確認。", status:"completed", day:14, h:10, comp_day:14, comp_h:10 },
  ];
  p3o.forEach(o => rows.push({ patient_id: P3, order_type: o.type, title: o.title, details: o.detail, status: o.status, ordered_by: DOCTOR, created_at: dt(4,o.day,o.h), completed_at: o.comp_day?dt(4,o.comp_day,o.comp_h):null }));

  // P4
  const p4o = [
    { type:"lab", title:"75g OGTT（経口ブドウ糖負荷試験）", detail:"GDM確定診断。", status:"completed", day:4, h:8, comp_day:4, comp_h:12 },
    { type:"lab", title:"血液検査（HbA1c・GA・血糖）", detail:"血糖コントロール指標。", status:"completed", day:3, h:10, comp_day:3, comp_h:12 },
    { type:"lab", title:"血液検査（甲状腺機能）", detail:"GDMの鑑別。", status:"completed", day:3, h:10, comp_day:3, comp_h:12 },
    { type:"other", title:"栄養指導依頼", detail:"GDMの食事療法。分割食の指導。", status:"completed", day:3, h:14, comp_day:4, comp_h:10 },
    { type:"imaging", title:"超音波検査（胎児）", detail:"胎児発育評価。推定体重・羊水量。", status:"completed", day:3, h:11, comp_day:3, comp_h:11 },
    { type:"other", title:"SMBG導入指導依頼", detail:"血糖自己測定の手技指導。", status:"completed", day:3, h:14, comp_day:3, comp_h:15 },
    { type:"procedure", title:"NST（ノンストレステスト）", detail:"胎児心拍モニタリング。", status:"completed", day:9, h:10, comp_day:9, comp_h:11 },
    { type:"lab", title:"血液検査（HbA1c）フォロー", detail:"インスリン導入後の効果判定。", status:"completed", day:13, h:9, comp_day:13, comp_h:11 },
    { type:"imaging", title:"超音波検査（胎児）フォロー", detail:"32週時の胎児発育確認。", status:"pending", day:14, h:10 },
    { type:"other", title:"インスリン自己注射指導依頼", detail:"超速効型インスリンの手技指導。", status:"completed", day:7, h:10, comp_day:8, comp_h:9 },
  ];
  p4o.forEach(o => rows.push({ patient_id: P4, order_type: o.type, title: o.title, details: o.detail, status: o.status, ordered_by: DOCTOR, created_at: dt(4,o.day,o.h), completed_at: o.comp_day?dt(4,o.comp_day,o.comp_h):null }));

  // P5
  const p5o = [
    { type:"imaging", title:"腰椎MRI", detail:"椎間板ヘルニアの評価。", status:"completed", day:1, h:11, comp_day:1, comp_h:12 },
    { type:"imaging", title:"腰椎X線（正面・側面）", detail:"脊椎アライメントの確認。", status:"completed", day:1, h:11, comp_day:1, comp_h:11 },
    { type:"lab", title:"血液検査（CBC・CRP・ESR）", detail:"炎症の鑑別。", status:"completed", day:1, h:11, comp_day:1, comp_h:13 },
    { type:"procedure", title:"リハビリテーション依頼", detail:"腰椎ヘルニアに対するMcKenzie法・コアトレーニング。", status:"completed", day:1, h:14, comp_day:2, comp_h:14 },
    { type:"procedure", title:"硬膜外神経ブロック注射（1回目）", detail:"L4/5レベル左側。", status:"completed", day:4, h:10, comp_day:4, comp_h:10 },
    { type:"procedure", title:"硬膜外神経ブロック注射（2回目）", detail:"L4/5レベル左側。効果確認。", status:"pending", day:11, h:10 },
    { type:"lab", title:"神経伝導検査", detail:"末梢神経障害の評価。", status:"completed", day:3, h:14, comp_day:3, comp_h:15 },
    { type:"other", title:"整形外科（脊椎）コンサルト", detail:"手術適応の検討。保存的治療無効時。", status:"completed", day:5, h:9, comp_day:6, comp_h:10 },
    { type:"imaging", title:"腰椎MRI フォロー", detail:"4週後の再評価。", status:"pending", day:14, h:10 },
    { type:"other", title:"職場復帰プログラム作成依頼", detail:"リハビリ科にて復職支援計画。", status:"completed", day:8, h:14, comp_day:9, comp_h:14 },
    { type:"lab", title:"外来血液検査（CBC・CRP・ESR）", detail:"退院後の炎症再確認。", status:"completed", day:10, h:11, comp_day:10, comp_h:13 },
    { type:"other", title:"プレガバリン漸減スケジュール確認", detail:"75mg→50mg→25mg→中止の4週間漸減計画。", status:"completed", day:14, h:10, comp_day:14, comp_h:10 },
    { type:"procedure", title:"外来リハビリテーション継続指示", detail:"週2回→週1回への変更。コアトレーニング中心。", status:"completed", day:12, h:14, comp_day:12, comp_h:15 },
  ];
  p5o.forEach(o => rows.push({ patient_id: P5, order_type: o.type, title: o.title, details: o.detail, status: o.status, ordered_by: DOCTOR, created_at: dt(4,o.day,o.h), completed_at: o.comp_day?dt(4,o.comp_day,o.comp_h):null }));

  return rows;
}

function generateDocuments() {
  const rows = [];

  // P1: 田中太郎 (10件)
  rows.push({ patient_id: P1, document_type: "referral_letter", title: "診療情報提供書 - 循環器内科宛", content: "紹介先: ○○病院 循環器内科\n\n患者: 田中太郎 様（70歳男性）\n\n既往歴: 高血圧症（10年前〜）\n現病歴: 労作時胸痛が出現し精査。冠動脈CTにてLAD#6に50%狭窄疑い。薬物療法を開始しましたが、今後の管理についてご高診いただきたくご紹介申し上げます。\n\n現在の処方:\n・アムロジピン10mg 1日1回\n・バイアスピリン100mg 1日1回\n・アトルバスタチン10mg 1日1回\n\nアレルギー: ペニシリン（重度）、アスピリン（中等度・胃腸障害）", created_by: DOCTOR, created_at: dt(4,6,16) });
  rows.push({ patient_id: P1, document_type: "discharge_summary", title: "退院サマリー", content: "入院期間: 2026/04/01 - 2026/04/07\n主病名: 高血圧性心疾患、労作時狭心症疑い\n\n入院時現症: 労作時胸痛、血圧145/90mmHg\n入院中経過: 降圧剤増量、冠動脈CT施行。LAD#6に50%狭窄疑い。循環器内科コンサルトの結果、現時点ではカテーテル検査の適応なく薬物療法で管理の方針。心臓リハビリ開始し運動耐容能改善。\n\n退院時処方:\n・アムロジピン10mg、バイアスピリン100mg、アトルバスタチン10mg、カルベジロール2.5mg、ニコランジル5mg、ランソプラゾール15mg\n\n退院後方針: 外来2週間後再診。心臓リハビリ外来継続。", created_by: DOCTOR, created_at: dt(4,7,10) });
  rows.push({ patient_id: P1, document_type: "other", title: "心臓リハビリテーション計画書", content: "患者: 田中太郎 様\n\n疾患名: 高血圧性心疾患\nリハビリ開始日: 2026/04/02\n\n目標:\n1. 運動耐容能の改善（6MWT 400m以上）\n2. 血圧管理の最適化\n3. 生活習慣の改善\n\nプログラム:\n・有酸素運動（エルゴメーター、歩行）- 週5回、20-30分\n・HR管理: 目標HR 100-110bpm\n・血圧モニタリング\n\n経過: 入院中6MWT 350m→410mに改善。退院後は外来リハビリに移行。", created_by: REHAB, created_at: dt(4,5,16) });
  rows.push({ patient_id: P1, document_type: "other", title: "生活指導記録", content: "指導日: 2026/04/05\n\n1. 食事指導\n・減塩食（6g/日未満）\n・脂質制限\n・野菜・魚中心の食事\n\n2. 運動指導\n・毎日30分のウォーキング\n・脈拍100以下で実施\n・胸痛出現時は中止しニトロ使用\n\n3. 服薬指導\n・処方薬の自己中断禁止\n・バイアスピリンの胃腸障害に注意\n\n4. 受診指導\n・2週間後に外来再診\n・胸痛再発時は救急受診", created_by: NURSE, created_at: dt(4,5,14) });
  rows.push({ patient_id: P1, document_type: "other", title: "看護サマリー", content: "患者: 田中太郎 様（70歳男性）\n入院期間: 2026/04/01-07\n\n看護問題:\n1. 胸痛に対する不安\n2. 高血圧の自己管理不足\n\n看護介入:\n・バイタルサイン3検/日\n・疼痛評価と対応\n・降圧剤の服薬管理\n・生活指導の実施\n\n退院時評価:\n・胸痛消失、血圧安定\n・服薬の重要性を理解\n・自己管理への意欲あり", created_by: NURSE, created_at: dt(4,7,9) });
  rows.push({ patient_id: P1, document_type: "other", title: "冠動脈CT検査報告書", content: "検査日: 2026/04/04\n患者: 田中太郎 様\n\n所見:\n・LAD（左前下行枝）#6に50%狭窄疑い。軟性プラークの存在を示唆。\n・RCA（右冠動脈）: 有意狭窄なし\n・LCX（左回旋枝）: 有意狭窄なし\n・Agatston score: 180\n\n結論:\nLAD#6の軽度〜中等度狭窄疑い。薬物療法による管理が妥当。\n症状増悪時は侵襲的検査（CAG）を検討。", created_by: DOCTOR, created_at: dt(4,4,14) });
  rows.push({ patient_id: P1, document_type: "other", title: "心臓超音波検査報告書", content: "検査日: 2026/04/03\n\n所見:\n・LVDd 48mm, LVDs 32mm\n・EF 58%（正常下限）\n・壁運動異常なし\n・弁膜症なし\n・IVS 12mm（軽度肥厚）\n・心嚢液貯留なし\n・E/A 0.9, E/e' 10\n\n結論:\n軽度の左室壁肥厚あり（高血圧性心疾患を示唆）。\n左室収縮能は正常下限。拡張能は軽度低下。", created_by: DOCTOR, created_at: dt(4,3,14) });
  rows.push({ patient_id: P1, document_type: "other", title: "入院診療計画書", content: "患者: 田中太郎 様\n入院日: 2026/04/01\n\n主病名: 高血圧症増悪、労作時狭心症疑い\n\n入院目的:\n・高血圧の管理\n・狭心症の精査\n\n治療計画:\n1. 降圧剤の調整\n2. 血液検査・心電図・心エコー・冠動脈CT\n3. 心臓リハビリテーション\n\n推定入院期間: 5-7日\n\n説明医師: 山田太郎", created_by: DOCTOR, created_at: dt(4,1,10) });
  rows.push({ patient_id: P1, document_type: "other", title: "退院療養計画書", content: "患者: 田中太郎 様\n退院日: 2026/04/07\n\n退院後の療養計画:\n1. 服薬管理（6種類の内服薬を毎日継続）\n2. 減塩食の継続\n3. 適度な運動（30分/日のウォーキング）\n4. 外来受診（2週間後）\n5. 外来心臓リハビリ（週2回）\n\n緊急時の対応:\n・胸痛出現時はニトロ使用後、改善なければ救急搬送\n\n連絡先: 当院外来 03-XXXX-XXXX", created_by: DOCTOR, created_at: dt(4,7,11) });
  rows.push({ patient_id: P1, document_type: "other", title: "循環器内科コンサルト返信", content: "コンサルト日: 2026/04/04\n回答日: 2026/04/05\n\n田中太郎 様について\n\n冠動脈CTの結果を確認しました。\nLAD#6の50%狭窄は薬物療法で管理可能な範囲と考えます。\n\n推奨:\n・スタチン系薬剤による脂質管理強化\n・β遮断薬の追加（心保護目的）\n・6ヶ月後に負荷心筋シンチで虚血評価\n・症状増悪時はCAGを検討\n\n循環器内科 □□医師", created_by: DOCTOR, created_at: dt(4,5,10) });
  rows.push({ patient_id: P1, document_type: "other", title: "外来経過報告書（退院後初回）", content: "再診日: 2026/04/10\n\n経過:\n・胸痛の再発なし\n・降圧剤増量後、血圧コントロール良好（自宅測定 125-130/74-78）\n\n検査結果:\n・BNP 28pg/mL（前回45→改善）\n・LDL 102mg/dL（目標100未満にやや未達）\n・HbA1c 5.8%（正常）\n\n対応:\n・エゼチミブ追加によるLDL管理強化\n・カルベジロール2.5mg→5mgに増量", created_by: DOCTOR, created_at: dt(4,10,11) });
  rows.push({ patient_id: P1, document_type: "other", title: "心臓リハビリ外来経過報告", content: "報告日: 2026/04/12\n\n入院時→退院時→外来2回目:\n・6MWT: 350m→410m→440m\n・Borg Scale: 14→12→10\n・安静時HR: 80→70→66\n\n評価: 退院後も運動耐容能の改善が続いている。自主トレのコンプライアンスも良好。\n計画: リハビリ頻度を週1回に変更。自主管理中心へ移行。", created_by: REHAB, created_at: dt(4,12,15) });
  rows.push({ patient_id: P1, document_type: "other", title: "外来フォロー計画書", content: "作成日: 2026/04/14\n\n患者: 田中太郎 様\n\n外来フォロー計画:\n・受診間隔: 月1回\n・心臓リハビリ: 週1回（外来）\n・血液検査: 月1回（脂質・BNP・腎機能）\n・心電図: 3ヶ月毎\n・負荷心筋シンチ: 6ヶ月後（2026年10月予定）\n\n目標値:\n・血圧 < 130/80\n・LDL < 100mg/dL\n・BNP < 40pg/mL", created_by: DOCTOR, created_at: dt(4,14,11) });

  // P2: 佐藤花子 (10件)
  rows.push({ patient_id: P2, document_type: "other", title: "入院診療計画書", content: "患者: 佐藤花子 様\n入院日: 2026/04/06\n\n主病名: 市中肺炎（右下葉）\n\n入院目的:\n・抗菌薬治療と経過観察\n\n治療計画:\n1. アジスロマイシンによる抗菌薬治療\n2. 対症療法（解熱鎮痛、鎮咳去痰）\n3. 胸部X線フォロー\n\n推定入院期間: 5-7日", created_by: DOCTOR, created_at: dt(4,6,15) });
  rows.push({ patient_id: P2, document_type: "discharge_summary", title: "退院サマリー", content: "入院期間: 2026/04/06 - 2026/04/10\n主病名: 市中肺炎（右下葉）\n\n入院時現症: BT 38.1, SpO2 96%, 右下肺野crackles\n入院中経過: アジスロマイシン5日間投与。解熱し、CRP正常化傾向。SpO2改善。\n\n退院時処方: カルボシステイン500mg 3T3x\n退院後方針: 1週間後に胸部X線フォロー。", created_by: DOCTOR, created_at: dt(4,10,11) });
  rows.push({ patient_id: P2, document_type: "other", title: "胸部X線検査報告書（初回）", content: "検査日: 2026/04/06\n\n所見:\n・右下肺野に斑状浸潤影あり\n・心陰影拡大なし\n・胸水なし\n・肺門リンパ節腫脹なし\n\n結論: 右下葉肺炎を疑う所見。", created_by: DOCTOR, created_at: dt(4,6,11) });
  rows.push({ patient_id: P2, document_type: "other", title: "胸部X線検査報告書（フォロー）", content: "検査日: 2026/04/14\n\n所見:\n・前回認めた右下肺野浸潤影は消失\n・肺野に新たな異常所見なし\n\n結論: 肺炎治癒。", created_by: DOCTOR, created_at: dt(4,14,11) });
  rows.push({ patient_id: P2, document_type: "other", title: "看護サマリー", content: "患者: 佐藤花子 様（57歳女性）\n入院期間: 2026/04/06-10\n\n看護問題:\n1. 発熱・咳嗽による安楽障害\n2. 脱水リスク\n\n看護介入:\n・体温4検/日、SpO2モニタリング\n・水分摂取量記録\n・排痰援助（体位ドレナージ）\n\n退院時評価:\n・解熱、咳嗽軽減\n・食事摂取量回復", created_by: NURSE, created_at: dt(4,10,10) });
  rows.push({ patient_id: P2, document_type: "other", title: "感染症内科コンサルト返信", content: "佐藤花子 様の市中肺炎について\n\nA-DROPスコア1（軽症）であり、外来治療も可能な範囲ですが、SpO2低下傾向があるため短期入院での治療が妥当と考えます。\n\n抗菌薬はアジスロマイシンの選択で問題ありません。マクロライド系+β-ラクタム系の併用も検討しましたが、軽症であり単剤で十分と判断します。\n\n5日間投与後にCRP再検し、改善していれば終了。", created_by: DOCTOR, created_at: dt(4,7,10) });
  rows.push({ patient_id: P2, document_type: "other", title: "喀痰培養検査結果報告", content: "検査日: 2026/04/06\n結果報告日: 2026/04/08\n\nグラム染色: GPC（2+）、好中球多数\n培養結果: Streptococcus pneumoniae（中間量）\n\n薬剤感受性:\n・ペニシリン: S\n・アジスロマイシン: S\n・レボフロキサシン: S\n\n考察: 肺炎球菌性肺炎と考えられる。現行の抗菌薬で適切。", created_by: DOCTOR, created_at: dt(4,8,14) });
  rows.push({ patient_id: P2, document_type: "other", title: "退院指導記録", content: "指導日: 2026/04/10\n\n1. 服薬指導: 去痰薬の継続使用（症状消失まで）\n2. 生活指導: 十分な休養、水分摂取\n3. 受診指導: 1週間後に外来再診（X線フォロー）\n4. 注意事項: 発熱再燃、呼吸困難、胸痛時は早期受診", created_by: NURSE, created_at: dt(4,10,9) });
  rows.push({ patient_id: P2, document_type: "other", title: "クリニカルパス（市中肺炎）記録", content: "入院1日目: 抗菌薬開始、血液検査、X線\n入院2日目: 解熱傾向確認、喀痰培養結果待ち\n入院3日目: CRP再検、改善傾向確認\n入院4日目: 食事摂取回復、SpO2改善\n入院5日目: 抗菌薬終了、退院判定\n\nバリアンス: なし。パス通りに経過。", created_by: DOCTOR, created_at: dt(4,10,10) });
  rows.push({ patient_id: P2, document_type: "other", title: "外来再診時報告書", content: "再診日: 2026/04/14\n\n胸部X線: 浸潤影消失\nCRP: 0.2mg/dL（正常化）\n自覚症状: 咳嗽消失、全身状態良好\n\n結論: 肺炎治癒確認。治療終了。\nインフルエンザ・肺炎球菌ワクチンの接種を推奨。", created_by: DOCTOR, created_at: dt(4,14,11) });

  // P3: 鈴木一郎 (10件)
  rows.push({ patient_id: P3, document_type: "discharge_summary", title: "退院サマリー", content: "入院期間: 2026/04/01 - 2026/04/08\n主病名: 変形性膝関節症（左）\n\n入院時現症: 左膝関節腫脹、ROM屈曲110度、歩行困難\n入院中経過: NSAIDs投与、ヒアルロン酸注射、リハビリにより症状改善。MSW介入で退院後の在宅サービスを調整。歩行器使用にて自立歩行可能。\n\n退院時処方: ロキソプロフェン60mg 3T3x、レバミピド100mg 3T3x、モーラステープ\n退院後方針: 外来リハビリ週2回。ヒアルロン酸注射2回目は外来で。", created_by: DOCTOR, created_at: dt(4,8,10) });
  rows.push({ patient_id: P3, document_type: "other", title: "リハビリテーション実施計画書", content: "患者: 鈴木一郎 様（83歳男性）\n疾患: 左変形性膝関節症\n\n目標:\n1. ROM改善（屈曲130度以上）\n2. 大腿四頭筋筋力改善（MMT 5/5）\n3. 歩行自立（T字杖）\n\nプログラム:\n・ROM訓練（他動→自動）\n・大腿四頭筋等尺性訓練→漸増負荷\n・歩行訓練（歩行器→T字杖→独歩）\n・階段昇降訓練\n\n実施頻度: 週5回（入院中）→週2回（外来）", created_by: REHAB, created_at: dt(4,2,11) });
  rows.push({ patient_id: P3, document_type: "other", title: "MSW介入記録（初回面談）", content: "面談日: 2026/04/05\n\n患者背景:\n・83歳男性、独居\n・要介護1\n・娘（遠方在住）が週1回訪問\n\n生活上の困りごと:\n・買い物、掃除が困難\n・入浴に不安\n\n支援計画:\n・ケアマネージャーとの連携\n・訪問介護（週3回）の導入\n・デイサービス（週2回）の利用\n・福祉用具（歩行器、手すり）のレンタル", created_by: REHAB, created_at: dt(4,5,16) });
  rows.push({ patient_id: P3, document_type: "other", title: "退院前カンファレンス議事録", content: "日時: 2026/04/07 14:00\n参加者: 主治医、担当看護師、PT、MSW、ケアマネージャー\n\n検討内容:\n1. 膝の状態: 改善傾向。外来リハビリ継続が必要。\n2. ADL: 歩行器で自立。入浴は介助必要。\n3. 在宅サービス: 訪問介護週3回、デイサービス週2回で開始。\n4. 福祉用具: 歩行器・シャワーチェア・手すり（トイレ・浴室）\n5. 退院日: 2026/04/08\n\n次回外来: 2週間後", created_by: DOCTOR, created_at: dt(4,7,15) });
  rows.push({ patient_id: P3, document_type: "other", title: "入院診療計画書", content: "患者: 鈴木一郎 様\n入院日: 2026/04/01\n\n主病名: 変形性膝関節症（左）増悪\n\n治療計画:\n1. NSAIDs投与による疼痛管理\n2. ヒアルロン酸関節内注射\n3. リハビリテーション\n4. 退院支援（MSW介入）\n\n推定入院期間: 7-10日", created_by: DOCTOR, created_at: dt(4,1,11) });
  rows.push({ patient_id: P3, document_type: "other", title: "左膝MRI検査報告書", content: "検査日: 2026/04/04\n\n所見:\n・内側半月板:変性断裂あり（Grade III）\n・外側半月板:正常\n・前十字靭帯:正常\n・後十字靭帯:正常\n・関節軟骨:内側区画で菲薄化著明\n・関節液:中等量貯留\n・Baker嚢胞:あり\n\n結論: 内側優位の変形性変化。内側半月板変性断裂合併。", created_by: DOCTOR, created_at: dt(4,4,14) });
  rows.push({ patient_id: P3, document_type: "other", title: "骨密度検査結果報告書", content: "検査日: 2026/04/05\n\nDEXA法:\n・腰椎(L2-L4): YAM 72% (T-score -2.3)\n・大腿骨頸部: YAM 68% (T-score -2.6)\n\n判定: 骨粗鬆症\n\n推奨:\n・エルデカルシトール継続\n・転倒予防指導\n・1年後に再検", created_by: DOCTOR, created_at: dt(4,5,11) });
  rows.push({ patient_id: P3, document_type: "other", title: "看護サマリー", content: "患者: 鈴木一郎 様（83歳男性）\n入院期間: 2026/04/01-08\n\n看護問題:\n1. 疼痛による活動性低下\n2. 転倒リスク\n3. 独居高齢者の退院支援\n\n看護介入:\n・疼痛評価（NRS）\n・離床促進と転倒予防\n・ADL訓練の支援\n・退院指導\n\n退院時評価:\n・NRS 2/10に改善\n・歩行器で安全に移動可能", created_by: NURSE, created_at: dt(4,8,9) });
  rows.push({ patient_id: P3, document_type: "referral_letter", title: "ケアマネージャー宛情報提供書", content: "ケアマネージャー □□様\n\n鈴木一郎 様（83歳男性）が2026/04/08に退院いたします。\n\n疾患: 変形性膝関節症（左）\n現在のADL: 歩行器使用で室内移動自立。入浴は介助必要。\n\nご配慮いただきたい点:\n・転倒予防（自宅内の環境整備）\n・服薬管理（7種類の内服薬）\n・外来リハビリ通院（週2回）の送迎\n\n外来予約: 2週間後", created_by: REHAB, created_at: dt(4,7,16) });
  rows.push({ patient_id: P3, document_type: "other", title: "リハビリテーション経過報告書", content: "報告日: 2026/04/14（外来リハビリ時）\n\n入院時→退院時→外来1回目:\n・ROM屈曲: 110度→120度→125度\n・MMT大腿四頭筋: 4/5→4/5→4+/5\n・歩行: 歩行器→歩行器→T字杖\n・6MWT: 未実施→200m→250m\n\n評価: 順調に回復。自宅での自主トレも実施できている。\n計画: リハビリ頻度を週1回に変更。", created_by: REHAB, created_at: dt(4,14,11) });

  // P4: 高橋美咲 (10件)
  rows.push({ patient_id: P4, document_type: "other", title: "入院診療計画書", content: "患者: 高橋美咲 様\n入院日: 2026/04/03\n\n主病名: 妊娠糖尿病（GDM）\n\n入院目的:\n・GDMの確定診断と血糖管理\n・インスリン療法の導入と自己管理指導\n\n治療計画:\n1. 75gOGTT施行\n2. SMBG開始（4検/日）\n3. 栄養指導（分割食）\n4. 必要に応じてインスリン導入\n\n推定入院期間: 10-14日", created_by: DOCTOR, created_at: dt(4,3,11) });
  rows.push({ patient_id: P4, document_type: "other", title: "栄養指導記録", content: "指導日: 2026/04/04\n栄養士: △△\n\n現在の食事状況:\n・1日3食、間食あり\n・炭水化物過多の傾向\n\n指導内容:\n1. 分割食（6回/日）への変更\n2. 1日総カロリー: 1800kcal\n3. 炭水化物: 総カロリーの50%\n4. 食物繊維の積極的摂取\n5. 低GI食品の選択\n\nフォロー: 1週間後に再面談", created_by: NURSE, created_at: dt(4,4,14) });
  rows.push({ patient_id: P4, document_type: "other", title: "SMBG記録（第1週）", content: "2026/04/03-09 血糖自己測定記録\n\n04/03: 朝前-, 朝後180, 昼前-, 昼後165\n04/04: 朝前95, 朝後145, 昼前88, 昼後148, 夕前92, 夕後152\n04/05: 朝前92, 朝後135, 昼前85, 昼後140, 夕前88, 夕後138\n04/06: 朝前90, 朝後130, 昼前82, 昼後135, 夕前86, 夕後132\n04/07: 朝前88, 朝後128, 昼前80, 昼後130, 夕前84, 夕後128 ←インスリン開始\n04/08: 朝前82, 朝後115, 昼前78, 昼後112, 夕前80, 夕後110\n04/09: 朝前80, 朝後112, 昼前76, 昼後108, 夕前78, 夕後106\n\n目標: 食前<95, 食後2h<120", created_by: NURSE, created_at: dt(4,9,14) });
  rows.push({ patient_id: P4, document_type: "other", title: "インスリン自己注射指導記録", content: "指導日: 2026/04/08\n\n使用薬剤: ノボラピッド注フレックスペン\n指導内容:\n1. 注射部位（腹部）のローテーション\n2. 空打ち（2単位）の確認\n3. ダイアル設定と注射手技\n4. 注射後10秒間の保持\n5. 使用済み針の廃棄方法\n6. 低血糖症状と対処法\n\n評価: 手技獲得良好。自己注射に不安なく実施可能。", created_by: NURSE, created_at: dt(4,8,10) });
  rows.push({ patient_id: P4, document_type: "other", title: "超音波検査（胎児）報告書", content: "検査日: 2026/04/03\n妊娠28週\n\n所見:\n・推定体重: 1200g（28週相当、-0.2SD）\n・BPD: 72mm\n・FL: 52mm\n・AC: 238mm\n・AFI: 12cm（正常範囲）\n・胎盤位置: 後壁、正常位\n・臍帯血流: RI 0.65（正常）\n\n結論: 胎児発育正常。羊水量正常。", created_by: DOCTOR, created_at: dt(4,3,12) });
  rows.push({ patient_id: P4, document_type: "other", title: "75gOGTT結果報告", content: "検査日: 2026/04/04\n\n結果:\n・空腹時血糖: 92 mg/dL（基準<92）→陽性\n・1時間値: 190 mg/dL（基準<180）→陽性\n・2時間値: 162 mg/dL（基準<153）→陽性\n\n判定: 3項目中3項目陽性\n診断: 妊娠糖尿病（GDM）確定\n\n注: IADPSG基準により1項目以上陽性でGDM診断。", created_by: DOCTOR, created_at: dt(4,4,13) });
  rows.push({ patient_id: P4, document_type: "other", title: "看護サマリー", content: "患者: 高橋美咲 様（46歳女性、妊娠28週）\n入院期間: 2026/04/03-13\n\n看護問題:\n1. GDMによる血糖管理の必要性\n2. 自己注射・SMBGへの不安\n3. 食事制限によるストレス\n\n看護介入:\n・SMBG・自己注射の手技指導\n・精神的サポート\n・低血糖時の対応指導\n\n退院時評価:\n・自己管理能力十分\n・血糖コントロール良好", created_by: NURSE, created_at: dt(4,13,10) });
  rows.push({ patient_id: P4, document_type: "other", title: "NST（ノンストレステスト）報告書", content: "検査日: 2026/04/09\n妊娠29週\n\n結果:\n・基線心拍数: 140bpm\n・基線細変動: 正常（6-25bpm）\n・一過性頻脈: 2回/20分（reactive）\n・一過性徐脈: なし\n・子宮収縮: なし\n\n判定: reactive pattern\n結論: 胎児well-being良好。", created_by: DOCTOR, created_at: dt(4,9,11) });
  rows.push({ patient_id: P4, document_type: "other", title: "退院時指導記録", content: "指導日: 2026/04/13\n\n1. 血糖自己測定: 1日4回継続\n2. インスリン注射: 毎食前4単位（スライディングスケール対応）\n3. 食事: 分割食6回、1800kcal/日\n4. 運動: 食後30分の散歩\n5. 胎動カウント: 毎日実施\n6. 受診: 週1回の外来受診\n7. 緊急時: 破水・出血・胎動減少時は即受診\n\n分娩目標: 37-38週", created_by: NURSE, created_at: dt(4,13,11) });
  rows.push({ patient_id: P4, document_type: "referral_letter", title: "産科宛 妊娠糖尿病管理報告", content: "産科 ○○先生\n\n高橋美咲 様（46歳、G1P0、妊娠29週）のGDM管理について報告いたします。\n\n75gOGTT: 空腹時92、1h 190、2h 162（3項目陽性）\nHbA1c: 6.2% → 5.8%（インスリン導入後）\n\n現在のインスリン量: ノボラピッド 毎食前4単位\nSMBG: 食前<95、食後2h<120で安定\n\n分娩時の注意:\n・分娩中の血糖管理（目標70-140mg/dL）\n・新生児低血糖のモニタリング\n\n内科外来は週1回でフォロー継続します。", created_by: DOCTOR, created_at: dt(4,13,15) });

  // P5: 渡辺健二 (10件)
  rows.push({ patient_id: P5, document_type: "other", title: "入院診療計画書", content: "患者: 渡辺健二 様\n入院日: 2026/04/01\n\n主病名: 腰椎椎間板ヘルニア（L4/5）\n\n治療計画:\n1. 保存的治療（NSAIDs、プレガバリン）\n2. 硬膜外神経ブロック注射\n3. リハビリテーション（McKenzie法）\n4. 4週後にMRI再検\n\n推定入院期間: 7-10日", created_by: DOCTOR, created_at: dt(4,1,12) });
  rows.push({ patient_id: P5, document_type: "other", title: "腰椎MRI検査報告書", content: "検査日: 2026/04/01\n\n所見:\n・L4/5: 左後方への椎間板突出あり。左L5神経根を圧排。\n・L3/4: 軽度の椎間板膨隆。神経根圧排なし。\n・L5/S1: 正常。\n・脊柱管狭窄: なし\n・馬尾: 正常\n・椎体: 骨髄信号正常\n\n結論: L4/5左後方ヘルニア。左L5神経根症。", created_by: DOCTOR, created_at: dt(4,1,13) });
  rows.push({ patient_id: P5, document_type: "other", title: "神経ブロック注射施行記録", content: "施行日: 2026/04/04\n\n手技: 硬膜外神経ブロック注射\n部位: L4/5椎間、左側\n薬剤: リドカイン1% 5mL + デキサメタゾン4mg\n\n施行後評価:\n・施行前NRS: 6/10（左下肢）\n・施行30分後NRS: 3/10\n・合併症: なし\n\n効果: 良好。左下肢放散痛の即時改善。", created_by: DOCTOR, created_at: dt(4,4,11) });
  rows.push({ patient_id: P5, document_type: "other", title: "リハビリテーション実施計画書", content: "患者: 渡辺健二 様（50歳男性）\n疾患: 腰椎椎間板ヘルニア（L4/5）\n\n目標:\n1. 疼痛軽減（NRS 2以下）\n2. 腰椎可動域の改善\n3. 体幹筋力強化\n4. 職場復帰\n\nプログラム:\n・McKenzie法伸展エクササイズ\n・コアスタビリティトレーニング\n・姿勢指導（座位・立位）\n・職場復帰プログラム\n\n頻度: 週5回（入院中）→週2回（外来）", created_by: REHAB, created_at: dt(4,2,15) });
  rows.push({ patient_id: P5, document_type: "referral_letter", title: "診療情報提供書 - 整形外科脊椎センター宛", content: "紹介先: △△病院 整形外科 脊椎センター\n\n患者: 渡辺健二 様（50歳男性）\n\n現病歴: L4/5椎間板ヘルニアによる左下肢放散痛。保存的治療（NSAIDs、プレガバリン、神経ブロック、リハビリ）を施行し改善傾向ですが、4週後のMRI再検で改善不十分の場合、手術的加療をご検討いただきたくご紹介いたします。\n\nアレルギー: セフェム系抗菌薬（重度・アナフィラキシー）", created_by: DOCTOR, created_at: dt(4,6,15) });
  rows.push({ patient_id: P5, document_type: "discharge_summary", title: "退院サマリー", content: "入院期間: 2026/04/01 - 2026/04/09\n主病名: 腰椎椎間板ヘルニア（L4/5）\n\n入院時現症: 左下肢放散痛（NRS 6/10）、SLR陽性（左30度）\n入院中経過: NSAIDs+プレガバリンによる薬物療法、硬膜外神経ブロック注射、McKenzie法リハビリにより症状改善。\n退院時: NRS 1-2/10、SLR 60度。ADL自立。\n\n退院後方針: 外来リハビリ週2回。4週後MRI再検。プレガバリン漸減予定。", created_by: DOCTOR, created_at: dt(4,9,11) });
  rows.push({ patient_id: P5, document_type: "other", title: "看護サマリー", content: "患者: 渡辺健二 様（50歳男性）\n入院期間: 2026/04/01-09\n\n看護問題:\n1. 腰痛・下肢痛による活動制限\n2. 不眠（疼痛による）\n3. 職場復帰への不安\n\n看護介入:\n・疼痛評価と薬物管理\n・体位の工夫（クッション使用）\n・睡眠環境の調整\n・不安の傾聴と情報提供\n\n退院時評価:\n・疼痛管理良好\n・職場復帰プログラムに前向き", created_by: NURSE, created_at: dt(4,9,10) });
  rows.push({ patient_id: P5, document_type: "other", title: "職場復帰プログラム", content: "作成日: 2026/04/09\n\n段階的復帰計画:\n第1週: 半日勤務（午前のみ）。座位作業中心。1時間毎に立位休憩。\n第2週: 6時間勤務。軽度の立位作業可。\n第3週: フルタイム勤務。重量物の持ち上げは禁止。\n第4週: 通常勤務。ただし10kg以上の持ち上げは当面回避。\n\n自主トレ:\n・McKenzie伸展エクササイズ（朝・昼・夕）\n・コアトレーニング（朝・夕）\n・30分のウォーキング（毎日）", created_by: REHAB, created_at: dt(4,9,15) });
  rows.push({ patient_id: P5, document_type: "other", title: "整形外科コンサルト返信", content: "渡辺健二 様のL4/5椎間板ヘルニアについて\n\n現時点では保存的治療で改善傾向にあり、手術の緊急性はありません。\n\n手術適応の判断基準:\n1. 4週間の保存的治療で改善不十分\n2. 進行性の筋力低下\n3. 膀胱直腸障害の出現\n\n上記いずれかに該当する場合は、当科外来を受診ください。\n術式としてはMED（内視鏡下椎間板摘出術）が適応と考えます。\n\n整形外科 脊椎センター ○○医師", created_by: DOCTOR, created_at: dt(4,6,11) });
  rows.push({ patient_id: P5, document_type: "other", title: "神経伝導検査報告書", content: "検査日: 2026/04/03\n\n運動神経伝導検査:\n・腓骨神経（左）: MCV 42m/s（正常下限）、遠位潜時 4.8ms（軽度延長）\n・脛骨神経（左）: MCV 45m/s（正常）\n・腓骨神経（右）: MCV 48m/s（正常）\n\n感覚神経伝導検査:\n・腓腹神経（左）: SCV 38m/s（軽度低下）\n・腓腹神経（右）: SCV 45m/s（正常）\n\n結論: 左腓骨神経領域で軽度の伝導遅延。L5神経根症に矛盾しない所見。", created_by: DOCTOR, created_at: dt(4,3,16) });
  rows.push({ patient_id: P5, document_type: "other", title: "外来リハビリ経過報告書", content: "報告日: 2026/04/12\n\n入院時→退院時→外来2回目:\n・SLR: 30度→60度→65度\n・NRS: 6/10→1-2/10→1/10\n・体幹筋力: 3+/5→4+/5→4+/5\n・座位持続: 15分→30分→60分\n\n評価: 順調な回復経過。職場復帰プログラム第2週に移行可能。\n計画: 座位作業時間の延長。デスクワーク環境の調整指導。", created_by: REHAB, created_at: dt(4,12,15) });
  rows.push({ patient_id: P5, document_type: "other", title: "外来再診時報告書", content: "再診日: 2026/04/14\n\n経過: 職場復帰1週目を問題なく終了。腰痛はNRS 0-1。\n検査: 血液検査CRP 0.1（正常）。\n方針:\n・MRI再検を4週後に予約\n・プレガバリン漸減開始（75mg→50mg）\n・リハビリ頻度を週1回に変更\n・次回外来2週間後", created_by: DOCTOR, created_at: dt(4,14,11) });
  rows.push({ patient_id: P5, document_type: "other", title: "プレガバリン漸減計画書", content: "作成日: 2026/04/14\n\n患者: 渡辺健二 様\n現在量: プレガバリン75mg 1日2回\n\n漸減スケジュール:\n・第1-2週: 50mg 1日2回\n・第3-4週: 25mg 1日2回\n・第5-6週: 25mg 1日1回（夕のみ）\n・第7週以降: 中止\n\n注意事項:\n・急な中断は離脱症状のリスクあり\n・疼痛再燃時は漸減を一時中止し、前段階に戻す\n・めまい・眠気の変化に注意", created_by: DOCTOR, created_at: dt(4,14,12) });

  return rows;
}

function generateAdmissions() {
  return [
    // P1: 田中太郎 - 4/1入院→4/7退院
    { patient_id: P1, admission_date: dt(4,1,10), discharge_date: dt(4,7,10), ward: "3A", room: "301", bed_number: "A", status: "discharged", admitted_by: DOCTOR, notes: "高血圧症増悪、狭心症疑いで入院", created_at: dt(4,1,10) },
    // P2: 佐藤花子 - 4/6入院→4/10退院
    { patient_id: P2, admission_date: dt(4,6,14), discharge_date: dt(4,10,10), ward: "3A", room: "302", bed_number: "B", status: "discharged", admitted_by: DOCTOR, notes: "市中肺炎で入院", created_at: dt(4,6,14) },
    // P3: 鈴木一郎 - 4/1入院→4/8退院
    { patient_id: P3, admission_date: dt(4,1,9), discharge_date: dt(4,8,10), ward: "4B", room: "404", bed_number: "A", status: "discharged", admitted_by: DOCTOR, notes: "左膝OA増悪で入院", created_at: dt(4,1,9) },
    // P4: 高橋美咲 - 4/3入院、現在入院中
    { patient_id: P4, admission_date: dt(4,3,11), ward: "3A", room: "303", bed_number: "A", status: "admitted", admitted_by: DOCTOR, notes: "妊娠糖尿病の血糖管理目的", created_at: dt(4,3,11) },
    // P5: 渡辺健二 - 4/1入院→4/9退院、4/14再入院（ブロック注射2回目）
    { patient_id: P5, admission_date: dt(4,1,12), discharge_date: dt(4,9,11), ward: "4B", room: "405", bed_number: "B", status: "discharged", admitted_by: DOCTOR, notes: "腰椎ヘルニア保存的治療", created_at: dt(4,1,12) },
    { patient_id: P5, admission_date: dt(4,14,10), ward: "4B", room: "405", bed_number: "B", status: "admitted", admitted_by: DOCTOR, notes: "神経ブロック注射2回目", created_at: dt(4,14,10) },
  ];
}

function generateInstructions() {
  return [
    // P1: 田中太郎
    { patient_id: P1, instruction_type: "activity", content: "病棟内フリー。階段昇降は避ける。", is_active: false, start_date: d(4,1), end_date: d(4,7), created_by: DOCTOR, created_at: dt(4,1,10) },
    { patient_id: P1, instruction_type: "diet", content: "塩分6g/日制限食", is_active: false, start_date: d(4,1), end_date: d(4,7), created_by: DOCTOR, created_at: dt(4,1,10) },
    { patient_id: P1, instruction_type: "monitoring", content: "バイタルサイン3検/日（朝・昼・夕）", is_active: false, start_date: d(4,1), end_date: d(4,7), created_by: DOCTOR, created_at: dt(4,1,10) },
    { patient_id: P1, instruction_type: "iv", content: "ヘパリンナトリウム5000単位 12時間毎（DVT予防）", is_active: false, start_date: d(4,1), end_date: d(4,3), created_by: DOCTOR, created_at: dt(4,1,10) },
    { patient_id: P1, instruction_type: "other", content: "胸痛発作時: ニトロ舌下投与後、改善なければ当直医コール", is_active: false, start_date: d(4,1), end_date: d(4,7), created_by: DOCTOR, created_at: dt(4,1,10) },

    // P2: 佐藤花子
    { patient_id: P2, instruction_type: "activity", content: "ベッド上安静→解熱後は病棟内フリー", is_active: false, start_date: d(4,6), end_date: d(4,10), created_by: DOCTOR, created_at: dt(4,6,14) },
    { patient_id: P2, instruction_type: "diet", content: "通常食。水分摂取を促す（1500mL/日以上）", is_active: false, start_date: d(4,6), end_date: d(4,10), created_by: DOCTOR, created_at: dt(4,6,14) },
    { patient_id: P2, instruction_type: "oxygen", content: "SpO2 95%以下で酸素2L/min開始", is_active: false, start_date: d(4,6), end_date: d(4,10), created_by: DOCTOR, created_at: dt(4,6,14) },
    { patient_id: P2, instruction_type: "monitoring", content: "体温4検/日、SpO2モニタリング、水分出納記録", is_active: false, start_date: d(4,6), end_date: d(4,10), created_by: DOCTOR, created_at: dt(4,6,14) },

    // P3: 鈴木一郎
    { patient_id: P3, instruction_type: "activity", content: "歩行器使用で離床。転倒予防のためナースコール後に離床", is_active: false, start_date: d(4,1), end_date: d(4,8), created_by: DOCTOR, created_at: dt(4,1,10) },
    { patient_id: P3, instruction_type: "diet", content: "通常食", is_active: false, start_date: d(4,1), end_date: d(4,8), created_by: DOCTOR, created_at: dt(4,1,10) },
    { patient_id: P3, instruction_type: "monitoring", content: "転倒リスク高。離床時は見守り。NRS評価3回/日", is_active: false, start_date: d(4,1), end_date: d(4,8), created_by: DOCTOR, created_at: dt(4,1,10) },

    // P4: 高橋美咲 - 現在入院中なのでis_active: true
    { patient_id: P4, instruction_type: "diet", content: "糖尿病食1800kcal/日。分割食6回/日", is_active: true, start_date: d(4,3), created_by: DOCTOR, created_at: dt(4,3,11) },
    { patient_id: P4, instruction_type: "monitoring", content: "SMBG 4検/日（毎食前+就寝前）。低血糖症状に注意", is_active: true, start_date: d(4,3), created_by: DOCTOR, created_at: dt(4,3,11) },
    { patient_id: P4, instruction_type: "activity", content: "病棟内フリー。食後30分の散歩を推奨", is_active: true, start_date: d(4,3), created_by: DOCTOR, created_at: dt(4,3,11) },
    { patient_id: P4, instruction_type: "monitoring", content: "胎動カウント 毎日実施。10回/時間未満なら報告", is_active: true, start_date: d(4,9), created_by: DOCTOR, created_at: dt(4,9,10) },
    { patient_id: P4, instruction_type: "other", content: "破水・出血・胎動減少時は直ちに産科当直コール", is_active: true, start_date: d(4,3), created_by: DOCTOR, created_at: dt(4,3,11) },

    // P5: 渡辺健二 - 再入院中
    { patient_id: P5, instruction_type: "activity", content: "コルセット着用で離床。重量物持ち上げ禁止", is_active: true, start_date: d(4,14), created_by: DOCTOR, created_at: dt(4,14,10) },
    { patient_id: P5, instruction_type: "monitoring", content: "下肢しびれ・筋力低下チェック。膀胱直腸障害に注意", is_active: true, start_date: d(4,14), created_by: DOCTOR, created_at: dt(4,14,10) },
    { patient_id: P5, instruction_type: "other", content: "ブロック注射後30分安静。その後異常なければ離床可", is_active: true, start_date: d(4,14), created_by: DOCTOR, created_at: dt(4,14,10) },
  ];
}

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  電子カルテ フルリセット＆シード     ║");
  console.log("╚══════════════════════════════════════╝\n");

  // ===== STEP 1: 全削除 =====
  console.log("━━━ 全データ削除 ━━━");
  await deleteAllData();
  await deleteAllUsers();
  console.log("");

  // ===== STEP 2: ユーザー作成 =====
  console.log("━━━ データ投入 ━━━");
  const userIds = await createUsers();
  DOCTOR = userIds[0];
  NURSE  = userIds[1];
  REHAB  = userIds[2];

  if (!DOCTOR || !NURSE || !REHAB) {
    console.error("\n✗ ユーザー作成に失敗したため中断します。");
    process.exit(1);
  }

  // ===== STEP 3: 患者・アレルギー =====
  console.log("[患者]");
  await insert("patients", PATIENTS);

  console.log("[アレルギー]");
  await insert("allergies", ALLERGIES);

  // ===== STEP 4: 記録データ =====
  console.log("[バイタルサイン]");
  const vitals = generateVitals();
  await insert("vitals", vitals);

  console.log("[経過記録]");
  const notes = generateProgressNotes();
  await insert("progress_notes", notes);

  console.log("[処方]");
  const rx = generatePrescriptions();
  await insert("prescriptions", rx);

  console.log("[オーダー]");
  const orders = generateOrders();
  await insert("orders", orders);

  console.log("[文書]");
  const docs = generateDocuments();
  await insert("documents", docs);

  console.log("[入退院]");
  const admissions = generateAdmissions();
  await insert("admissions", admissions);

  console.log("[指示簿]");
  const instructions = generateInstructions();
  await insert("instructions", instructions);

  // ===== 完了 =====
  const total = vitals.length + notes.length + rx.length + orders.length + docs.length + admissions.length + instructions.length;
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║  完了                                ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`ユーザー: ${USERS.length}名, 患者: ${PATIENTS.length}名, アレルギー: ${ALLERGIES.length}件`);
  console.log(`バイタル: ${vitals.length}, 経過記録: ${notes.length}, 処方: ${rx.length}, オーダー: ${orders.length}, 文書: ${docs.length}, 入退院: ${admissions.length}, 指示: ${instructions.length}`);
  console.log(`記録合計: ${total}件`);
  console.log("\nログイン情報:");
  USERS.forEach(u => console.log(`  ${u.display_name.padEnd(10)} ${u.email.padEnd(22)} パスワード: ${u.password}`));
}

main().catch(console.error);
