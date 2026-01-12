/**
 * @chunk 7.24 - Export PDF
 * PDF export utility for Visual QA reports
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CapturedAsset, Issue } from '../../../types/qa';

export async function exportToPdf(asset: CapturedAsset, issues: Issue[]) {
  // Capture the viewer element
  const viewer = document.querySelector('[data-qa-viewer]');
  if (!viewer) throw new Error('Viewer not found');

  const canvas = await html2canvas(viewer as HTMLElement, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');

  // Create PDF
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  // Add annotated image
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

  // Add issue summary page
  pdf.addPage();
  pdf.setFontSize(24);
  pdf.text('Visual QA Report', 40, 60);

  pdf.setFontSize(12);
  let y = 100;

  for (const issue of issues) {
    if (y > pdf.internal.pageSize.height - 60) {
      pdf.addPage();
      y = 60;
    }

    const statusColor = issue.status === 'fail' ? '#ef4444' : issue.status === 'warn' ? '#eab308' : '#22c55e';
    pdf.setTextColor(statusColor);
    pdf.text(`#${issue.number} [${issue.status.toUpperCase()}]`, 40, y);

    pdf.setTextColor('#000000');
    pdf.text(issue.message, 40, y + 16);

    if (issue.suggestion) {
      pdf.setTextColor('#666666');
      pdf.text(`Fix: ${issue.suggestion.cssVariable}`, 40, y + 32);
    }

    y += 60;
  }

  pdf.save(`qa-report-${Date.now()}.pdf`);
}
