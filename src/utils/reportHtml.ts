import { AnswerMap, ConditionSchema, DiaryEntry, RepeatableValue } from '../types/questionnaire';
import { AppUser } from '../types/domain';

function esc(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderAnswerRow(label: string, value: string): string {
  if (!value) return '';
  return `<tr><td class="label">${esc(label)}</td><td>${esc(value)}</td></tr>`;
}

function renderRepeatableTable(title: string, columns: { key: string; label: string }[], rows: RepeatableValue): string {
  if (!rows || rows.length === 0) return '';
  const header = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${esc(row[c.key] ?? '')}</td>`).join('')}</tr>`)
    .join('');
  return `<h3>${esc(title)}</h3><table class="data">${header ? `<tr>${header}</tr>` : ''}${body}</table>`;
}

export function buildReportHtml(entry: DiaryEntry, schema: ConditionSchema, patient: AppUser): string {
  const answers: AnswerMap = entry.answers;

  const simpleRows = schema.steps
    .filter((s) => s.type !== 'repeatable' && s.type !== 'photo')
    .map((s) => renderAnswerRow(s.question, answers[s.id] as string))
    .join('');

  const repeatableTables = schema.steps
    .filter((s) => s.type === 'repeatable' && s.repeatableFields)
    .map((s) =>
      renderRepeatableTable(
        s.question,
        s.repeatableFields!.map((f) => ({ key: f.key, label: f.label })),
        (answers[s.id] as RepeatableValue) ?? []
      )
    )
    .join('');

  const findingsHtml = entry.findings
    ? `<h3>Positive findings on social history</h3><table class="data"><tr><th>Finding</th><th>Likelihood</th></tr>${entry.findings
        .map((f) => `<tr${f.flag === 'red' ? ' class="redflag"' : ''}><td>${esc(f.label)}</td><td>${f.percent}%</td></tr>`)
        .join('')}</table>`
    : '';

  const note = entry.doctorNote;
  const planHtml = note
    ? `<h3>Current management plan</h3>
       <p><b>Date:</b> ${esc(new Date(note.createdAt).toLocaleDateString())}</p>
       <p><b>Doctor's note:</b> ${esc(note.doctorName)}</p>
       <p>${esc(note.note)}</p>
       ${note.signatureUri ? `<img class="sig" src="${note.signatureUri}" />` : ''}`
    : `<h3>Current management plan</h3><p><i>Awaiting doctor review.</i></p>`;

  return `
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1F2A33; padding: 24px;">
    <div style="background:#1AA6A6; color:#fff; border-radius:12px; padding:16px; margin-bottom:16px;">
      <h2 style="margin:0;">HealthMantra — ${esc(schema.name)}</h2>
      <p style="margin:4px 0 0;">Patient: ${esc(patient.name)} &nbsp;&nbsp; Unique ID: ${esc(patient.id.slice(0, 8))}</p>
    </div>
    <style>
      h3 { color: #D64545; margin-top: 20px; }
      table.data { border-collapse: collapse; width: 100%; margin-top: 8px; }
      table.data td, table.data th { border: 1px solid #ccc; padding: 6px 8px; font-size: 13px; text-align: left; }
      table { width: 100%; }
      td.label { font-weight: 600; width: 45%; vertical-align: top; }
      tr.redflag td { color: #D64545; font-weight: 700; }
      img.sig { max-width: 220px; margin-top: 8px; }
    </style>
    <table>${simpleRows}</table>
    ${repeatableTables}
    ${findingsHtml}
    ${planHtml}
  </body>
  </html>`;
}
